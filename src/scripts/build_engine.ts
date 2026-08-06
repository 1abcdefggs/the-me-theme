import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { CSSGenerator } from '../theme-engine/CSSGenerator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '../../');
const COLOR_DB_PATH = path.join(ROOT_DIR, 'src/assets/vscode-colors-db.json');
const COMPONENT_TREE_PATH = path.join(ROOT_DIR, 'src/theme-engine/mapping/grouped_by_component.json');
const LAYOUT_TREE_PATH = path.join(ROOT_DIR, 'src/theme-engine/mapping/grouped_by_layout.json');
const OUT_DIR = path.join(ROOT_DIR, 'dist_oss');

console.log('🚀 Starting TheMeTheme Build Engine...');

// 1. Load data
const colorDb = JSON.parse(fs.readFileSync(COLOR_DB_PATH, 'utf8'));
const uiComponents = JSON.parse(fs.readFileSync(COMPONENT_TREE_PATH, 'utf8'));
const layoutComponents = JSON.parse(fs.readFileSync(LAYOUT_TREE_PATH, 'utf8'));

// Build color ID map
const colorMap = new Map<string, any>();
colorDb.forEach((c: any) => colorMap.set(c.id, c));

// 2. Extract all mapped color IDs from tree
const mappedColorIds = new Set<string>();
const mappingDict: Record<string, string[]> = {};

function extractMapping(items: any[]) {
  for (const item of items) {
    if (item.componentId && item.colorIds) {
      mappingDict[item.componentId] = item.colorIds;
      item.colorIds.forEach((id: string) => mappedColorIds.add(id));
    }
    if (item.children) {
      extractMapping(item.children);
    }
  }
}

uiComponents.forEach((cat: any) => extractMapping(cat.children || []));

console.log(`🔗 Mapped Colors: ${mappedColorIds.size}`);

function extractDefaultFromCode(code: string, themeType: 'dark' | 'light'): string | null {
  if (!code) return null;
  
  // 1. Match { dark: '#...' } or { dark: 'color' }
  const darkMatch = code.match(/dark:\s*'([^']+)'/);
  if (darkMatch && themeType === 'dark') return darkMatch[1];

  const lightMatch = code.match(/light:\s*'([^']+)'/);
  if (lightMatch && themeType === 'light') return lightMatch[1];

  // 2. Match { dark: VAR }
  const darkVarMatch = code.match(/dark:\s*([A-Za-z0-9_.]+)/);
  if (darkVarMatch && themeType === 'dark' && darkVarMatch[1] !== 'null') return darkVarMatch[1];

  // 3. Match registerColor('id', '#hex' or 'ref', ...)
  const simpleMatch = code.match(/registerColor\(\s*'[^']+'\s*,\s*'([^']+)'/);
  if (simpleMatch) return simpleMatch[1];

  const refMatch = code.match(/registerColor\(\s*'[^']+'\s*,\s*([A-Za-z0-9_.]+)/);
  if (refMatch && refMatch[1] !== 'null') return refMatch[1];

  return null;
}

const defaultDarkFallback: Record<string, string> = {
  'editor.background': '#1e1e1e',
  'editor.foreground': '#cccccc',
  'sideBar.background': '#252526',
  'sideBar.foreground': '#cccccc',
  'sideBarTitle.foreground': '#cccccc',
  'sideBarSectionHeader.background': '#252526',
  'sideBarSectionHeader.foreground': '#ffffff',
  'activityBar.background': '#333333',
  'activityBar.foreground': '#ffffff',
  'activityBar.activeBorder': '#007acc',
  'statusBar.background': '#007acc',
  'statusBar.foreground': '#ffffff',
  'titleBar.activeBackground': '#3c3c3c',
  'titleBar.activeForeground': '#cccccc',
  'panel.background': '#1e1e1e',
  'panel.border': '#2d2d30',
  'widget.border': '#333333',
  'list.hoverBackground': '#2a2d2e',
  'list.hoverForeground': '#ffffff',
  'list.activeSelectionBackground': '#094771',
  'list.activeSelectionForeground': '#ffffff',
};

// 3. CSS generation function (dark / light)
function generateCSS(themeType: 'dark' | 'light'): string {
  let css = `/* --------------------------------------------------------\n`;
  css += `   TheMeTheme: Auto-Generated Zero Runtime Cost Base CSS (${themeType.toUpperCase()})\n`;
  css += `   -------------------------------------------------------- */\n`;
  css += `:root {\n`;

  colorDb.forEach((def: any) => {
    let rawVal = def.defaults ? def.defaults[themeType] : null;
    if (!rawVal) {
      rawVal = extractDefaultFromCode(def.code, themeType);
    }
    if (!rawVal && themeType === 'dark' && defaultDarkFallback[def.id]) {
      rawVal = defaultDarkFallback[def.id];
    }

    const cssVarName = `--vscode-${def.id.replace(/\./g, '-')}`;

    if (rawVal) {
      const cssVal = CSSGenerator.convertToCSSValue(String(rawVal));
      css += `  ${cssVarName}: ${cssVal};\n`;
    } else if (defaultDarkFallback[def.id]) {
      css += `  ${cssVarName}: ${defaultDarkFallback[def.id]};\n`;
    }
  });

  css += `}\n`;
  return css;
}

// 4. File output
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

console.log('⚙️ Writing output assets to dist_oss/...');
fs.writeFileSync(path.join(OUT_DIR, 'theme-base-dark.css'), generateCSS('dark'), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'theme-base-light.css'), generateCSS('light'), 'utf8');

const clientData = {
  uiTree: {
    byCategory: uiComponents,
    byLayout: layoutComponents
  },
  mapping: mappingDict
};

fs.writeFileSync(path.join(OUT_DIR, 'client-data.json'), JSON.stringify(clientData, null, 2), 'utf8');

console.log(`✅ Build Complete! Assets created at: ${OUT_DIR}`);
console.log(`   - theme-base-dark.css`);
console.log(`   - theme-base-light.css`);
console.log(`   - client-data.json`);
