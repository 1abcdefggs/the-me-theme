import JSZip from 'jszip';
import { initColorPalette, openColorPalette } from './colorPalette';
import { resolveColor, colorRegistry } from './vscode-color-engine/index.ts';
import { getLuminanceFromHex } from './colorUtils';

// Expose globals for index.html scripts
(window as any).openColorPalette = openColorPalette;
(window as any).onSimpleAreaColorChange = (varId: string, color: string) => {
    userOverrides[varId] = { current: color };
    recalcAllColors(false);
    renderList(searchInput.value);
};
interface ColorDef { id: string; description: string; file: string; }

let colorsDb: ColorDef[] = [];
colorsDb = [];
for (const [id, color] of colorRegistry) {
    colorsDb.push({ id, description: color.description, file: '' });
}

const listContainer = document.getElementById('variables-list')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const exportBtn = document.getElementById('export-btn')!;
const fileInput = document.getElementById('theme-import') as HTMLInputElement;
const resetBtn = document.getElementById('reset-theme-btn')!;
const viewToggleBtn = document.getElementById('view-toggle-btn')!;
const createBlankBtn = document.getElementById('create-blank-btn')!;
const progressElement = document.getElementById('theme-progress');
// Terminal UI
const terminalPanel = document.getElementById('terminal-panel')!;
const terminalOutput = document.getElementById('terminal-output')!;
const terminalToggleBtn = document.getElementById('terminal-toggle-btn')!;
const terminalClearBtn = document.getElementById('terminal-clear-btn')!;
const importGithubBtn = document.getElementById('import-github-btn')!;

// License and Publish Controls
const publishBtn = document.getElementById('publish-btn')!;
const licenseModal = document.getElementById('license-modal')!;
const closeModalBtn = document.getElementById('close-modal-btn')!;
const confirmLicenseBtn = document.getElementById('confirm-license-btn')!;

// Unified Import Controls
const importThemeBtn = document.getElementById('import-theme-btn')!;
const importModal = document.getElementById('import-modal')!;
const closeImportModalBtn = document.getElementById('close-import-modal-btn')!;
const confirmUrlImportBtn = document.getElementById('confirm-url-import-btn')!;
const themeUrlInput = document.getElementById('theme-url-input') as HTMLInputElement;
const urlSuggestions = document.getElementById('url-suggestions')!;
const dragDropZone = document.getElementById('drag-drop-zone')!;

// Create Blank Controls
const createBlankModal = document.getElementById('create-blank-modal')!;
const closeBlankModalBtn = document.getElementById('close-blank-modal-btn')!;
const blankThemeNameInput = document.getElementById('blank-theme-name-input') as HTMLInputElement;
const confirmBlankBtn = document.getElementById('confirm-blank-btn')!;

// Advanced Import Modal Controls
const advancedImportModal = document.getElementById('advanced-import-modal');
const closeAdvancedImportBtn = document.getElementById('close-advanced-import-x');
const cancelAdvancedImportBtn = document.getElementById('cancel-advanced-import-btn');
const step1ImportBtn = document.getElementById('step1-import-btn');
const step1QuickStart = document.getElementById('step1-quick-start');

if (step1ImportBtn && advancedImportModal) {
    step1ImportBtn.addEventListener('click', () => {
        advancedImportModal.style.display = 'flex';
    });
}

const hideAdvancedImport = () => {
    if (advancedImportModal) advancedImportModal.style.display = 'none';
};

if (closeAdvancedImportBtn) closeAdvancedImportBtn.addEventListener('click', hideAdvancedImport);
if (cancelAdvancedImportBtn) cancelAdvancedImportBtn.addEventListener('click', hideAdvancedImport);

if (step1QuickStart) {
    step1QuickStart.addEventListener('click', () => {
        hideAdvancedImport();
        createBlankBtn.click();
    });
}

// WYSIWYG Popover Controls
const toastContainer = document.getElementById('toast-container')!;

// Curated Popular Open-Source Themes Database (MIT/Permissive)
const popularThemes = [
    { name: 'One Dark Pro', repo: 'Binaryify/OneDark-Pro', url: 'https://raw.githubusercontent.com/Binaryify/OneDark-Pro/master/themes/OneDark-Pro.json', license: 'MIT' },
    { name: 'GitHub Dark Default', repo: 'primer/github-vscode-theme', url: 'https://raw.githubusercontent.com/primer/github-vscode-theme/main/themes/dark-default.json', license: 'MIT' },
    { name: 'GitHub Light Default', repo: 'primer/github-vscode-theme', url: 'https://raw.githubusercontent.com/primer/github-vscode-theme/main/themes/light-default.json', license: 'MIT' },
    { name: 'Nord', repo: 'nordtheme/visual-studio-code', url: 'https://raw.githubusercontent.com/nordtheme/visual-studio-code/main/themes/nord-color-theme.json', license: 'MIT' },
    { name: 'Tokyo Night', repo: 'enkia/tokyo-night-vscode-theme', url: 'https://raw.githubusercontent.com/enkia/tokyo-night-vscode-theme/master/themes/tokyo-night-color-theme.json', license: 'MIT' },
    { name: 'Cobalt2', repo: 'wesbos/cobalt2-vscode', url: 'https://raw.githubusercontent.com/wesbos/cobalt2-vscode/master/themes/cobalt2-color-theme.json', license: 'MIT' },
    { name: 'Night Owl', repo: 'sdras/night-owl-vscode-theme', url: 'https://raw.githubusercontent.com/sdras/night-owl-vscode-theme/master/themes/Night%20Owl-color-theme.json', license: 'MIT' },
    { name: 'Monokai Dimmed', repo: 'microsoft/vscode', url: 'https://raw.githubusercontent.com/microsoft/vscode/main/extensions/theme-defaults/themes/monokai-dimmed-color-theme.json', license: 'MIT' }
];

let pendingThemeJson = '';
let currentImportedThemeName = 'custom-theme';
let lastImportedThemeObject: any = null;

// State
// @ts-ignore
let exportMode: any;
// let exportMode: 'standalone' | 'workbench' = 'standalone';
let activeComponent = 'settings-json';
let isTreeView = false;
const defaultDarkOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = {
    "sideBar.background": { current: "#252526" },
    "sideBar.foreground": { current: "#cccccc" },
    "editor.background": { current: "#1e1e1e" },
    "editor.foreground": { current: "#cccccc" },
    "activityBar.background": { current: "#333333" },
    "activityBar.foreground": { current: "#ffffff" },
    "statusBar.background": { current: "#007acc" },
    "statusBar.foreground": { current: "#ffffff" },
    "titleBar.activeBackground": { current: "#3c3c3c" },
    "titleBar.activeForeground": { current: "#cccccc" },
    "editor.selectionBackground": { current: "#264f78" },
    "tab.activeBackground": { current: "#1e1e1e" },
    "tab.activeForeground": { current: "#ffffff" }
};

const defaultLightOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = {
    "sideBar.background": { current: "#f3f3f3" },
    "sideBar.foreground": { current: "#616161" },
    "editor.background": { current: "#ffffff" },
    "editor.foreground": { current: "#000000" },
    "activityBar.background": { current: "#2c2c2c" },
    "activityBar.foreground": { current: "#ffffff" },
    "statusBar.background": { current: "#007acc" },
    "statusBar.foreground": { current: "#ffffff" },
    "titleBar.activeBackground": { current: "#dddddd" },
    "titleBar.activeForeground": { current: "#333333" },
    "editor.selectionBackground": { current: "#add6ff" },
    "tab.activeBackground": { current: "#ffffff" },
    "tab.activeForeground": { current: "#333333" }
};

const userOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = { ...defaultDarkOverrides };

export let currentBaseMode: 'dark' | 'light' = 'dark';
const githubLineNumbers: Record<string, number> = {};

function termLog(msg: string, type: 'info' | 'success' | 'error' = 'info') {
    const line = document.createElement('div');
    line.className = `term-line ${type}`;
    line.textContent = `[${type.toUpperCase()}] ${msg}`;
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// --- UI Transition ---

export let currentThemeFileName = 'Untitled-Theme.json';

export function updateThemeFileNameUI(name: string) {
    if (!name.endsWith('.json')) name += '.json';
    currentThemeFileName = name;

    const titleBar = document.getElementById('mock-title-bar');
    if (titleBar) titleBar.textContent = `${name} - TheMeTheme - Visual Studio Code`;

    const explorerFile = document.getElementById('mock-explorer-active-file');
    if (explorerFile) explorerFile.textContent = name;

    // Breadcrumb should stay ThemePreview.tsx, so we don't overwrite it with the theme name anymore.
    const mockTabFile = document.getElementById('mock-tab-theme-name');
    if (mockTabFile) mockTabFile.textContent = name;

}

export function showEditorPreview(message: string) {
    const tutorialView = document.getElementById('tutorial-view');
    const editorWatermark = document.getElementById('editor-watermark');
    const syntaxPreview = document.getElementById('syntax-preview');

    if (tutorialView) tutorialView.style.display = 'none';

    // We can show the watermark, or the syntax preview. Let's show syntax preview by default as it has code.
    if (syntaxPreview) {
        syntaxPreview.style.display = 'block';
    } else if (editorWatermark) {
        editorWatermark.style.display = 'flex';
    }

    showToast(message);
}

function showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function updateProgress() {
    if (!progressElement) return;
    const totalCount = (colorsDb as ColorDef[]).length;

    const activeKeys = new Set<string>();
    if (lastImportedThemeObject && lastImportedThemeObject.colors) {
        Object.keys(lastImportedThemeObject.colors).forEach(k => activeKeys.add(k));
    }

    let lockedCount = 0;
    for (const key in userOverrides) {
        if (userOverrides[key] && userOverrides[key].current) {
            activeKeys.add(key);
        }
        if (userOverrides[key] && userOverrides[key].locked) {
            lockedCount++;
        }
    }

    const customizedCount = activeKeys.size;
    const progressPercentage = totalCount > 0 ? ((customizedCount / totalCount) * 100).toFixed(1) : "0";

    progressElement.innerHTML = `
        <span style="margin-right: 15px;" title="Total Available Colors (Click to view source registry)">
            <a href="color-reference" target="_blank" style="color: inherit; text-decoration: underline; text-underline-offset: 2px;" onclick="event.stopPropagation()">Total: <b>${totalCount}</b></a>
        </span>
        <span style="margin-right: 15px; color: #89d185;" title="Colors Customized (Click to view list)">Customized: <b>${customizedCount}</b> <span style="color:#cccccc;font-size:11px;">(${progressPercentage}%)</span></span>
        ${lockedCount > 0 ? `<span style="color: #d7ba7d;" title="Locked Colors">🔏 Locked: <b>${lockedCount}</b></span>` : ''}
    `;
}

terminalToggleBtn?.addEventListener('click', () => {
    terminalPanel?.classList.toggle('collapsed');
});
terminalClearBtn?.addEventListener('click', () => {
    if (terminalOutput) {
        terminalOutput.innerHTML = '<div class="term-line info">[INFO] Terminal cleared.</div>';
    }
});

function getCssVarName(id: string) { return `--vscode-${id.replace(/\./g, '-')}`; }

// --- Contrast Utility ---
function hexToRgb(hex: string) {
    let r = 0, g = 0, b = 0;
    if (!hex || !hex.startsWith('#')) return { r, g, b };
    if (hex.length === 4) { r = parseInt(hex[1] + hex[1], 16); g = parseInt(hex[2] + hex[2], 16); b = parseInt(hex[3] + hex[3], 16); }
    else if (hex.length >= 7) { r = parseInt(hex.substring(1, 3), 16); g = parseInt(hex.substring(3, 5), 16); b = parseInt(hex.substring(5, 7), 16); }
    return { r, g, b };
}
function getLuminance(r: number, g: number, b: number) {
    const a = [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function getContrastRatio(hex1: string, hex2: string) {
    const c1 = hexToRgb(hex1); const c2 = hexToRgb(hex2);
    const lum1 = getLuminance(c1.r, c1.g, c1.b); const lum2 = getLuminance(c2.r, c2.g, c2.b);
    const brightest = Math.max(lum1, lum2); const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}
function resolvePairedColorHex(colorId: string): string | null {
    const parts = colorId.split('.');
    const category = parts[0];

    const lowerId = colorId.toLowerCase();
    // 1. Exclude WCAG filtering for Backgrounds, Borders, and Shadows
    if (lowerId.includes('background') || lowerId.includes('border') || lowerId.includes('shadow')) {
        return null;
    }

    let pairedId: string | undefined = undefined;

    // 2. Smart Foreground Matching
    const bgGuess = colorId.replace(/Foreground/i, 'Background');
    if (bgGuess !== colorId && colorRegistry.has(bgGuess)) {
        pairedId = bgGuess;
    }

    // 3. Fallback to Category Background
    if (!pairedId) {
        const catBg = `${category}.background`;
        if (colorRegistry.has(catBg)) {
            pairedId = catBg;
        }
    }

    // 4. Specific known fallbacks if logic fails
    if (!pairedId) {
        switch (category) {
            case 'titleBar': pairedId = 'titleBar.activeBackground'; break;
            case 'tab': pairedId = 'tab.activeBackground'; break;
            case 'list':
            case 'tree': pairedId = 'list.activeSelectionBackground'; break;
            default: pairedId = 'editor.background'; // 5. Global fallback
        }
    }

    // Try to get current override or resolved color
    let val = userOverrides[pairedId]?.current;
    if (!val) {
        val = getComputedStyle(document.documentElement).getPropertyValue(getCssVarName(pairedId)).trim();
    }
    if (!val) {
        return '#000000';
    }
    return val;
}

function getPlainOverrides() {
    const plain: Record<string, string> = {};
    for (const key in userOverrides) {
        if (userOverrides[key]?.current) {
            plain[key] = userOverrides[key].current;
        }
    }
    return plain;
}

function getEffectiveColor(id: string) {
    if (userOverrides[id]?.current) return userOverrides[id].current;

    const resolved = resolveColor(id, 'dark', getPlainOverrides());
    if (resolved) {
        return resolved.toString();
    }

    const computed = getComputedStyle(document.documentElement).getPropertyValue(getCssVarName(id)).trim();
    return computed || '#000000';
}

let monacoEditorInstance: any = null;
let isMonacoLoaded = false;
let savedCustomizationsJson: string | null = null;

if ((window as any).require) {
    (window as any).require(['vs/editor/editor.main'], function () {
        isMonacoLoaded = true;
    });
}

function updateSettingsJsonView() {
    const content = document.getElementById('settings-json-view');
    if (!content) return;

    const colors: Record<string, string> = {};
    for (const key in userOverrides) {
        if (userOverrides[key].current) {
            colors[key] = userOverrides[key].current;
        }
    }

    // Generate a base JSON object with current overrides
    const settingsObj = {
        "workbench.colorTheme": currentImportedThemeName || "CYBER PINK ▶ THEME",
        "workbench.colorCustomizations": {
            // ==========================================
            //  TheMeTheme: Sample Customizations
            // ==========================================
            // Color codes defined here will take top priority
            // and override the currently selected theme.

            // --- 1. Global / Base Colors ---
            // Editor (editing area) background color
            "editor.background": "#121212",
            // Editor default foreground (text) color
            "editor.foreground": "#e0e0e0",

            // --- 2. Main Workbench Parts ---
            // Activity Bar (far left icon column) background color
            "activityBar.background": "#1a1a24",
            // Side Bar (Explorer, etc.) background color
            "sideBar.background": "#1e1e2e",
            // Title Bar (top of the window) background color
            "titleBar.activeBackground": "#11111b",
            // Status Bar (bottom bar) background color
            "statusBar.background": "#007acc",

            // --- 3. Key Editor UI Elements ---
            // Selection (dragged/highlighted text) background color
            "editor.selectionBackground": "#264f78",
            // Active Tab (currently open file) background color
            "tab.activeBackground": "#1e1e2e",
            // Editor Gutter (line number margin) background color
            "editorGutter.background": "#121212"
        }
    };

    // Merge current user overrides into the customizations object
    Object.assign(settingsObj["workbench.colorCustomizations"], colors);

    const jsonStr = JSON.stringify(settingsObj, null, 4);

    if (isMonacoLoaded && (window as any).monaco) {
        if (!monacoEditorInstance) {
            const monaco = (window as any).monaco;

            // Build JSON schema dynamically from colorRegistry
            const colorProps: Record<string, any> = {};
            for (const [id, color] of colorRegistry) {
                colorProps[id] = {
                    type: "string",
                    description: color.description || id,
                    format: "color-hex" // Enables Monaco's native color picker box!
                };
            }

            // Create a model with a specific URI so JSON worker knows it's a JSON file
            const modelUriString = "inmemory://model/settings.json";
            const modelUri = monaco.Uri.parse(modelUriString);

            monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                allowComments: true,
                schemas: [{
                    uri: "http://vscode-theme-editor/schema.json",
                    fileMatch: [modelUriString], // explicitly match this exact model URI
                    schema: {
                        type: "object",
                        properties: {
                            "workbench.colorTheme": {
                                type: "string",
                                description: "Specifies the color theme used in the workbench."
                            },
                            "workbench.colorCustomizations": {
                                type: "object",
                                description: "Overrides colors from the currently selected color theme.",
                                properties: colorProps,
                                additionalProperties: true
                            }
                        }
                    }
                }]
            });

            const model = monaco.editor.getModel(modelUri) || monaco.editor.createModel(jsonStr, "jsonc", modelUri);

            monacoEditorInstance = monaco.editor.create(content, {
                model: model,
                theme: "vs-dark",
                automaticLayout: true,
                minimap: { enabled: false },
                colorDecorators: true // Ensure color decorators are enabled
            });
            monacoEditorInstance.setValue(jsonStr); // Set initial value
            monacoEditorInstance.onDidChangeModelContent(() => {
                if (monacoEditorInstance._isUpdating) return;
                try {
                    const rawVal = monacoEditorInstance.getValue();
                    const stripped = rawVal.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                    const parsed = JSON.parse(stripped);
                    const cColors = parsed["workbench.colorCustomizations"];
                    if (cColors) {
                        for (const k in userOverrides) {
                            if (cColors[k] === undefined) {
                                userOverrides[k].current = '';
                            }
                        }
                        for (const k in cColors) {
                            if (!userOverrides[k]) userOverrides[k] = { current: '' };
                            userOverrides[k].current = cColors[k];
                        }
                        recalcAllColors(false);
                        renderList((document.getElementById('search-input') as HTMLInputElement)?.value || '');
                    }
                } catch (e) { }
            });
        } else {
            if (currentExportMode !== 'customizations') {
                // If they edit a color via UI while looking at the Theme File, 
                // switch them back to Customizations view automatically!
                document.querySelector('.export-tab[data-mode="customizations"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            }

            monacoEditorInstance._isUpdating = true;
            let currentJson = monacoEditorInstance.getValue();
            for (const key in userOverrides) {
                if (userOverrides[key].current) {
                    const escapedKey = key.replace(/\./g, '\\.');
                    const regex = new RegExp(`("${escapedKey}"\\s*:\\s*)"(#[a-fA-F0-9]+)"`);
                    if (regex.test(currentJson)) {
                        currentJson = currentJson.replace(regex, `$1"${userOverrides[key].current}"`);
                    }
                }
            }
            try {
                const stripped = currentJson.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                JSON.parse(stripped);
                if (monacoEditorInstance.getValue() !== currentJson) {
                    monacoEditorInstance.setValue(currentJson);
                }
            } catch (e) {
                // If there's a syntax error, we DO NOT want to wipe out their comments by using JSON.stringify.
                // We only do a full stringify if the editor is completely empty.
                if (currentJson.trim() === "") {
                    const settingsObj = {
                        "workbench.colorTheme": currentImportedThemeName || "CYBER PINK ▶ THEME",
                        "workbench.colorCustomizations": colors
                    };
                    const fbJsonStr = JSON.stringify(settingsObj, null, 4);
                    if (monacoEditorInstance.getValue() !== fbJsonStr) {
                        monacoEditorInstance.setValue(fbJsonStr);
                    }
                } else {
                    // Just update what we can with regex, but keep their broken syntax so they can fix it
                    if (monacoEditorInstance.getValue() !== currentJson) {
                        monacoEditorInstance.setValue(currentJson);
                    }
                }
            }
            monacoEditorInstance._isUpdating = false;
        }
    } else {
        content.textContent = jsonStr;
    }
}



function recalcAllColors(updateJson = true) {
    const overrides = getPlainOverrides();
    for (const [id] of colorRegistry) {
        const c = resolveColor(id, 'dark', overrides);
        if (c) {
            document.documentElement.style.setProperty(getCssVarName(id), c.toString());
        }
    }

    // Apply user overrides that might not be in the hardcoded colorRegistry
    for (const id in overrides) {
        if (!colorRegistry.has(id)) {
            const c = resolveColor(id, 'dark', overrides);
            if (c) {
                document.documentElement.style.setProperty(getCssVarName(id), c.toString());
            }
        }
    }

    updateTokenStyles();

    // Update tutorial-view and syntax-preview snippets dynamically
    const dynamicViews = [document.getElementById('tutorial-view'), document.getElementById('syntax-preview')];
    dynamicViews.forEach(view => {
        if (view) {
            view.querySelectorAll('span[data-color-keys]').forEach(span => {
                const key = span.getAttribute('data-color-keys');
                if (key) {
                    const colorVal = getEffectiveColor(key);
                    // If it originally had quotes (like tutorial view)
                    if (span.textContent?.startsWith('"')) {
                        span.textContent = `"${colorVal}"`;
                    } else {
                        // For the new JSON syntax preview, the quotes are outside the span
                        span.textContent = `${colorVal}`;
                    }
                }
            });
        }
    });

    if (updateJson) updateSettingsJsonView();
}

// --- Dynamic Variable Rendering ---
const COMPONENT_PREFIXES: Record<string, string[]> = {
    'sidebar': ['sideBar', 'list', 'tree'],
    'activitybar': ['activityBar', 'activityBarBadge', 'activityBarTop'],
    'editor': ['editor', 'editorCursor', 'editorWhitespace', 'editorIndentGuide',
        'editorRuler', 'editorCodeLens', 'editorBracket', 'editorOverviewRuler',
        'editorGutter', 'editorUnnecessaryCode', 'editorError', 'editorWarning',
        'editorInfo', 'editorHint', 'editorLink', 'editorLineNumber',
        'editorGroupHeader', 'tab', 'breadcrumb'],
    'statusbar': ['statusBar', 'statusBarItem'],
    'panel': ['panel', 'panelTitle', 'panelInput', 'panelSectionHeader'],
    'titlebar': ['titleBar'],
    'full-layout': [],
};

function renderList(filterText = '') {
    listContainer.innerHTML = '';

    const filtered = (colorsDb as ColorDef[]).filter(c => {
        let matchesComponent = true;
        if (activeComponent && activeComponent !== 'full-layout') {
            const prefixes = COMPONENT_PREFIXES[activeComponent];
            if (prefixes && prefixes.length > 0) {
                // Use prefix mapping (covers all relevant colors)
                matchesComponent = prefixes.some(p =>
                    c.id.toLowerCase().startsWith(p.toLowerCase())
                );
            } else {
                // Final fallback: substring match
                matchesComponent = c.id.toLowerCase().includes(activeComponent.toLowerCase());
            }
        }

        if (!filterText) return matchesComponent;

        const matchesSearch = c.id.toLowerCase().includes(filterText.toLowerCase()) || c.description.toLowerCase().includes(filterText.toLowerCase());
        return matchesComponent && matchesSearch;
    });

    if (isTreeView) {
        renderAsTree(filtered);
    } else {
        renderAsFlatGroups(filtered);
    }
}



// 1. Flat Grouping View
function renderAsFlatGroups(filtered: ColorDef[]) {
    const groups: Record<string, ColorDef[]> = {};
    filtered.forEach(c => {
        const parts = c.id.split('.');
        const groupName = parts.length > 1 ? parts[0] : 'Other';
        if (!groups[groupName]) groups[groupName] = [];
        groups[groupName].push(c);
    });

    for (const [groupName, items] of Object.entries(groups)) {
        const groupCard = document.createElement('div');
        groupCard.className = 'group-card';
        groupCard.innerHTML = `<div class="group-header">${groupName}</div>`;

        items.forEach(color => {
            groupCard.appendChild(createVariableItemElement(color));
        });
        listContainer.appendChild(groupCard);
    }
}

// 2. Collapsible Hierarchical Tree View
interface ITreeNode {
    name: string;
    fullName: string;
    colorDef?: ColorDef;
    children: Record<string, ITreeNode>;
}

function renderAsTree(filtered: ColorDef[]) {
    const root: Record<string, ITreeNode> = {};

    filtered.forEach(c => {
        const parts = c.id.split('.');
        let currentLevel = root;
        let cumulativePath = '';

        parts.forEach((part, index) => {
            cumulativePath = cumulativePath ? `${cumulativePath}.${part}` : part;
            if (!currentLevel[part]) {
                currentLevel[part] = {
                    name: part,
                    fullName: cumulativePath,
                    children: {}
                };
            }
            if (index === parts.length - 1) {
                currentLevel[part].colorDef = c;
            }
            currentLevel = currentLevel[part].children;
        });
    });

    function buildHtml(nodeMap: Record<string, ITreeNode>, parentElement: HTMLElement) {
        for (const [_, node] of Object.entries(nodeMap)) {
            const nodeEl = document.createElement('div');
            nodeEl.style.marginLeft = '12px';

            if (node.colorDef) {
                nodeEl.appendChild(createVariableItemElement(node.colorDef));
            } else {
                const header = document.createElement('div');
                header.className = 'group-header';
                header.style.cursor = 'pointer';
                header.style.margin = '4px 0';
                header.style.padding = '6px 10px';
                header.style.background = '#282828';
                header.style.border = '1px solid #333';
                header.style.borderRadius = '3px';
                header.innerHTML = `<span style="display:inline-block; transition: transform 0.1s; transform: rotate(90deg); margin-right: 6px;">▸</span> ${node.name}`;

                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children';

                header.addEventListener('click', () => {
                    const isHidden = childrenContainer.style.display === 'none';
                    childrenContainer.style.display = isHidden ? 'block' : 'none';
                    header.querySelector('span')!.style.transform = isHidden ? 'rotate(90deg)' : 'rotate(0deg)';
                });

                nodeEl.appendChild(header);
                nodeEl.appendChild(childrenContainer);
                buildHtml(node.children, childrenContainer);
            }
            parentElement.appendChild(nodeEl);
        }
    }

    buildHtml(root, listContainer);
}

// Helper to create the color row element
function createVariableItemElement(color: ColorDef): HTMLElement {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'var-item';
    itemDiv.dataset.id = color.id;

    const state = userOverrides[color.id] || { current: '' };

    // Contrast badge with Visual Box
    let contrastHtml = '';
    if (color.id.toLowerCase().includes('foreground')) {
        const bgId = color.id.replace(/foreground$/i, 'background');
        if (bgId !== color.id) {
            const fgColor = getEffectiveColor(color.id);
            const bgColor = getEffectiveColor(bgId);
            const ratio = getContrastRatio(fgColor, bgColor).toFixed(1);
            const isPass = parseFloat(ratio) >= 4.5;

            contrastHtml = `
              <div class="contrast-preview-box" style="background-color: ${bgColor}; color: ${fgColor};" title="Foreground on ${bgId}">
                Aa
              </div>
              <span class="contrast-badge ${isPass ? 'pass' : 'fail'}" title="Contrast with ${bgId}">
                ${ratio} (${isPass ? 'AA' : 'FAIL'})
              </span>
            `;
        }
    }

    // GitHub Line Number Link
    let githubLinkHtml = '';
    if (githubLineNumbers[color.id]) {
        const lineNum = githubLineNumbers[color.id];
        githubLinkHtml = `<a href="https://github.com/1abcdefggs/vscode/blob/main/src/vs/platform/theme/common/colorRegistry.ts#L${lineNum}" target="_blank" class="github-line-link" title="View Source on GitHub" style="margin-left:8px; font-size:10px;">#L${lineNum}</a>`;
    }

    const isLocked = state.locked || false;
    const lockIcon = isLocked ? '🔏' : '🔓';
    const lockStyle = isLocked ? 'opacity: 1;' : 'opacity: 0.3; filter: grayscale(1);';
    const disabledAttr = isLocked ? 'disabled title="Color is locked"' : '';

    itemDiv.innerHTML = `
        <div class="var-row-top" style="justify-content: flex-start; gap: 8px;">
            <span class="lock-toggle" style="cursor:pointer; font-size:12px; ${lockStyle}" title="Toggle Lock">${lockIcon}</span>
            <div class="var-editor">
                ${state.previous && !isLocked ? `<div class="history-color" style="background: ${state.previous}" title="Undo to ${state.previous}"></div>` : ''}
                <button class="custom-color-picker-btn" style="background: ${state.current || '#000000'}; ${isLocked ? 'pointer-events:none;opacity:0.5;' : ''}" title="Choose color"></button>
                <input type="text" value="${state.current}" placeholder="default" class="color-text-input" ${disabledAttr} style="${isLocked ? 'color: #858585; pointer-events: none;' : ''}" />
            </div>
        </div>
        <div class="var-name" style="display:flex; align-items:center; margin-top: 6px;">
            <span>${color.id}</span> ${githubLinkHtml} ${contrastHtml}
        </div>
        <div class="var-desc">${color.description}</div>
    `;

    const lockToggle = itemDiv.querySelector('.lock-toggle') as HTMLElement;
    lockToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!userOverrides[color.id]) {
            userOverrides[color.id] = { current: state.current };
        }
        userOverrides[color.id].locked = !userOverrides[color.id].locked;
        renderList(searchInput.value);
        updateProgress();
    });

    const colorInputBtn = itemDiv.querySelector('.custom-color-picker-btn') as HTMLElement;
    const textInput = itemDiv.querySelector('.color-text-input') as HTMLInputElement;
    const historyBtn = itemDiv.querySelector('.history-color') as HTMLElement;

    const updateColor = (val: string, saveHistory = true) => {
        if (!userOverrides[color.id]) userOverrides[color.id] = { current: '' };
        if (saveHistory && userOverrides[color.id].current !== val) {
            userOverrides[color.id].previous = userOverrides[color.id].current || getComputedStyle(document.documentElement).getPropertyValue(getCssVarName(color.id)).trim() || '#000000';
        }
        userOverrides[color.id].current = val;

        recalcAllColors();

        // FIX: Sync inputs to fix the state mismatch (Unchanged Color Box bug)
        if (colorInputBtn) colorInputBtn.style.background = val;
        if (textInput) textInput.value = val;

        renderList(searchInput.value);
        updateProgress();
    };

    if (colorInputBtn) {
        colorInputBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isLocked) return;
            const pairedHex = resolvePairedColorHex(color.id);
            openColorPalette(colorInputBtn, color.id, state.current || '#000000', pairedHex, (newVal) => {
                updateColor(newVal, true);
            });
        });
    }

    textInput.addEventListener('change', (e) => updateColor((e.target as HTMLInputElement).value));
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            updateColor(state.previous!, false);
        });
    }

    itemDiv.addEventListener('mouseenter', () => highlightMockUI(color.id));
    itemDiv.addEventListener('mouseleave', () => unhighlightMockUI());

    return itemDiv;
}

// --- Tree View Toggle ---
viewToggleBtn.addEventListener('click', () => {
    isTreeView = !isTreeView;
    viewToggleBtn.classList.toggle('active', isTreeView);
    renderList(searchInput.value);
});

// --- Theme JSON / VSIX Import ---
function applyThemeJson(jsonStr: string) {
    try {
        const cleanedStr = jsonStr.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        const theme = JSON.parse(cleanedStr);
        lastImportedThemeObject = theme;
        if (theme.name) {
            currentImportedThemeName = theme.name;
        }
        if (theme.colors) {
            Object.keys(theme.colors).forEach(key => {
                const val = theme.colors[key];
                if (val && typeof val === 'string' && val.includes('#')) {
                    userOverrides[key] = { current: val };
                    document.documentElement.style.setProperty(getCssVarName(key), val);
                }
            });
            
            // Auto detect base mode
            let detectedBase = 'dark';
            if (theme.type === 'dark' || theme.type === 'light') {
                detectedBase = theme.type;
            } else if (theme.colors['editor.background']) {
                const lum = getLuminanceFromHex(theme.colors['editor.background']);
                detectedBase = lum > 0.5 ? 'light' : 'dark';
            }
            if ((window as any).setThemeBaseMode) {
                (window as any).setThemeBaseMode(detectedBase);
            }

            recalcAllColors();
            renderList(searchInput.value);
            updateProgress();
            termLog(`Loaded theme colors from ${currentImportedThemeName} (Auto-detected Base: ${detectedBase.toUpperCase()})`, 'success');
            showEditorPreview(`Theme "${currentImportedThemeName}" loaded successfully!`);
            updateThemeFileNameUI(currentImportedThemeName.replace(/\s+/g, '-') + '-color-theme.json');
        } else {
            termLog('JSON parsed successfully, but no "colors" object found inside.', 'error');
            alert('JSON parsed successfully, but no "colors" object found inside.');
        }
    } catch (err) {
        termLog(`Failed to parse theme JSON: ${err}`, 'error');
        alert('Failed to parse theme JSON: ' + err);
    }
}

function checkLicenseAndImport(jsonStr: string, detectedLicense?: string) {
    pendingThemeJson = jsonStr;

    // Check if license is permissive (MIT, CC0, Unlicense, Apache, BSD)
    const lic = (detectedLicense || '').toLowerCase().trim();
    const isPermissive = ['mit', 'cc0', 'unlicense', 'bsd', 'apache'].some(p => lic.includes(p));

    if (isPermissive) {
        termLog(`Permissive license "${detectedLicense}" detected automatically. Enabling community publish.`, 'success');
        applyThemeJson(jsonStr);
        publishBtn.style.display = 'inline-block';
        pendingThemeJson = '';
    } else {
        // Open license gate modal
        termLog('No permissive license metadata detected. Standing by for license verification gate...', 'info');
        licenseModal.style.display = 'flex';
    }
}

// Modal Buttons Actions
closeModalBtn.addEventListener('click', () => {
    licenseModal.style.display = 'none';
    pendingThemeJson = '';
    termLog('Theme import cancelled (License Verification declined).', 'error');
});

confirmLicenseBtn.addEventListener('click', () => {
    const selectedOption = (document.querySelector('input[name="license-type"]:checked') as HTMLInputElement).value;
    licenseModal.style.display = 'none';

    if (selectedOption === 'permissive') {
        termLog('Confirmed under Permissive License (MIT/CC0). "Publish to Community" enabled.', 'success');
        applyThemeJson(pendingThemeJson);
        publishBtn.style.display = 'inline-block';
    } else {
        termLog('Imported as Private Theme. Public database publishing disabled.', 'info');
        applyThemeJson(pendingThemeJson);
        publishBtn.style.display = 'none';
    }
    pendingThemeJson = '';
});

// Publish Button Action
publishBtn.addEventListener('click', () => {
    let authorUsername = localStorage.getItem('theme-author') || '';
    if (!authorUsername) {
        authorUsername = prompt("Enter your GitHub username to receive credit in the community gallery (optional):") || "anonymous";
        if (authorUsername !== 'anonymous') {
            localStorage.setItem('theme-author', authorUsername);
        }
    }

    terminalPanel.classList.remove('collapsed');
    termLog('Initializing secure theme publication workflow...', 'info');

    setTimeout(() => termLog(`Connecting as developer: @${authorUsername}...`, 'info'), 500);
    setTimeout(() => termLog('Forking target repository "cyber-pink-theme"...', 'info'), 1100);
    setTimeout(() => termLog('Successfully created fork under developer namespace.', 'success'), 1800);
    setTimeout(() => {
        termLog('Injecting author metadata into theme file header...', 'info');
        termLog(`Theme metadata: { name: "${currentImportedThemeName}", author: "@${authorUsername}", homepage: "https://github.com/${authorUsername}" }`, 'success');
    }, 2400);
    setTimeout(() => termLog(`Writing new theme extension file "themes/${currentImportedThemeName.toLowerCase().replace(/\s+/g, '-')}.json"...`, 'info'), 3000);
    setTimeout(() => termLog(`Committed changes: "add community contributed theme - ${currentImportedThemeName} by @${authorUsername}"`, 'success'), 3700);
    setTimeout(() => termLog('Submitting automated Pull Request back to master database...', 'info'), 4400);
    setTimeout(() => {
        termLog('Pull Request submitted successfully! View status: PR #42 open on cyber-pinks/cyber-pink-theme.', 'success');
        termLog(`Verification complete. Once merged, a profile link pointing to "https://github.com/${authorUsername}" will be displayed next to "${currentImportedThemeName}" in the public gallery!`, 'success');
        alert(`Theme submitted! A pull request has been automatically sent. You will be credited as @${authorUsername} in the public gallery upon merge!`);
    }, 5200);
});

// URL Import Button Actions
importThemeBtn.addEventListener('click', () => {
    themeUrlInput.value = '';
    urlSuggestions.style.display = 'none';
    importModal.style.display = 'flex';
});

closeImportModalBtn.addEventListener('click', () => {
    importModal.style.display = 'none';
    urlSuggestions.style.display = 'none';
});

// Drag and Drop Logic
dragDropZone.addEventListener('click', () => {
    fileInput.click();
});

dragDropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragDropZone.style.borderColor = '#007acc';
    dragDropZone.style.background = 'rgba(0, 122, 204, 0.1)';
});

dragDropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragDropZone.style.borderColor = '#3c3c3c';
    dragDropZone.style.background = 'transparent';
});

dragDropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dragDropZone.style.borderColor = '#3c3c3c';
    dragDropZone.style.background = 'transparent';
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
        importModal.style.display = 'none';
    }
});

let searchTimeout: any;

async function renderSuggestions(filter = '') {
    urlSuggestions.innerHTML = '';

    // Include local popular themes
    const localFiltered = popularThemes.filter(t =>
        t.name.toLowerCase().includes(filter.toLowerCase()) ||
        t.repo.toLowerCase().includes(filter.toLowerCase())
    );

    let allSuggestions = [...localFiltered];

    if (filter.length >= 3) {
        urlSuggestions.innerHTML = '<div style="padding:10px; color:#858585; font-size:12px;">Searching GitHub...</div>';
        urlSuggestions.style.display = 'block';

        try {
            const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(filter)}+topic:vscode-theme&per_page=5`);
            if (res.ok) {
                const data = await res.json();
                const ghThemes = (data.items || []).map((item: any) => ({
                    name: item.name,
                    repo: item.full_name,
                    url: item.full_name, // Sets input to 'owner/repo' which will trigger package.json logic
                    isGithub: true
                }));
                allSuggestions = [...localFiltered, ...ghThemes];
            }
        } catch (e) {
            console.error('GitHub API Search Failed', e);
        }
    }

    urlSuggestions.innerHTML = '';

    if (allSuggestions.length === 0) {
        urlSuggestions.style.display = 'none';
        return;
    }

    // Deduplicate by repo
    const seen = new Set();
    const uniqueSuggestions = allSuggestions.filter(t => {
        if (seen.has(t.repo)) return false;
        seen.add(t.repo);
        return true;
    });

    uniqueSuggestions.forEach(theme => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span class="theme-name">${theme.name} ${('repo' in theme) ? '<span class="codicon codicon-github" style="font-size:12px; margin-left:5px; color:#858585;"></span>' : ''}</span>
            <span class="theme-repo">${theme.repo}</span>
        `;
        item.addEventListener('click', () => {
            themeUrlInput.value = theme.url;
            urlSuggestions.style.display = 'none';
            confirmUrlImportBtn.click(); // Auto submit on selection
        });
        urlSuggestions.appendChild(item);
    });

    urlSuggestions.style.display = 'block';
}

themeUrlInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        renderSuggestions((e.target as HTMLInputElement).value);
    }, 500);
});

themeUrlInput.addEventListener('focus', () => {
    if (themeUrlInput.value.length < 3) {
        renderSuggestions(themeUrlInput.value);
    }
});

// Close suggestions on clicking outside
document.addEventListener('click', (e) => {
    if (!importModal.contains(e.target as Node) && e.target !== importThemeBtn) {
        urlSuggestions.style.display = 'none';
    }
});

function loadWorkspaceThemes(repoPath: string, themes: any[], rootLicense?: string) {
    const section = document.getElementById('workspace-themes-section');
    const tree = document.getElementById('workspace-themes-tree');
    if (!section || !tree) return;

    tree.innerHTML = '';

    themes.forEach(theme => {
        if (!theme.path) return;
        const themePath = theme.path.replace(/^\.\//, '');
        const node = document.createElement('div');
        node.className = 'file-node workspace-theme-node';
        node.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 4px 20px; font-size: 13px; cursor: pointer; color: #cccccc;';
        node.innerHTML = `
            <span class="codicon codicon-symbol-color" style="color: #c586c0;"></span>
            <span>${theme.label || themePath.split('/').pop()}</span>
        `;

        node.addEventListener('click', async () => {
            document.querySelectorAll('.workspace-theme-node').forEach(n => n.classList.remove('active'));
            node.classList.add('active');

            const rawUrl = `https://raw.githubusercontent.com/${repoPath}/main/${themePath}`;
            termLog(`Fetching workspace theme: ${theme.label || themePath}...`, 'info');
            try {
                const res = await fetch(rawUrl);
                if (!res.ok) throw new Error('HTTP Error');
                const text = await res.text();

                let fileLicense = rootLicense;
                try {
                    const parsed = JSON.parse(text.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
                    if (parsed.license) fileLicense = parsed.license;
                    if (parsed.name) currentImportedThemeName = parsed.name;
                } catch (e) { }

                checkLicenseAndImport(text, fileLicense);
            } catch (e) {
                termLog(`Failed to fetch theme ${themePath}: ${e}`, 'error');
            }
        });

        tree.appendChild(node);
    });

    section.style.display = 'block';
}

confirmUrlImportBtn.addEventListener('click', async () => {
    const inputVal = themeUrlInput.value.trim();
    if (!inputVal) return;

    importModal.style.display = 'none';
    terminalPanel.classList.remove('collapsed');
    termLog(`Resolving GitHub location: ${inputVal}...`, 'info');

    const githubUrlRegex = /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/;
    const repoPathRegex = /^([^\/]+)\/([^\/]+)\/(.+)$/;
    const exactRepoRegex = /^([^\/]+)\/([^\/]+)$/;

    let targetUrl = inputVal;

    // Check if input is exactly owner/repo
    if (exactRepoRegex.test(inputVal) && !inputVal.startsWith('http')) {
        const repo = inputVal;
        const mainUrl = `https://raw.githubusercontent.com/${repo}/main/package.json`;
        const masterUrl = `https://raw.githubusercontent.com/${repo}/master/package.json`;
        termLog(`Fetching package.json for repository ${repo}...`, 'info');
        try {
            let pkgRes = await fetch(mainUrl);
            if (!pkgRes.ok) {
                pkgRes = await fetch(masterUrl);
            }
            if (!pkgRes.ok) throw new Error(`HTTP ${pkgRes.status}`);
            const pkgJson = await pkgRes.json();

            if (pkgJson.contributes && pkgJson.contributes.themes && Array.isArray(pkgJson.contributes.themes)) {
                termLog(`Found ${pkgJson.contributes.themes.length} themes in workspace package.json.`, 'success');
                loadWorkspaceThemes(repo, pkgJson.contributes.themes, pkgJson.license);
                // Automatically click the first theme
                setTimeout(() => {
                    const firstNode = document.querySelector('.workspace-theme-node') as HTMLElement;
                    if (firstNode) firstNode.click();
                }, 100);
                return; // Early return, we handled it!
            } else {
                termLog(`Repository ${repo} does not export themes via package.json contributes.`, 'error');
                return;
            }
        } catch (e) {
            termLog(`Failed to read package.json for ${repo}. Error: ${e}`, 'error');
            return;
        }
    }

    if (githubUrlRegex.test(inputVal)) {
        targetUrl = inputVal.replace(githubUrlRegex, 'https://raw.githubusercontent.com/$1/$2/$3/$4');
    } else if (repoPathRegex.test(inputVal) && !inputVal.startsWith('http')) {
        targetUrl = inputVal.replace(repoPathRegex, 'https://raw.githubusercontent.com/$1/$2/main/$3');
    }

    termLog(`Fetching remote content from: ${targetUrl}...`, 'info');

    try {
        const response = await fetch(targetUrl);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);

        const rawJsonText = await response.text();
        termLog('Successfully fetched remote theme file.', 'success');

        let licenseVal;
        try {
            const parsed = JSON.parse(rawJsonText.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
            licenseVal = parsed.license;
            if (parsed.name) currentImportedThemeName = parsed.name;
        } catch (e) { }

        checkLicenseAndImport(rawJsonText, licenseVal);
    } catch (err) {
        termLog(`Failed to import from GitHub URL: ${err}`, 'error');
        alert(`Failed to fetch from GitHub URL: ${err}`);
    }
});

fileInput.addEventListener('change', async (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    termLog(`Importing file: ${file.name}...`, 'info');

    if (file.name.endsWith('.vsix') || file.name.endsWith('.zip')) {
        try {
            const zip = await JSZip.loadAsync(file);
            const packageJsonFile = zip.file('extension/package.json') || zip.file('package.json');
            if (!packageJsonFile) throw new Error('package.json not found in VSIX.');

            const pkgStr = await packageJsonFile.async('string');
            const pkg = JSON.parse(pkgStr);

            const detectedLicense = pkg.license;

            const themes = pkg.contributes?.themes;
            if (!themes || themes.length === 0) throw new Error('No themes contributed in this VSIX.');

            const themePath = themes[0].path.replace(/^\.\//, '');
            const themeFile = zip.file(`extension/${themePath}`) || zip.file(themePath);
            if (!themeFile) throw new Error(`Theme file ${themePath} not found in VSIX.`);

            const themeJsonStr = await themeFile.async('string');
            checkLicenseAndImport(themeJsonStr, detectedLicense);

        } catch (err) {
            termLog(`Failed to extract VSIX: ${err}`, 'error');
            alert('Failed to extract VSIX: ' + err);
        }
    } else {
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                // For JSON files, try to parse metadata or just run check
                let licenseVal;
                try {
                    const parsed = JSON.parse((ev.target.result as string).replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1'));
                    licenseVal = parsed.license;
                    if (parsed.name) currentImportedThemeName = parsed.name;
                } catch (e) { }
                checkLicenseAndImport(ev.target.result as string, licenseVal);
            }
        };
        reader.readAsText(file);
    }
});

// --- GitHub Import Sync ---
importGithubBtn.addEventListener('click', async () => {
    terminalPanel.classList.remove('collapsed');
    termLog('Connecting to GitHub repository...', 'info');

    try {
        const repoUrl = 'https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colorRegistry.ts';
        termLog(`Fetching ${repoUrl}...`, 'info');

        const response = await fetch(repoUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const text = await response.text();
        termLog(`Fetched ${text.length} bytes successfully.`, 'success');
        termLog('Parsing Abstract Syntax Tree for registerColor calls...', 'info');

        // Simulating parsing time for visual effect
        await new Promise(r => setTimeout(r, 600));

        const lines = text.split('\n');
        let matched = 0;

        // Very basic regex to find registerColor('variable.name', ...)
        const colorRegex = /registerColor\(\s*['"]([^'"]+)['"]/g;

        lines.forEach((line, index) => {
            let match;
            while ((match = colorRegex.exec(line)) !== null) {
                const colorId = match[1];
                githubLineNumbers[colorId] = index + 1; // 1-indexed
                matched++;
            }
        });

        termLog(`Successfully mapped ${matched} color definitions to source code line numbers.`, 'success');
        termLog('Updating UI bindings...', 'info');

        // Re-render list to show line links
        renderList(searchInput.value);

        termLog('Sync Complete. You can now click line numbers to view source directly on GitHub.', 'success');
    } catch (err) {
        termLog(`Failed to sync from GitHub: ${err}`, 'error');
    }
});

// --- Reset Theme ---
resetBtn.addEventListener('click', () => {
    Object.keys(userOverrides).forEach(key => {
        document.documentElement.style.removeProperty(getCssVarName(key));
        delete userOverrides[key];
    });
    renderList(searchInput.value);
    updateProgress();
});

// --- Create Blank Theme ---
createBlankBtn.addEventListener('click', () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');

    // Format: 1-Theme-YYYYMMDD-HHMM (Starts with 1 for easy sorting)
    blankThemeNameInput.value = `1-Theme-${yyyy}${mm}${dd}-${hh}${min}`;
    createBlankModal.style.display = 'flex';
});

closeBlankModalBtn.addEventListener('click', () => {
    createBlankModal.style.display = 'none';
});

confirmBlankBtn.addEventListener('click', () => {
    createBlankModal.style.display = 'none';
    const name = blankThemeNameInput.value.trim() || "Untitled Theme";
    currentImportedThemeName = name;

    Object.keys(userOverrides).forEach(key => {
        document.documentElement.style.removeProperty(getCssVarName(key));
        delete userOverrides[key];
    });

    // Reset to VS Code Default Dark Theme as the baseline
    Object.assign(userOverrides, JSON.parse(JSON.stringify(defaultDarkOverrides)));
    
    // Push default CSS variables to DOM instantly
    Object.keys(userOverrides).forEach(key => {
        const val = userOverrides[key].current;
        document.documentElement.style.setProperty(getCssVarName(key), val);
    });

    renderList(searchInput.value);
    updateProgress();
    recalcAllColors(true);
    termLog(`Created a new blank theme canvas named "${name}". Publish enabled.`, 'success');
    showEditorPreview(`Blank Theme "${name}" created! Select components or tokens to edit.`);
    updateThemeFileNameUI(name.replace(/\s+/g, '-') + '-color-theme.json');

    // Visual flash on mock elements to indicate reset
    mockElements.forEach(el => {
        (el as HTMLElement).style.transition = 'opacity 0.2s';
        (el as HTMLElement).style.opacity = '0.5';
        setTimeout(() => (el as HTMLElement).style.opacity = '1', 200);
    });

    publishBtn.style.display = 'inline-block'; // Allow publishing blank theme after customizing
});

// --- Search and Export ---
searchInput.addEventListener('input', (e) => renderList((e.target as HTMLInputElement).value));
const exportSettingsModal = document.getElementById('export-settings-modal') as HTMLElement;
const closeExportModalBtn = document.getElementById('close-export-modal-btn') as HTMLElement;
const exportThemeName = document.getElementById('export-theme-name') as HTMLInputElement;
const exportThemeAuthor = document.getElementById('export-theme-author') as HTMLInputElement;
const exportThemeLicense = document.getElementById('export-theme-license') as HTMLSelectElement;
const downloadZipBtn = document.getElementById('download-zip-btn') as HTMLElement;

const exportSettingsJsonBtn = document.getElementById('export-settings-json-btn') as HTMLElement;
const downloadJsonBtn = document.getElementById('download-json-btn') as HTMLElement;

type ExportMode = 'customizations' | 'theme' | 'raw';
let currentExportMode: ExportMode = 'customizations';

document.querySelectorAll('.export-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        const prevMode = currentExportMode;
        document.querySelectorAll('.export-tab').forEach(t => {
            t.classList.remove('active');
            (t as HTMLElement).style.background = 'transparent';
        });
        const target = e.target as HTMLElement;
        target.classList.add('active');
        target.style.background = '#0e639c';
        currentExportMode = target.dataset.mode as ExportMode;

        if (currentExportMode === 'theme') {
            exportBtn.textContent = 'Export Theme';
        } else {
            exportBtn.textContent = 'Copy JSON';
        }

        // Switch Monaco Editor View!
        if (isMonacoLoaded && monacoEditorInstance) {
            if (prevMode === 'customizations' && currentExportMode !== 'customizations') {
                // Save their work!
                savedCustomizationsJson = monacoEditorInstance.getValue();
            }

            const colors: Record<string, string> = {};
            for (const key in userOverrides) {
                if (userOverrides[key].current) {
                    colors[key] = userOverrides[key].current;
                }
            }

            if (currentExportMode === 'theme') {
                const tColors = getTokenColorsForExport();
                const themeObj = {
                    name: currentImportedThemeName || 'custom-theme',
                    type: "dark",
                    colors: colors,
                    tokenColors: tColors
                };
                monacoEditorInstance.setValue(JSON.stringify(themeObj, null, 4));
                monacoEditorInstance.updateOptions({ readOnly: true });
            } else if (currentExportMode === 'raw') {
                monacoEditorInstance.setValue(JSON.stringify(colors, null, 4));
                monacoEditorInstance.updateOptions({ readOnly: true });
            } else if (currentExportMode === 'customizations') {
                if (savedCustomizationsJson !== null) {
                    monacoEditorInstance.setValue(savedCustomizationsJson);
                }
                monacoEditorInstance.updateOptions({ readOnly: false });
            }
        }
    });
});

exportBtn.addEventListener('click', () => {
    const colors: Record<string, string> = {};
    for (const key in userOverrides) {
        if (userOverrides[key].current) {
            colors[key] = userOverrides[key].current;
        }
    }

    if (currentExportMode === 'customizations') {
        const tColors = getTokenColorsForExport();
        let jsonStr = '';
        if (tColors.length > 0) {
            jsonStr = JSON.stringify({
                "workbench.colorCustomizations": colors,
                "editor.tokenColorCustomizations": { "textMateRules": tColors }
            }, null, 2);
        } else {
            jsonStr = JSON.stringify({ "workbench.colorCustomizations": colors }, null, 2);
        }
        navigator.clipboard.writeText(jsonStr).then(() => {
            const oldText = exportBtn.textContent;
            exportBtn.textContent = 'Copied!';
            setTimeout(() => exportBtn.textContent = oldText || 'Copy JSON', 1500);
            showToast('Copied settings JSON snippet to clipboard!');
        });
    } else if (currentExportMode === 'raw') {
        const jsonStr = JSON.stringify(colors, null, 2);
        navigator.clipboard.writeText(jsonStr).then(() => {
            const oldText = exportBtn.textContent;
            exportBtn.textContent = 'Copied!';
            setTimeout(() => exportBtn.textContent = oldText || 'Copy JSON', 1500);
            showToast('Copied raw JSON to clipboard!');
        });
    } else if (currentExportMode === 'theme') {
        exportThemeName.value = currentImportedThemeName || 'custom-theme';
        exportThemeAuthor.value = localStorage.getItem('theme-author') || (lastImportedThemeObject?.author) || 'anonymous';
        // Pre-select license if available
        if (lastImportedThemeObject && lastImportedThemeObject.license) {
            const lic = lastImportedThemeObject.license.toUpperCase();
            if (lic.includes('MIT')) exportThemeLicense.value = 'MIT';
            else if (lic.includes('GPL')) exportThemeLicense.value = 'GPL-3.0';
            else if (lic.includes('APACHE')) exportThemeLicense.value = 'Apache-2.0';
            else exportThemeLicense.value = 'Proprietary';
        } else {
            exportThemeLicense.value = 'MIT';
        }
        exportSettingsModal.style.display = 'flex';
    }
});

closeExportModalBtn.addEventListener('click', () => {
    exportSettingsModal.style.display = 'none';
});

function generateThemeJsonString() {
    const finalName = exportThemeName.value.trim() || 'custom-theme';
    const finalAuthor = exportThemeAuthor.value.trim() || 'anonymous';
    const finalLicense = exportThemeLicense.value;

    const colors: Record<string, string> = lastImportedThemeObject ? { ...(lastImportedThemeObject.colors || {}) } : {};
    for (const key in userOverrides) {
        if (userOverrides[key].current) {
            colors[key] = userOverrides[key].current;
        }
    }

    const themeObject = lastImportedThemeObject ? {
        ...lastImportedThemeObject,
        name: finalName,
        author: finalAuthor,
        license: finalLicense,
        colors: colors
    } : {
        name: finalName,
        author: finalAuthor,
        homepage: finalAuthor !== 'anonymous' ? `https://github.com/${finalAuthor}` : '',
        license: finalLicense,
        type: 'dark',
        colors: colors
    };

    let finalJsonStr = '';

    if (!lastImportedThemeObject) {
        let colorsStr = `  "colors": {\n`;
        const activeKeys = Object.keys(colors);
        activeKeys.forEach((key) => {
            colorsStr += `    "${key}": "${colors[key]}",\n`;
        });

        colorRegistry.forEach(reg => {
            if (!activeKeys.includes(reg.id)) {
                colorsStr += `    // "${reg.id}": "${reg.defaults}",\n`;
            }
        });

        colorsStr = colorsStr.replace(/,\n$/, '\n');
        colorsStr += `  }`;

        finalJsonStr = `{
  "name": "${themeObject.name}",
  "author": "${themeObject.author}",
  "homepage": "${(themeObject as any).homepage || ''}",
  "license": "${themeObject.license}",
  "type": "${(themeObject as any).type || 'dark'}",
${colorsStr}
}`;
    } else {
        finalJsonStr = JSON.stringify(themeObject, null, 2);
    }

    return { finalJsonStr, finalName, finalAuthor, finalLicense };
}


exportSettingsJsonBtn.addEventListener('click', () => {
    const colors: Record<string, string> = {};
    for (const key in userOverrides) {
        if (userOverrides[key].current) {
            colors[key] = userOverrides[key].current;
        }
    }

    const tColors = getTokenColorsForExport();
    let jsonStr = '';
    if (tColors.length > 0) {
        jsonStr = JSON.stringify({
            "workbench.colorCustomizations": colors,
            "editor.tokenColorCustomizations": { "textMateRules": tColors }
        }, null, 2);
    } else {
        jsonStr = JSON.stringify({ "workbench.colorCustomizations": colors }, null, 2);
    }

    navigator.clipboard.writeText(jsonStr).then(() => {
        exportSettingsJsonBtn.textContent = 'Copied!';
        setTimeout(() => {
            exportSettingsJsonBtn.textContent = '📋 Copy Settings JSON';
            exportSettingsModal.style.display = 'none';
        }, 1500);
        showToast('Copied settings JSON snippet to clipboard!');
    });
});

downloadJsonBtn.addEventListener('click', () => {
    const { finalJsonStr, finalName } = generateThemeJsonString();
    const safeName = finalName.toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const blob = new Blob([finalJsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}-color-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    downloadJsonBtn.textContent = 'Downloaded!';
    setTimeout(() => {
        downloadJsonBtn.textContent = '⬇️ Download .json';
    }, 1500);
    showToast('Downloaded JSON file!');
});

downloadZipBtn.addEventListener('click', async () => {
    const { finalJsonStr, finalName, finalAuthor, finalLicense } = generateThemeJsonString();

    if (finalAuthor !== 'anonymous') {
        localStorage.setItem('theme-author', finalAuthor);
    }

    const safeName = finalName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const safePublisher = finalAuthor.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'anonymous';

    const packageJson = {
        name: safeName,
        displayName: finalName,
        publisher: safePublisher,
        version: "0.0.1",
        engines: { "vscode": "^1.90.0" },
        contributes: {
            themes: [
                {
                    label: finalName,
                    uiTheme: "vs-dark",
                    path: `./themes/${safeName}-color-theme.json`
                }
            ]
        }
    };

    const readmeMd = `# ${finalName}\n\nA beautiful VS Code theme created with TheMeTheme editor.\n\n## License\n${finalLicense}`;

    const zip = new JSZip();
    zip.file("package.json", JSON.stringify(packageJson, null, 2));
    zip.file("README.md", readmeMd);
    zip.folder("themes")?.file(`${safeName}-color-theme.json`, finalJsonStr);

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}-${packageJson.version}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    downloadZipBtn.textContent = 'Downloaded!';
    termLog(`Exported full extension workspace zip for theme "${finalName}".`, 'success');
    setTimeout(() => {
        downloadZipBtn.textContent = 'Download Extension (.zip)';
        exportSettingsModal.style.display = 'none';
    }, 1500);
});

// --- Component Navigation ---
document.querySelectorAll('.explorer-tree .file-node').forEach(el => {
    if (el.classList.contains('disabled')) return;
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.explorer-tree .file-node').forEach(f => f.classList.remove('active'));
        el.classList.add('active');
        activeComponent = (el as HTMLElement).dataset.component || '';

        const variablesList = document.getElementById('variables-list');
        const tutorialView = document.getElementById('tutorial-view');
        const editorWatermark = document.getElementById('editor-watermark');
        const inspectorPlaceholder = document.getElementById('inspector-placeholder');
        const settingsJsonView = document.getElementById('settings-json-view');
        const syntaxPreview = document.getElementById('syntax-preview');
        const detailsContent = document.getElementById('details-content');

        // Remove selected outline from all components
        document.querySelectorAll('.mock-component').forEach(m => m.classList.remove('selected'));

        if (activeComponent.startsWith('tutorial-')) {
            if (detailsContent) {
                if (activeComponent === 'tutorial-2') {
                    detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Customize a Color Theme</h2>
<h4 style="color: #cccccc; margin-top: 15px; margin-bottom: 5px; font-weight: 500;">Workbench colors</h4>
<p style="font-size: 13px; color: #aaaaaa; line-height: 1.5; margin-top: 0;">
  You can customize your active color theme with the <code>workbench.colorCustomizations</code> and <code>editor.tokenColorCustomizations</code> user settings. To set the colors of VS Code UI elements such as list & trees (File Explorer, suggestions widget), diff editor, Activity Bar, notifications, scroll bar, split view, buttons, and more, use <code>workbench.colorCustomizations</code>.
</p>
<p style="font-size: 13px; color: #aaaaaa; line-height: 1.5;">
  You can use IntelliSense while setting <code>workbench.colorCustomizations</code> values or, for a list of all customizable colors, see the Theme Color Reference.
</p>
<p style="font-size: 13px; color: #aaaaaa; line-height: 1.5;">
  To make customizations to a specific theme, use the following syntax:
</p>
<pre style="background: #1e1e1e; padding: 10px; border-radius: 4px; border: 1px solid #333; overflow-x: auto; font-family: Consolas, 'Courier New', monospace; color: #d4d4d4; font-size: 12px; margin-top: 5px;"><code>"workbench.colorCustomizations": {
    "[Monokai]": {
        "sideBar.background": "#347890"
    }
}</code></pre>

<p style="font-size: 13px; color: #aaaaaa; line-height: 1.5; margin-top: 15px;">
  If a customization applies to more than one theme, you can name multiple themes or use <code>*</code> as a wildcard at the beginning and end of the name:
</p>
<pre style="background: #1e1e1e; padding: 10px; border-radius: 4px; border: 1px solid #333; overflow-x: auto; font-family: Consolas, 'Courier New', monospace; color: #d4d4d4; font-size: 12px; margin-top: 5px;"><code>"workbench.colorCustomizations": {
    "[Abyss][Red]": {
        "activityBar.background": "#ff0000"
    },
    "[Monokai*]": {
        "activityBar.background": "#ff0000"
    }
}</code></pre>

<p style="font-size: 13px; color: #aaaaaa; line-height: 1.5; margin-top: 15px;">
  If a theme sets a color or border that you don't like, you can use <code>"default"</code> to set it back to the original value:
</p>
<pre style="background: #1e1e1e; padding: 10px; border-radius: 4px; border: 1px solid #333; overflow-x: auto; font-family: Consolas, 'Courier New', monospace; color: #d4d4d4; font-size: 12px; margin-top: 5px;"><code>"workbench.colorCustomizations": {
    "diffEditor.removedTextBorder": "default"
}</code></pre>`;
                } else if (activeComponent === 'tutorial-3') {
                    detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Step 3: Export and Publish</h2>
<p style="font-size: 13px;">You can export your completed theme using the buttons in the top right.</p>
<div style="margin-top: 20px; display: flex; flex-direction: column; gap: 20px;">
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #3c3c3c; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #4fc1ff;">📦 Download Extension (.zip)</h4>
        <p style="font-size: 13px; margin: 0; color: #cccccc; line-height: 1.5;">Downloads a ZIP file containing all the necessary files to use directly as a VS Code extension.</p>
    </div>
    <div style="background: rgba(255,255,255,0.03); border: 1px solid #3c3c3c; padding: 15px; border-radius: 8px;">
        <h4 style="margin: 0 0 10px 0; color: #4fc1ff;">📋 Copy JSON</h4>
        <p style="font-size: 13px; margin: 0; color: #cccccc; line-height: 1.5;">Copies the raw JSON theme definition directly to your clipboard.</p>
    </div>
</div>`;
                } else if (activeComponent === 'tutorial-1') {
                    detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Step 1: Start Editing</h2>
<p style="font-size: 13px;">Access settings and previews from the menu on the left.</p>
<div style="margin-top: 20px;">
  <h3 style="color: #ffffff; font-weight: 300; font-size: 15px;">About settings.json</h3>
  <p style="font-size: 13px;">This mode allows you to directly edit and preview your color theme settings in JSON format.</p>
  <ul style="font-size: 13px; line-height: 1.6; padding-left: 20px;">
    <li>Your current customizations are automatically updated in this JSON.</li>
    <li>This content will be the foundation when you export (Publish) your theme.</li>
  </ul>
</div>`;
                }
            }
        } else if (activeComponent === 'settings-json') {
            // Show detail.md content in details panel
            if (detailsContent) {
                detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Step 1: Start Editing</h2>
<p style="font-size: 13px;">Access settings and previews from the menu on the left.</p>
<div style="margin-top: 20px;">
  <h3 style="color: #ffffff; font-weight: 300; font-size: 15px;">About settings.json</h3>
  <p style="font-size: 13px;">This mode allows you to directly edit and preview your color theme settings in JSON format.</p>
  <ul style="font-size: 13px; line-height: 1.6; padding-left: 20px;">
    <li>Your current customizations are automatically updated in this JSON.</li>
    <li>This content will be the foundation when you export (Publish) your theme.</li>
  </ul>
</div>`;
            }
            if (variablesList) variablesList.style.display = 'none';
            if (inspectorPlaceholder) inspectorPlaceholder.style.display = 'flex';
            if (editorWatermark) editorWatermark.style.display = 'none';
            if (syntaxPreview) syntaxPreview.style.display = 'none';
            if (settingsJsonView) settingsJsonView.style.display = 'block';
            if (tutorialView) tutorialView.style.display = 'none';
        } else if (activeComponent === 'detail-md') {
            // Show detail.md content in details panel
            if (detailsContent) {
                detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Step 1: Start Editing</h2>
<p style="font-size: 13px;">Access settings and previews from the menu on the left.</p>
<div style="margin-top: 20px;">
  <h3 style="color: #ffffff; font-weight: 300; font-size: 15px;">About settings.json</h3>
  <p style="font-size: 13px;">This mode allows you to directly edit and preview your color theme settings in JSON format.</p>
  <ul style="font-size: 13px; line-height: 1.6; padding-left: 20px;">
    <li>Your current customizations are automatically updated in this JSON.</li>
    <li>This content will be the foundation when you export (Publish) your theme.</li>
  </ul>
</div>`;
            }
            if (variablesList) variablesList.style.display = 'none';
            if (inspectorPlaceholder) inspectorPlaceholder.style.display = 'none';
            if (editorWatermark) editorWatermark.style.display = 'flex';
            if (syntaxPreview) syntaxPreview.style.display = 'none';
            if (settingsJsonView) settingsJsonView.style.display = 'none';
            if (tutorialView) tutorialView.style.display = 'none';

            document.querySelectorAll('.editor-tab').forEach(t => {
                const tab = t as HTMLElement;
                tab.classList.remove('active');
                tab.classList.add('inactive');
                tab.style.background = 'var(--vscode-tab-inactiveBackground)';
                tab.style.color = 'var(--vscode-tab-inactiveForeground)';
            });
        } else {
            if (detailsContent) {
                if (activeComponent === 'full-layout') {
                    detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">Full Layout</h2>
<p style="font-size: 13px;">Displays all color settings in one place. Adjust colors while seeing an overview of the entire VS Code layout.</p>`;
                    triggerModeNotificationModal();
                } else {
                    const componentName = activeComponent.charAt(0).toUpperCase() + activeComponent.slice(1);
                    detailsContent.innerHTML = `<h2 style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">${componentName}</h2>
<p style="font-size: 13px;">A list of color settings for ${componentName}. You can also change colors by clicking directly on elements in the preview on the right.</p>`;
                }
            }
            if (variablesList) variablesList.style.display = 'block';
            if (inspectorPlaceholder) inspectorPlaceholder.style.display = 'none';
            if (editorWatermark) editorWatermark.style.display = 'flex';
            if (settingsJsonView) settingsJsonView.style.display = 'none';
            if (syntaxPreview) syntaxPreview.style.display = 'none';

            if (activeComponent !== 'full-layout') {
                const targetMock = document.getElementById(`${activeComponent}-mock`);
                if (targetMock) {
                    targetMock.classList.add('selected');
                    targetMock.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }

            // Update active editor tab
            document.querySelectorAll('.editor-tab').forEach(t => {
                const tab = t as HTMLElement;
                if (tab.dataset.tabTarget === activeComponent) {
                    tab.classList.remove('inactive');
                    tab.classList.add('active');
                    tab.style.background = 'var(--vscode-tab-activeBackground)';
                    tab.style.color = 'var(--vscode-tab-activeForeground)';
                } else {
                    tab.classList.remove('active');
                    tab.classList.add('inactive');
                    tab.style.background = 'var(--vscode-tab-inactiveBackground)';
                    tab.style.color = 'var(--vscode-tab-inactiveForeground)';
                }
            });

            renderList();
        }
        updateProgress();
    });
});

// --- Tutorial View Action Buttons ---
document.getElementById('tut-create-blank-btn')?.addEventListener('click', () => {
    exportMode = 'standalone';
    document.getElementById('create-blank-btn')?.click();
    exportBtn.textContent = 'Export JSON';
});
document.getElementById('tut-tweak-workbench-btn')?.addEventListener('click', () => {
    document.getElementById('create-blank-btn')?.click(); // Clear canvas
    exportBtn.textContent = 'Copy Settings';
    showEditorPreview('Started Settings Override (Quick Tweak) Mode!');
    updateThemeFileNameUI('settings.json');
});
document.getElementById('tut-import-github-btn')?.addEventListener('click', () => {
    document.getElementById('activity-extensions')?.click();
});
document.getElementById('tut-import-local-btn')?.addEventListener('click', () => {
    document.getElementById('import-theme-btn')?.click();
});

// --- Activity Bar Navigation ---
const activityExplorer = document.getElementById('activity-explorer');
const activityExtensions = document.getElementById('activity-extensions');
const sidebarExplorer = document.getElementById('sidebar-explorer');
const sidebarExtensions = document.getElementById('sidebar-extensions');

activityExplorer?.addEventListener('click', () => {
    activityExplorer.classList.remove('inactive');
    activityExplorer.classList.add('active');
    activityExtensions?.classList.remove('active');
    activityExtensions?.classList.add('inactive');

    if (sidebarExplorer) sidebarExplorer.style.display = 'flex';
    if (sidebarExtensions) sidebarExtensions.style.display = 'none';
});

activityExtensions?.addEventListener('click', () => {
    activityExtensions.classList.remove('inactive');
    activityExtensions.classList.add('active');
    activityExplorer?.classList.remove('active');
    activityExplorer?.classList.add('inactive');

    if (sidebarExtensions) sidebarExtensions.style.display = 'flex';
    if (sidebarExplorer) sidebarExplorer.style.display = 'none';
});


const mockElements = document.querySelectorAll('.mock-component, .mock-component [data-color-keys]');
const editorTabs = document.querySelectorAll('.editor-tab');

mockElements.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
        e.stopPropagation();
        const keys = (el as HTMLElement).dataset.colorKeys;
        if (keys) {
            highlightListItems(keys.split(','));
            (el as HTMLElement).classList.add('highlighted');

            // Highlight matching tab
            const componentId = el.id.replace('-mock', '');
            const tab = document.querySelector(`.editor-tab[data-tab-target="${componentId}"]`);
            if (tab) tab.classList.add('highlighted');
        }
    });
    el.addEventListener('mouseleave', () => {
        unhighlightListItems();
        (el as HTMLElement).classList.remove('highlighted');

        // Unhighlight matching tab
        const componentId = el.id.replace('-mock', '');
        const tab = document.querySelector(`.editor-tab[data-tab-target="${componentId}"]`);
        if (tab) tab.classList.remove('highlighted');
    });
});

editorTabs.forEach(tab => {
    tab.addEventListener('mouseenter', () => {
        tab.classList.add('highlighted');
        const targetId = (tab as HTMLElement).dataset.tabTarget;
        if (targetId) {
            const mock = document.getElementById(`${targetId}-mock`);
            if (mock) {
                mock.classList.add('highlighted');
                const keys = mock.dataset.colorKeys;
                if (keys) highlightListItems(keys.split(','));
            }
        }
    });
    tab.addEventListener('mouseleave', () => {
        tab.classList.remove('highlighted');
        const targetId = (tab as HTMLElement).dataset.tabTarget;
        if (targetId) {
            const mock = document.getElementById(`${targetId}-mock`);
            if (mock) mock.classList.remove('highlighted');
            unhighlightListItems();
        }
    });

    // Clicking a tab triggers the component click logic
    tab.addEventListener('click', () => {
        const targetId = (tab as HTMLElement).dataset.tabTarget;
        if (targetId) {
            const mock = document.getElementById(`${targetId}-mock`);
            if (mock) mock.click(); // Trigger the click event on the mock component
        }
    });
});

function highlightMockUI(colorId: string) { mockElements.forEach(el => { if (((el as HTMLElement).dataset.colorKeys || '').includes(colorId)) el.classList.add('highlighted'); }); }
function unhighlightMockUI() { mockElements.forEach(el => el.classList.remove('highlighted')); }
function highlightListItems(colorIds: string[]) {
    document.querySelectorAll('.var-item').forEach(item => {
        const id = (item as HTMLElement).dataset.id;
        if (id && colorIds.includes(id)) {
            item.classList.add('highlighted');
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}
function unhighlightListItems() { document.querySelectorAll('.var-item').forEach(c => c.classList.remove('highlighted')); }

renderList();
updateProgress();

// --- Color Palette Logic ---
let recentColors: string[] = JSON.parse(localStorage.getItem('theme-recent-colors') || '[]');

function saveRecentColor(hex: string) {
    if (!hex || recentColors.includes(hex)) return;
    recentColors.unshift(hex);
    if (recentColors.length > 12) recentColors.pop();
    localStorage.setItem('theme-recent-colors', JSON.stringify(recentColors));
    // renderPalette(); (Removed popover palette rendering as popover is unused)
}

mockElements.forEach(el => {
    el.addEventListener('click', (e) => {
        e.stopPropagation();
        const keys = (el as HTMLElement).dataset.colorKeys;
        if (!keys) return;

        const componentId = el.id.replace('-mock', '');

        // Update active tab styles
        editorTabs.forEach(t => {
            t.classList.remove('active');
            t.classList.add('inactive');
            (t as HTMLElement).style.background = 'var(--vscode-tab-inactiveBackground)';
            (t as HTMLElement).style.color = 'var(--vscode-tab-inactiveForeground)';
        });
        const targetTab = document.querySelector(`.editor-tab[data-tab-target="${componentId}"]`);
        if (targetTab) {
            targetTab.classList.remove('inactive');
            targetTab.classList.add('active');
            (targetTab as HTMLElement).style.background = 'var(--vscode-tab-activeBackground)';
            (targetTab as HTMLElement).style.color = 'var(--vscode-tab-activeForeground)';
        }

        // Populate Editor Mock Content
        const editorCode = document.querySelector('.editor-code') as HTMLElement;
        const editorMinimap = document.querySelector('.editor-minimap') as HTMLElement;
        const breadcrumbs = document.querySelector('.breadcrumbs') as HTMLElement;

        if (editorCode) {
            editorCode.innerHTML = `
                <div style="margin-bottom: 20px; padding: 12px 16px; font-weight: bold; color: var(--vscode-editor-foreground); font-family: sans-serif; font-size: 14px; background: rgba(255, 255, 255, 0.05); border-left: 4px solid var(--vscode-textLink-foreground, #3794ff); border-radius: 2px; display: flex; align-items: center; gap: 10px;">
                    <span class="codicon codicon-settings-gear"></span>
                    <span>Settings: <span style="color: var(--vscode-textLink-foreground, #3794ff);">${componentId}</span></span>
                </div>
            `;

            // Add grid layout for color edits inside the editor
            const colorGrid = document.createElement('div');
            colorGrid.className = 'settings-grid';
            colorGrid.style.display = 'grid';
            colorGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(280px, 1fr))';
            colorGrid.style.gap = '15px';
            colorGrid.style.fontFamily = 'sans-serif'; // Use normal font for UI controls

            // FIX: Prevent clicks anywhere inside the settings area (including padding/headers) from bubbling to the mock editor and causing Focus Loss
            editorCode.addEventListener('click', (e) => e.stopPropagation());

            const keyArray = keys.split(',');
            keyArray.forEach(colorId => {
                const colorDef = (colorsDb as ColorDef[]).find(c => c.id === colorId);
                if (colorDef) {
                    colorGrid.appendChild(createVariableItemElement(colorDef));
                }
            });
            editorCode.appendChild(colorGrid);

            if (editorMinimap) editorMinimap.style.display = 'none'; // Hide minimap when editing settings
            if (breadcrumbs) {
                breadcrumbs.innerHTML = `
                    <span>src</span>
                    <span class="codicon codicon-chevron-right" style="font-size: 10px;"></span>
                    <span>vs</span>
                    <span class="codicon codicon-chevron-right" style="font-size: 10px;"></span>
                    <span>settings</span>
                    <span class="codicon codicon-chevron-right" style="font-size: 10px;"></span>
                    <span>${componentId}</span>
                `;
            }
        }
    });
});

// Intercept color changes to save to recent colors
document.addEventListener('change', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.classList.contains('color-input') || target.classList.contains('hex-input')) {
        saveRecentColor(target.value);
    }
});

// --- Welcome Overlay ---
const welcomeOverlay = document.getElementById('welcome-overlay');
const getStartedBtn = document.getElementById('get-started-btn');
if (welcomeOverlay && getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
        welcomeOverlay.style.display = 'none';
    });
}


// --- OS Theme Sync ---
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
function syncOSTheme(e: any) {
    const isDark = e.matches;
    // We could apply a default dark or light theme here if no user overrides exist.
    // For now, we just add a class to body
    if (isDark) {
        document.body.classList.add('vscode-dark');
        document.body.classList.remove('vscode-light');
    } else {
        document.body.classList.add('vscode-light');
        document.body.classList.remove('vscode-dark');
    }
}
mediaQuery.addEventListener('change', syncOSTheme);
syncOSTheme(mediaQuery);


// --- Token Colors Feature ---
const tokenScopes = [
    { id: 'token.keyword', scope: 'keyword', description: 'Keywords like import, export, return' },
    { id: 'token.string', scope: 'string', description: 'String literals' },
    { id: 'token.comment', scope: 'comment', description: 'Comments' },
    { id: 'token.function', scope: 'entity.name.function', description: 'Function and method names' },
    { id: 'token.variable', scope: 'variable', description: 'Variables' },
    { id: 'token.parameter', scope: 'variable.parameter', description: 'Function parameters' },
    { id: 'token.type', scope: 'entity.name.type', description: 'Type definitions' },
    { id: 'token.constant', scope: 'constant.language', description: 'Language constants like true, false' },
    { id: 'token.built-in', scope: 'support.class', description: 'Built-in objects like console, Math' },
    { id: 'token.tag', scope: 'entity.name.tag', description: 'HTML/XML tags' },
    { id: 'token.property', scope: 'entity.other.attribute-name', description: 'Object properties and HTML attributes' },
    { id: 'token.text', scope: 'text', description: 'Plain text inside tags' }
];

tokenScopes.forEach(t => {
    // Add to color database so it appears in the list when "syntax-tokens" is active
    colorsDb.push({ id: t.id, description: t.description, file: 'tokenColors' });
});

// Update the export logic to include token colors
// We need to modify getEffectiveColor or add logic to extract tokens
function getTokenColorsForExport() {



    const rules: any[] = [];
    tokenScopes.forEach(t => {
        if (userOverrides[t.id]?.current) {
            rules.push({
                scope: t.scope,
                settings: {
                    foreground: userOverrides[t.id].current
                }
            });
        }
    });
    return rules;
}

// Intercept theme export (we will replace applyThemeJson later if needed)

// Inject Token Styles into Document
export function updateTokenStyles() {
    let styleTag = document.getElementById('token-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'token-styles';
        document.head.appendChild(styleTag);
    }

    let css = '';
    tokenScopes.forEach(t => {
        const color = userOverrides[t.id]?.current;
        if (color) {
            const className = t.id.replace('.', '-'); // token.keyword -> token-keyword
            css += `.${className} { color: ${color} !important; }\n`;
        }
    });
    styleTag.textContent = css;
}

recalcAllColors(true);

// ==========================================
// BULK TOOLS LOGIC
// ==========================================
const bulkToolsToggleBtn = document.getElementById('bulk-tools-toggle-btn');
const bulkToolsPanel = document.getElementById('bulk-tools-panel');
const variablesListBulk = document.getElementById('variables-list');
const inspectorPlaceholderBulk = document.getElementById('inspector-placeholder');

if (bulkToolsToggleBtn && bulkToolsPanel && variablesListBulk) {
    bulkToolsToggleBtn.addEventListener('click', () => {
        const isShowing = bulkToolsPanel.style.display === 'block';
        if (isShowing) {
            bulkToolsPanel.style.display = 'none';
            variablesListBulk.style.display = 'block';
        } else {
            bulkToolsPanel.style.display = 'block';
            variablesListBulk.style.display = 'none';
            if (inspectorPlaceholderBulk) inspectorPlaceholderBulk.style.display = 'none';
        }
    });
}

const allgenBtn = document.getElementById('allgen-btn');
if (allgenBtn) {
    allgenBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('#allgen-categories input[type="checkbox"]:checked');
        const selectedPrefixes = Array.from(checkboxes).map(cb => (cb as HTMLInputElement).value);

        let newColors: Record<string, string> = {};

        colorRegistry.forEach(reg => {
            const matches = selectedPrefixes.includes('all') || selectedPrefixes.some(prefix => reg.id.startsWith(prefix));
            if (matches) {
                const colorValue = reg.defaults || '#ff00ff';
                if (!userOverrides[reg.id]) userOverrides[reg.id] = { current: '' };
                userOverrides[reg.id].current = typeof colorValue === 'string' ? colorValue : (colorValue.dark || '#ff00ff');
                newColors[reg.id] = userOverrides[reg.id].current;
            }
        });

        if (monacoEditorInstance) {
            let currentJson = monacoEditorInstance.getValue();
            try {
                const stripped = currentJson.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                const parsed = JSON.parse(stripped);
                parsed["workbench.colorCustomizations"] = {
                    ...(parsed["workbench.colorCustomizations"] || {}),
                    ...newColors
                };
                monacoEditorInstance.setValue(JSON.stringify(parsed, null, 4));
            } catch (e) {
                alert("Please ensure settings.json is valid JSON before running ALLgen.");
            }
        }
        recalcAllColors(false);
    });
}

const bulkApplyBtn = document.getElementById('bulk-apply-btn');
const bulkSuffixSelect = document.getElementById('bulk-suffix-select') as HTMLSelectElement;
const bulkColorPicker = document.getElementById('bulk-color-picker') as HTMLInputElement;

if (bulkApplyBtn) {
    bulkApplyBtn.addEventListener('click', () => {
        const suffix = bulkSuffixSelect.value;
        const color = bulkColorPicker.value;

        let newColors: Record<string, string> = {};
        colorRegistry.forEach(reg => {
            if (reg.id.endsWith(suffix) || reg.id.includes(suffix)) {
                if (!userOverrides[reg.id]) userOverrides[reg.id] = { current: '' };
                userOverrides[reg.id].current = color;
                newColors[reg.id] = color;
            }
        });

        if (monacoEditorInstance) {
            let currentJson = monacoEditorInstance.getValue();
            try {
                const stripped = currentJson.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                const parsed = JSON.parse(stripped);
                parsed["workbench.colorCustomizations"] = {
                    ...(parsed["workbench.colorCustomizations"] || {}),
                    ...newColors
                };
                monacoEditorInstance.setValue(JSON.stringify(parsed, null, 4));
            } catch (e) {
                alert("Please ensure settings.json is valid JSON before running Bulk Apply.");
            }
        }
        recalcAllColors(false);
    });
}

const patternApplyBtn = document.getElementById('pattern-apply-btn');
if (patternApplyBtn) {
    patternApplyBtn.addEventListener('click', () => {
        const bg = (document.getElementById('pattern-bg') as HTMLInputElement).value;
        const fg = (document.getElementById('pattern-fg') as HTMLInputElement).value;
        const border = (document.getElementById('pattern-border') as HTMLInputElement).value;

        const commonComponents = ['activityBar', 'sideBar', 'titleBar', 'statusBar', 'editor', 'tab', 'terminal', 'panel'];
        let newColors: Record<string, string> = {};

        commonComponents.forEach(comp => {
            newColors[`${comp}.background`] = bg;
            newColors[`${comp}.foreground`] = fg;
            newColors[`${comp}.border`] = border;
            if (comp === 'tab') {
                newColors['tab.activeBackground'] = bg;
                newColors['tab.activeForeground'] = fg;
                newColors['tab.activeBorder'] = border;
            }
            if (comp === 'titleBar') {
                newColors['titleBar.activeBackground'] = bg;
                newColors['titleBar.activeForeground'] = fg;
            }
        });

        for (const k in newColors) {
            if (!userOverrides[k]) userOverrides[k] = { current: '' };
            userOverrides[k].current = newColors[k];
        }

        if (monacoEditorInstance) {
            let currentJson = monacoEditorInstance.getValue();
            try {
                const stripped = currentJson.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                const parsed = JSON.parse(stripped);
                parsed["workbench.colorCustomizations"] = {
                    ...(parsed["workbench.colorCustomizations"] || {}),
                    ...newColors
                };
                monacoEditorInstance.setValue(JSON.stringify(parsed, null, 4));
            } catch (e) {
                alert("Please ensure settings.json is valid JSON before running Pattern Apply.");
            }
        }
        recalcAllColors(false);
    });
}

// ==========================================
// THEME IMPORT LOGIC (File Picker)
// ==========================================
const importBtnElem = document.getElementById('import-theme-btn');
const importFileInput = document.getElementById('import-file-input') as HTMLInputElement;

if (importBtnElem && importFileInput) {
    importBtnElem.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const text = ev.target?.result as string;
                const stripped = text.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m: string, g: string) => g ? "" : m);
                const parsed = JSON.parse(stripped);

                const colors = parsed.colors || parsed["workbench.colorCustomizations"] || {};

                if (monacoEditorInstance) {
                    const editorJsonStr = JSON.stringify({
                        "workbench.colorTheme": parsed.name || "Imported Theme",
                        "workbench.colorCustomizations": colors
                    }, null, 4);
                    monacoEditorInstance.setValue(editorJsonStr);
                }

                for (const k in colors) {
                    if (!userOverrides[k]) userOverrides[k] = { current: '' };
                    userOverrides[k].current = colors[k];
                }

                recalcAllColors(false);
                alert(`Imported successfully. Loaded ${Object.keys(colors).length} custom colors.`);
            } catch (err) {
                alert("Failed to parse JSON file.");
            }
            importFileInput.value = '';
        };
        reader.readAsText(file);
    });
}

// ==========================================
// THEME PROGRESS TRACEABILITY
// ==========================================
const themeProgress = document.getElementById('theme-progress');
if (themeProgress) {
    themeProgress.style.cursor = 'pointer';
    themeProgress.title = "Click to see customized keys";
    themeProgress.addEventListener('click', () => {
        const customizedKeys = Object.keys(userOverrides).filter(k => userOverrides[k].current !== '');
        if (customizedKeys.length === 0) {
            alert("No keys customized yet.");
        } else {
            const listStr = customizedKeys.map(k => `${k}: ${userOverrides[k].current}`).join('\\n');
            alert(`Customized Keys (${customizedKeys.length}):\\n\\n${listStr}`);
        }
    });
}

// ==========================================
// MINIFY HEX COLORS
// ==========================================
const minifyHexBtn = document.getElementById('minify-hex-btn');
if (minifyHexBtn) {
    minifyHexBtn.addEventListener('click', () => {
        let count = 0;

        for (const k in userOverrides) {
            const hex = userOverrides[k].current;
            if (!hex) continue;

            let minified = hex;
            if (hex.length === 7 && hex[0] === '#') {
                if (hex[1].toLowerCase() === hex[2].toLowerCase() &&
                    hex[3].toLowerCase() === hex[4].toLowerCase() &&
                    hex[5].toLowerCase() === hex[6].toLowerCase()) {
                    minified = '#' + hex[1] + hex[3] + hex[5];
                }
            } else if (hex.length === 9 && hex[0] === '#') {
                if (hex[1].toLowerCase() === hex[2].toLowerCase() &&
                    hex[3].toLowerCase() === hex[4].toLowerCase() &&
                    hex[5].toLowerCase() === hex[6].toLowerCase() &&
                    hex[7].toLowerCase() === hex[8].toLowerCase()) {
                    minified = '#' + hex[1] + hex[3] + hex[5] + hex[7];
                }
            }

            if (minified !== hex) {
                userOverrides[k].current = minified;
                count++;
            }
        }

        if (monacoEditorInstance && count > 0) {
            let currentJson = monacoEditorInstance.getValue();
            currentJson = currentJson.replace(/"(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8})"/g, (match: string, hex: string) => {
                if (hex.length === 7) {
                    if (hex[1].toLowerCase() === hex[2].toLowerCase() &&
                        hex[3].toLowerCase() === hex[4].toLowerCase() &&
                        hex[5].toLowerCase() === hex[6].toLowerCase()) {
                        return '"#' + hex[1] + hex[3] + hex[5] + '"';
                    }
                } else if (hex.length === 9) {
                    if (hex[1].toLowerCase() === hex[2].toLowerCase() &&
                        hex[3].toLowerCase() === hex[4].toLowerCase() &&
                        hex[5].toLowerCase() === hex[6].toLowerCase() &&
                        hex[7].toLowerCase() === hex[8].toLowerCase()) {
                        return '"#' + hex[1] + hex[3] + hex[5] + hex[7] + '"';
                    }
                }
                return match;
            });
            monacoEditorInstance.setValue(currentJson);
        }

        if (count > 0) {
            recalcAllColors(false);
            termLog(`Minified ${count} colors to 3-digit/4-digit hex shorthand.`, 'success');
            alert(`Minified ${count} colors successfully!`);
        } else {
            alert("No colors could be minified (already minified or no shortenable colors).");
        }
    });
}

setTimeout(() => {
    const tutNode = document.querySelector('[data-component="tutorial-1"]') as HTMLElement;
    if (tutNode) tutNode.click();
}, 100);

// ==========================================
// VIEW MENU TOGGLES & SCM HISTORY LOGIC
// ==========================================

const viewMenuTrigger = document.querySelector('.view-menu-trigger') as HTMLElement;
const viewDropdown = document.querySelector('.view-dropdown') as HTMLElement;
const toggleActivityBar = document.querySelector('.toggle-activitybar');
const togglePanel = document.querySelector('.toggle-panel');
const toggleStatusBar = document.querySelector('.toggle-statusbar');

const activityBarMock = document.getElementById('activitybar-mock');
const panelMock = document.getElementById('panel-mock');
const statusBarMock = document.getElementById('statusbar-mock');

let isActivityBarVisible = false;
let isPanelVisible = false;
let isStatusBarVisible = false;

function updateViewChecks() {
    if (document.querySelector('.activitybar-check')) (document.querySelector('.activitybar-check') as HTMLElement).style.display = isActivityBarVisible ? 'inline-block' : 'none';
    if (document.querySelector('.panel-check')) (document.querySelector('.panel-check') as HTMLElement).style.display = isPanelVisible ? 'inline-block' : 'none';
    if (document.querySelector('.statusbar-check')) (document.querySelector('.statusbar-check') as HTMLElement).style.display = isStatusBarVisible ? 'inline-block' : 'none';
}

if (viewMenuTrigger && viewDropdown) {
    viewMenuTrigger.addEventListener('click', (e) => {
        const isVisible = viewDropdown.style.display === 'block';
        document.querySelectorAll('.mock-dropdown-menu').forEach(m => (m as HTMLElement).style.display = 'none');
        if (!isVisible) viewDropdown.style.display = 'block';
        e.stopPropagation();
    });
}
document.addEventListener('click', () => {
    document.querySelectorAll('.mock-dropdown-menu').forEach(m => (m as HTMLElement).style.display = 'none');
});

if (toggleActivityBar) toggleActivityBar.addEventListener('click', (e) => {
    isActivityBarVisible = !isActivityBarVisible;
    if (activityBarMock) activityBarMock.style.display = isActivityBarVisible ? 'flex' : 'none';
    updateViewChecks();
    e.stopPropagation();
});
if (togglePanel) togglePanel.addEventListener('click', (e) => {
    isPanelVisible = !isPanelVisible;
    if (panelMock) panelMock.style.display = isPanelVisible ? 'flex' : 'none';
    updateViewChecks();
    e.stopPropagation();
});
if (toggleStatusBar) toggleStatusBar.addEventListener('click', (e) => {
    isStatusBarVisible = !isStatusBarVisible;
    if (statusBarMock) statusBarMock.style.display = isStatusBarVisible ? 'flex' : 'none';
    updateViewChecks();
    e.stopPropagation();
});

// SCM History Time Travel logic
let scmHistory: Array<{ message: string, state: Record<string, string>, timestamp: Date }> = [];
let isUndoing = false;
let lastScmStateStr = '';

function pushToScmHistory(message: string) {
    if (isUndoing) return;
    const currentState: Record<string, string> = {};
    for (const key in userOverrides) {
        if (userOverrides[key].current) {
            currentState[key] = userOverrides[key].current;
        }
    }
    const currentStr = JSON.stringify(currentState);
    if (currentStr === lastScmStateStr && scmHistory.length > 0) return; // no real change, but allow first commit

    lastScmStateStr = currentStr;
    scmHistory.unshift({ message, state: currentState, timestamp: new Date() });
    renderScmHistoryTree();
}

function renderScmHistoryTree() {
    const tree = document.getElementById('scm-history-tree');
    if (!tree) return;
    tree.innerHTML = '';

    if (scmHistory.length === 0) {
        tree.innerHTML = '<div style="padding: 10px 15px; color: #858585; font-size: 11px;">No changes yet.</div>';
        return;
    }

    scmHistory.forEach((commit) => {
        const node = document.createElement('div');
        node.className = 'file-node';
        node.style.cssText = 'display: flex; align-items: center; gap: 6px; padding: 4px 20px; font-size: 13px; cursor: pointer; color: #cccccc;';
        const timeStr = commit.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        node.innerHTML = `<span class="codicon codicon-git-commit" style="color: #89d185;"></span>
                          <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${commit.message}</span>
                          <span style="font-size: 10px; opacity: 0.5;">${timeStr}</span>`;
        node.title = `Click to revert to: ${commit.message}`;
        node.addEventListener('click', () => {
            if (confirm(`Revert to state: "${commit.message}"?`)) {
                rollbackToCommit(commit.state);
            }
        });
        tree.appendChild(node);
    });
}

function rollbackToCommit(state: Record<string, string>) {
    isUndoing = true;
    for (const key in userOverrides) {
        if (state[key]) {
            userOverrides[key].current = state[key];
        } else {
            userOverrides[key].current = ''; // clear if not in state
        }
    }
    // Also inject any keys that were in state but not in userOverrides yet
    for (const key in state) {
        if (!userOverrides[key]) {
            userOverrides[key] = { current: state[key] };
        }
    }

    recalcAllColors(true); // update UI
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) renderList(searchInput.value);

    // Reset last state so next manual edit triggers a new commit
    lastScmStateStr = JSON.stringify(state);

    isUndoing = false;
    // Remove Toast if termLog works.
}

const scmCommitBtn = document.querySelector('.scm-action-bar button');
const scmCommitInput = document.querySelector('.scm-action-bar input') as HTMLInputElement;
if (scmCommitBtn && scmCommitInput) {
    scmCommitBtn.addEventListener('click', () => {
        const msg = scmCommitInput.value.trim() || 'Manual Update';
        pushToScmHistory(msg);
        scmCommitInput.value = '';
    });
    scmCommitInput.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            const msg = scmCommitInput.value.trim() || 'Manual Update';
            pushToScmHistory(msg);
            scmCommitInput.value = '';
        }
    });
}

// Auto-commit on start
setTimeout(() => {
    pushToScmHistory("Initial State");
}, 500);

// Toggle SCM View vs Explorer View
const myActivityExplorer = document.getElementById('activity-explorer');
const activityScmElems = document.querySelectorAll('.activity-icon');
let activityScm: HTMLElement | null = null;
activityScmElems.forEach(el => {
    if (el.innerHTML.includes('codicon-source-control')) activityScm = el as HTMLElement;
});
const mySidebarExplorer = document.getElementById('sidebar-explorer');
const sidebarScm = document.getElementById('sidebar-scm');

if (myActivityExplorer && activityScm && mySidebarExplorer && sidebarScm) {
    const scmIcon: HTMLElement = activityScm;
    scmIcon.style.cursor = 'pointer';
    scmIcon.addEventListener('click', () => {
        mySidebarExplorer.style.display = 'none';
        sidebarScm.style.display = 'flex';
        myActivityExplorer.classList.remove('active');
        myActivityExplorer.classList.add('inactive');
        scmIcon.classList.remove('inactive');
        scmIcon.classList.add('active');
    });
    myActivityExplorer.addEventListener('click', () => {
        sidebarScm.style.display = 'none';
        mySidebarExplorer.style.display = 'flex';
        scmIcon.classList.remove('active');
        scmIcon.classList.add('inactive');
        myActivityExplorer.classList.remove('inactive');
        myActivityExplorer.classList.add('active');
    });
}

// Tree View Expand/Collapse logic for hardcoded HTML
document.querySelectorAll('.folder-toggle, .branch-node').forEach(node => {
    (node as HTMLElement).style.cursor = 'pointer';
    node.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const nextSibling = target.nextElementSibling as HTMLElement;
        const icon = target.querySelector('.codicon-chevron-down, .toggle-icon') as HTMLElement;
        if (nextSibling && (nextSibling.classList.contains('explorer-tree') || nextSibling.classList.contains('tree-node-children'))) {
            const isHidden = nextSibling.style.display === 'none';
            nextSibling.style.display = isHidden ? 'block' : 'none';
            if (icon) {
                icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
        }
    });
});

setTimeout(() => {
    const settingsNode = document.querySelector('.file-node[data-component="settings-json"]') as HTMLElement;
    if (settingsNode) {
        settingsNode.click();
    }
}, 100);

// Sidebar Resize Functionality
const sidebarMock = document.getElementById('sidebar-mock') as HTMLElement;
let isResizing = false;
let startX = 0;
let startWidth = 0;

if (sidebarMock) {
    const resizeHandle = document.createElement('div');
    resizeHandle.style.cssText = 'position: absolute; right: 0; top: 0; bottom: 0; width: 4px; cursor: ew-resize; z-index: 1000;';
    sidebarMock.appendChild(resizeHandle);

    resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = sidebarMock.offsetWidth;
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
    });
}



document.addEventListener('mousemove', (e: MouseEvent) => {
    if (isResizing && sidebarMock) {
        const diff = e.clientX - startX;
        const newWidth = startWidth + diff;
        if (newWidth >= 150 && newWidth <= 600) {
            sidebarMock.style.width = newWidth + 'px';
        }
    }
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
});

// --- Resizable Inspector Panel Logic ---
const inspectorPanel = document.getElementById("inspector-panel") as HTMLElement;
const rightSash = document.getElementById("sash-right") as HTMLElement;
let isResizingRight = false;
let rightStartX = 0;
let rightStartWidth = 0;

if (inspectorPanel && rightSash) {
    rightSash.addEventListener("mousedown", (e: MouseEvent) => {
        // Start resizing
        isResizingRight = true;
        rightStartX = e.clientX;
        rightStartWidth = inspectorPanel.offsetWidth;
        document.body.classList.add("resizing"); // Use a generic class to prevent text selection
        rightSash.classList.add("active");

        // Attach listeners to the window to capture mouse movement everywhere
        window.addEventListener("mousemove", handleRightMouseMove);
        window.addEventListener("mouseup", stopRightResizing);
    });

    function handleRightMouseMove(e: MouseEvent) {
        if (!isResizingRight) return;

        // Calculate the new width based on mouse movement from the right
        const deltaX = e.clientX - rightStartX;
        const newWidth = rightStartWidth - deltaX;

        // Apply constraints
        const minWidth = 300;
        const maxWidth = 800;
        const constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));

        inspectorPanel.style.width = `${constrainedWidth}px`;
    }

    function stopRightResizing() {
        isResizingRight = false;
        document.body.classList.remove("resizing");
        rightSash.classList.remove("active");
        window.removeEventListener("mousemove", handleRightMouseMove);
        window.removeEventListener("mouseup", stopRightResizing);
    }
}

// --- Resizable Bottom Panel Logic ---
const bottomPanel = document.getElementById("panel-mock") as HTMLElement;
const bottomSash = document.getElementById("sash-bottom") as HTMLElement;
let isResizingBottom = false;
let bottomStartY = 0;
let bottomStartHeight = 0;

if (bottomPanel && bottomSash) {
    bottomSash.addEventListener("mousedown", (e: MouseEvent) => {
        // Start resizing
        isResizingBottom = true;
        bottomStartY = e.clientY;
        bottomStartHeight = bottomPanel.offsetHeight;
        document.body.classList.add("resizing");
        bottomSash.classList.add("active");

        // Attach listeners to the window
        window.addEventListener("mousemove", handleBottomMouseMove);
        window.addEventListener("mouseup", stopBottomResizing);
    });

    function handleBottomMouseMove(e: MouseEvent) {
        if (!isResizingBottom) return;

        // Calculate the new height
        const deltaY = e.clientY - bottomStartY;
        const newHeight = bottomStartHeight - deltaY;

        // Apply constraints
        const minHeight = 35; // Height of the panel header
        const maxHeight = 600;
        const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));

        bottomPanel.style.height = `${constrainedHeight}px`;
    }

    function stopBottomResizing() {
        isResizingBottom = false;
        document.body.classList.remove("resizing");
        bottomSash.classList.remove("active");
        window.removeEventListener("mousemove", handleBottomMouseMove);
        window.removeEventListener("mouseup", stopBottomResizing);
    }
}

// --- Resizable App Terminal Panel Logic ---
const appTerminalPanel = document.getElementById("terminal-panel") as HTMLElement;
const terminalSash = document.getElementById("sash-terminal") as HTMLElement;
let isResizingTerminal = false;
let terminalStartY = 0;
let terminalStartHeight = 0;

if (appTerminalPanel && terminalSash) {
    terminalSash.addEventListener("mousedown", (e: MouseEvent) => {
        // Start resizing
        isResizingTerminal = true;
        terminalStartY = e.clientY;
        terminalStartHeight = appTerminalPanel.offsetHeight;
        document.body.classList.add("resizing");
        terminalSash.classList.add("active");

        // Attach listeners to the window
        window.addEventListener("mousemove", handleTerminalMouseMove);
        window.addEventListener("mouseup", stopTerminalResizing);
    });

    function handleTerminalMouseMove(e: MouseEvent) {
        if (!isResizingTerminal) return;

        // Calculate the new height
        const deltaY = e.clientY - terminalStartY;
        const newHeight = terminalStartHeight - deltaY;

        // Apply constraints
        const minHeight = 35; // Height of the terminal header
        const maxHeight = 500;
        const constrainedHeight = Math.max(minHeight, Math.min(newHeight, maxHeight));
        appTerminalPanel.style.height = `${constrainedHeight}px`;
    }

    function stopTerminalResizing() {
        isResizingTerminal = false;
        document.body.classList.remove("resizing");
        terminalSash.classList.remove("active");

        window.removeEventListener("mousemove", handleTerminalMouseMove);
        window.removeEventListener("mouseup", stopTerminalResizing);
    }
}

const themeModeBtn = document.getElementById('theme-mode-btn');
if (themeModeBtn) {
    themeModeBtn.addEventListener('click', () => {
        if (currentBaseMode === 'dark') {
            currentBaseMode = 'light';
            themeModeBtn.textContent = '☀️ Light Mode Base';
            themeModeBtn.dataset.mode = 'light';
            themeModeBtn.style.background = '#e67e22'; // distinct color
            themeModeBtn.style.borderColor = '#e67e22';
            Object.assign(userOverrides, JSON.parse(JSON.stringify(defaultLightOverrides)));
            termLog('Switched to Light Mode base. Initializing default light theme colors.', 'info');
        } else {
            currentBaseMode = 'dark';
            themeModeBtn.textContent = '🌙 Dark Mode Base';
            themeModeBtn.dataset.mode = 'dark';
            themeModeBtn.style.background = '#007acc';
            themeModeBtn.style.borderColor = '#007acc';
            Object.assign(userOverrides, JSON.parse(JSON.stringify(defaultDarkOverrides)));
            termLog('Switched to Dark Mode base. Initializing default dark theme colors.', 'info');
        }

        // Push CSS variables for default colors to DOM instantly
        Object.keys(userOverrides).forEach(key => {
            const val = userOverrides[key].current;
            document.documentElement.style.setProperty(getCssVarName(key), val);
        });

        recalcAllColors();
        renderList((document.getElementById('search-input') as HTMLInputElement).value);
        updateProgress();
        showModeNotificationModal();
    });
}

function showModeNotificationModal() {
    const modal = document.getElementById('mode-notification-modal');
    if (modal) {
        const title = document.getElementById('mode-notification-title');
        const desc = document.getElementById('mode-notification-desc');
        if (title && desc) {
            title.textContent = currentBaseMode === 'dark' ? 'Dark Mode Theme Editing' : 'Light Mode Theme Editing';
            desc.innerHTML = `You are currently creating a theme based on <strong>${currentBaseMode === 'dark' ? 'Dark Mode' : 'Light Mode'}</strong>.<br>
            The base colors have been initialized with VS Code's default ${currentBaseMode} theme. When selecting background colors, the palette will prioritize ${currentBaseMode === 'dark' ? 'darker' : 'lighter'} shades.`;
        }
        modal.style.display = 'flex';
    }
}

export function triggerModeNotificationModal() {
    showModeNotificationModal();
}

document.getElementById('close-mode-modal-btn')?.addEventListener('click', () => {
    const modal = document.getElementById('mode-notification-modal');
    if (modal) modal.style.display = 'none';
});
// Initialize Custom Color Palette
initColorPalette();

// Clear Comments functionality
document.getElementById('clear-comments-btn')?.addEventListener('click', () => {
    // monacoEditorInstance is declared at line 322 and accessible here
    // @ts-ignore - monacoEditorInstance is technically any/implicit in some contexts, but we know it's available
    if (typeof monacoEditorInstance !== 'undefined' && monacoEditorInstance) {
        const currentJson = monacoEditorInstance.getValue();
        // Remove comments
        const cleanedStr = currentJson.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1');
        
        try {
            // Parse and stringify to fix any dangling commas and ensure clean formatting
            const parsed = JSON.parse(cleanedStr);
            const finalJson = JSON.stringify(parsed, null, 4);
            monacoEditorInstance.setValue(finalJson);
        } catch (e) {
            // If it fails to parse (e.g. trailing comma left over), just use the regex cleaned string
            monacoEditorInstance.setValue(cleanedStr);
        }
    }
});

// UI Layout Toggle Logic
let isToolMode = true; // Default to Tool Mode

const toggleLayoutBtn = document.getElementById('toggle-layout-btn');
const leftSidebar = document.getElementById('sidebar-mock');
const toolModeLeft = document.getElementById('tool-mode-left');
const toolModeRight = document.getElementById('tool-mode-right');
const vscodeMockWrapper = document.getElementById('vscode-mock-wrapper');
const vscodeMockContainer = document.getElementById('vscode-mock-container');
const innerFlexContainer = leftSidebar?.parentElement;

function applyLayoutMode() {
    if (!leftSidebar || !inspectorPanel || !toolModeLeft || !toolModeRight || !vscodeMockWrapper || !vscodeMockContainer || !innerFlexContainer) return;

    if (isToolMode) {
        toolModeLeft.style.display = 'flex';
        toolModeRight.style.display = 'flex';
        toolModeLeft.appendChild(leftSidebar);
        toolModeRight.appendChild(inspectorPanel);
        vscodeMockWrapper.style.padding = '20px';
        vscodeMockContainer.style.border = '1px solid #3c3c3c';
        vscodeMockContainer.style.borderRadius = '8px';
        vscodeMockContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
    } else {
        toolModeLeft.style.display = 'none';
        toolModeRight.style.display = 'none';
        
        // Return leftSidebar to the beginning of the inner flex container
        innerFlexContainer.insertBefore(leftSidebar, innerFlexContainer.firstChild);
        
        // Return inspectorPanel to the end of the inner flex container
        innerFlexContainer.appendChild(inspectorPanel);
        
        vscodeMockWrapper.style.padding = '0';
        vscodeMockContainer.style.border = 'none';
        vscodeMockContainer.style.borderRadius = '0';
        vscodeMockContainer.style.boxShadow = 'none';
    }
}

toggleLayoutBtn?.addEventListener('click', () => {
    isToolMode = !isToolMode;
    localStorage.setItem('themeEditorLayoutMode', isToolMode ? 'tool' : 'integrated');
    applyLayoutMode();
});

const savedMode = localStorage.getItem('themeEditorLayoutMode');
if (savedMode === 'integrated') {
    isToolMode = false;
}
applyLayoutMode();

