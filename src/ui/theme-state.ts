export const defaultDarkOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = {
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

export const defaultLightOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = {
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

export const userOverrides: Record<string, { current: string, previous?: string, locked?: boolean }> = { ...defaultDarkOverrides };

export let currentBaseMode: 'dark' | 'light' = 'dark';
export function setCurrentBaseMode(mode: 'dark' | 'light') {
    currentBaseMode = mode;
}

export let currentThemeFileName = 'Untitled-Theme.json';
export function setCurrentThemeFileName(name: string) {
    currentThemeFileName = name;
}

export const githubLineNumbers: Record<string, number> = {};
