import colorsDb from './vscode-colors-db.json';

interface ColorDef {
    id: string;
    description: string;
    file: string;
    code?: string;
    line?: number;
}

const tbody = document.getElementById('github-files-tbody')!;
const searchInput = document.getElementById('ref-search') as HTMLInputElement;
const countSpan = document.getElementById('ref-count')!;
const syncBtn = document.getElementById('sync-github-btn')!;
const terminalView = document.getElementById('terminal-view')!;
const terminalOutput = document.getElementById('terminal-output')!;

// Dynamically build the files list from the database
const filesWithColors = Array.from(new Set((colorsDb as ColorDef[]).map(c => c.file))).sort();

// Create mockup commit messages for each file path
const getMockupInfo = (filepath: string) => {
    const basename = filepath.split('/').pop() || '';
    const coreCommits: Record<string, { commit: string, date: string }> = {
        'baseColors.ts': { commit: 'Add strongForeground color for enhanced text legibility in high contrast themes', date: '3 months ago' },
        'chartsColors.ts': { commit: 'ESM merge to main (#227184)', date: '2 years ago' },
        'editorColors.ts': { commit: 'Update editor widget border color to use transparent foreground instead of opaque colors (#310175)', date: '3 months ago' },
        'inputColors.ts': { commit: 'refactor: update button styles and colors for improved consistency across all input fields', date: 'last month' },
        'listColors.ts': { commit: 'ESM merge to main (#227184)', date: '2 years ago' },
        'menuColors.ts': { commit: 'Refactor menu separator background color to use transparent foreground instead of hardcoded values', date: '3 months ago' },
        'minimapColors.ts': { commit: 'Reuse editor colors in the minimap (#283365)', date: '7 months ago' },
        'miscColors.ts': { commit: 'fix: update badge colors and adjust font size for activity bar to match the latest fluent design guidelines', date: '8 months ago' },
        'quickpickColors.ts': { commit: 'themes: fix match highlight contrast in focused quick pick rows (#202685)', date: '2 months ago' },
        'searchColors.ts': { commit: 'ESM merge to main (#227184)', date: '2 years ago' }
    };

    if (coreCommits[basename]) {
        return coreCommits[basename];
    }
    
    // Auto-generate realistic commit messages for non-core files
    const parts = filepath.split('/');
    const component = parts[0] === 'workbench' && parts[1] === 'contrib' && parts[2] ? parts[2] : parts[0] || 'workbench';
    const cleanComponent = component.replace(/^[a-z]/, c => c.toUpperCase());
    return {
        commit: `Update registerColor definitions for ${cleanComponent} theme integration`,
        date: 'last month'
    };
};

const githubFiles = filesWithColors.map(filepath => {
    const info = getMockupInfo(filepath);
    return {
        name: filepath,
        commit: info.commit,
        date: info.date
    };
});

// Map colorsDb by file
const colorsByFile: Record<string, ColorDef[]> = {};
(colorsDb as ColorDef[]).forEach(color => {
    const filename = color.file || 'platform/theme/common/colors/miscColors.ts';
    if (!colorsByFile[filename]) {
        colorsByFile[filename] = [];
    }
    colorsByFile[filename].push(color);
});

function renderGitHubTable(filterText = '') {
    tbody.innerHTML = '';
    
    // Add the ".." folder row
    const parentRow = document.createElement('tr');
    parentRow.innerHTML = `
        <td>
            <div class="gh-file-name">
                <span class="gh-icon folder">📁</span>
                <span>..</span>
            </div>
        </td>
        <td></td>
        <td></td>
    `;
    tbody.appendChild(parentRow);

    // Filter logic
    const filesToRender = githubFiles.filter(f => {
        if (!filterText) return true;
        const fileMatches = f.name.toLowerCase().includes(filterText.toLowerCase());
        const colors = colorsByFile[f.name] || [];
        const colorMatches = colors.some(c => c.id.toLowerCase().includes(filterText.toLowerCase()) || c.description.toLowerCase().includes(filterText.toLowerCase()));
        return fileMatches || colorMatches;
    });

    // Calculate total matching color variables
    let totalMatchingColors = 0;
    filesToRender.forEach(file => {
        const colorsInFile = colorsByFile[file.name] || [];
        const filteredColors = colorsInFile.filter(c => {
            if (!filterText) return true;
            if (file.name.toLowerCase().includes(filterText.toLowerCase())) return true;
            return c.id.toLowerCase().includes(filterText.toLowerCase()) || c.description.toLowerCase().includes(filterText.toLowerCase());
        });
        totalMatchingColors += filteredColors.length;
    });

    countSpan.textContent = `Showing ${filesToRender.length} files (${totalMatchingColors} variables)`;

    filesToRender.forEach(file => {
        const fileRow = document.createElement('tr');
        
        fileRow.innerHTML = `
            <td>
                <div class="gh-file-name">
                    <span class="gh-icon file">📄</span>
                    <span class="file-name-text">${file.name}</span>
                </div>
            </td>
            <td>
                <span class="gh-commit-msg" title="${file.commit}">${file.commit}</span>
            </td>
            <td class="gh-date">${file.date}</td>
        `;
        
        const contentRow = document.createElement('tr');
        contentRow.className = 'gh-file-content-row';
        contentRow.style.display = 'none';
        
        // Render colors inside this file
        const colorsInFile = colorsByFile[file.name] || [];
        // Apply filter to the specific colors if needed
        const filteredColors = colorsInFile.filter(c => {
            if (!filterText) return true;
            return c.id.toLowerCase().includes(filterText.toLowerCase()) || c.description.toLowerCase().includes(filterText.toLowerCase());
        });

        let colorsHtml = filteredColors.map(color => {
            const githubLink = `https://github.com/microsoft/vscode/blob/main/src/vs/${color.file}#L${color.line || 1}`;
            return `
                <div class="gh-color-row">
                    <div class="gh-color-id">
                        <a href="${githubLink}" target="_blank" class="gh-color-link" title="Open source definition at line ${color.line || 1}">${color.id}</a>
                    </div>
                    <div class="gh-color-desc">${color.description}</div>
                </div>
            `;
        }).join('');
        
        if (filteredColors.length === 0) {
            colorsHtml = '<div style="padding: 10px; color: #57606a;">No colors defined or matching search in this file.</div>';
        }

        contentRow.innerHTML = `
            <td colspan="3">
                <div class="gh-file-content">
                    <div class="gh-file-content-title">
                        Color variables defined in ${file.name}
                    </div>
                    ${colorsHtml}
                </div>
            </td>
        `;

        // Toggle file content view on clicking file name
        const fileNameSpan = fileRow.querySelector('.file-name-text')!;
        fileNameSpan.addEventListener('click', () => {
            const isHidden = contentRow.style.display === 'none';
            contentRow.style.display = isHidden ? 'table-row' : 'none';
        });

        tbody.appendChild(fileRow);
        tbody.appendChild(contentRow);
    });
}


// --- Terminal Simulation ---
const terminalLines = [
    "$ git clone --depth 1 https://github.com/microsoft/vscode.git",
    "Cloning into 'vscode'...",
    "remote: Enumerating objects: 3848, done.",
    "remote: Counting objects: 100% (3848/3848), done.",
    "remote: Compressing objects: 100% (2314/2314), done.",
    "Receiving objects: 100% (3848/3848), 12.45 MiB | 8.21 MiB/s, done.",
    "Resolving deltas: 100% (214/214), done.",
    "Updating files: 100% (14352/14352), done.",
    "$ node scripts/extractor/extractColors.js",
    "Reading listColors.ts (215 lines)... SUCCESS",
    "Reading baseColors.ts (412 lines)... SUCCESS",
    "Reading editorColors.ts (942 lines)... SUCCESS",
    "Parsing registerColor AST syntax trees... SUCCESS",
    "Validating extracted color keys against theme schemas... SUCCESS",
    "Exporting output db variables to src/vscode-colors-db.json...",
    "Done! Successfully extracted 253 color definitions directly from repository source code."
];

async function runTerminalSimulation() {
    syncBtn.setAttribute('disabled', 'true');
    terminalView.style.display = 'block';
    terminalOutput.textContent = '';
    
    for (const line of terminalLines) {
        terminalOutput.textContent += line + '\n';
        terminalView.scrollTop = terminalView.scrollHeight;
        const delay = line.startsWith('$') ? 800 : line.includes('Reading') ? 400 : 150;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    syncBtn.removeAttribute('disabled');
    renderGitHubTable(searchInput.value);
}

syncBtn.addEventListener('click', runTerminalSimulation);
searchInput.addEventListener('input', (e) => renderGitHubTable((e.target as HTMLInputElement).value));

// Init
renderGitHubTable();
