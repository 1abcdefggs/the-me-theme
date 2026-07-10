import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

const srcDir = 'c:\\vscode\\src\\vs';
const dbPath = path.join(process.cwd(), 'src', 'vscode-colors-db.json');

interface ColorDef {
    id: string;
    description: string;
    file: string;
    code?: string;
    line?: number;
}

const colors: ColorDef[] = [];

// Recursive directory walk
function getTsFiles(dir: string, fileList: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'out') {
                getTsFiles(filePath, fileList);
            }
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
            fileList.push(filePath);
        }
    }
    return fileList;
}

function extractColorsFromFile(filePath: string) {
    const code = fs.readFileSync(filePath, 'utf-8');
    
    // Performance optimization: skip parsing files that don't register colors
    if (!code.includes('registerColor')) {
        return;
    }

    const sourceFile = ts.createSourceFile(
        filePath,
        code,
        ts.ScriptTarget.Latest,
        true
    );

    function visit(node: ts.Node) {
        if (ts.isCallExpression(node)) {
            const expression = node.expression;
            if (ts.isIdentifier(expression) && expression.text === 'registerColor') {
                const args = node.arguments;
                if (args.length >= 3) {
                    // Arg 0: id
                    const idNode = args[0];
                    let id = '';
                    if (ts.isStringLiteral(idNode)) {
                        id = idNode.text;
                    }

                    // Arg 2: description
                    const descNode = args[2];
                    let description = '';
                    if (ts.isStringLiteral(descNode)) {
                        description = descNode.text;
                    } else if (ts.isCallExpression(descNode)) {
                        const nlsArgs = descNode.arguments;
                        if (nlsArgs.length >= 2 && ts.isStringLiteral(nlsArgs[1])) {
                            description = nlsArgs[1].text;
                        } else if (nlsArgs.length >= 1 && ts.isStringLiteral(nlsArgs[0])) {
                            description = nlsArgs[0].text;
                        }
                    }

                    if (id) {
                        const { line } = ts.getLineAndCharacterOfPosition(sourceFile, node.getStart());
                        
                        // Relative path from c:\vscode\src\vs
                        const relativeFile = path.relative(srcDir, filePath).replace(/\\/g, '/');

                        colors.push({ 
                            id, 
                            description, 
                            file: relativeFile,
                            code: node.getText(),
                            line: line + 1 // 1-indexed line number
                        });
                    }
                }
            }
        }
        ts.forEachChild(node, visit);
    }

    visit(sourceFile);
}

function run() {
    if (!fs.existsSync(srcDir)) {
        console.error(`Error: Cannot find VS Code src directory at ${srcDir}. Make sure VS Code repo is cloned there.`);
        process.exit(1);
    }

    console.log(`Scanning directory recursively: ${srcDir}...`);
    const files = getTsFiles(srcDir);
    console.log(`Found ${files.length} TS/TSX files. Scanning for color registrations...`);

    for (const file of files) {
        extractColorsFromFile(file);
    }
    
    // Sort alphabetically by ID
    colors.sort((a, b) => a.id.localeCompare(b.id));

    // Remove duplicates (sometimes colors are re-registered or referenced twice)
    const uniqueColors: ColorDef[] = [];
    const seen = new Set<string>();
    for (const color of colors) {
        if (!seen.has(color.id)) {
            seen.add(color.id);
            uniqueColors.push(color);
        }
    }

    fs.writeFileSync(dbPath, JSON.stringify(uniqueColors, null, 2));
    console.log(`Successfully extracted ${uniqueColors.length} unique color variables!`);
    console.log(`Database saved to: ${dbPath}`);
}

run();
