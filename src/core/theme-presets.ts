export interface ThemePreset {
  id: string;
  label: string;
  type: 'dark' | 'light' | 'hcDark' | 'hcLight';
  description?: string;
  filename: string;
  colors?: Record<string, string>;
}

export const VSCODE_THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dark-2026',
    label: 'Dark 2026 (Default Dark)',
    type: 'dark',
    description: 'Current VS Code default dark theme',
    filename: '2026-dark.json',
    colors: {
      'editor.background': '#181818',
      'titleBar.activeBackground': '#1e1e1e',
      'activityBar.background': '#181818',
      'sideBar.background': '#181818',
      'statusBar.background': '#181818',
      'panel.background': '#181818'
    }
  },
  {
    id: 'light-2026',
    label: 'Light 2026 (Default Light)',
    type: 'light',
    description: 'Current VS Code default light theme',
    filename: '2026-light.json',
    colors: {
      'editor.background': '#ffffff',
      'titleBar.activeBackground': '#f8f8f8',
      'activityBar.background': '#f8f8f8',
      'sideBar.background': '#f3f3f3',
      'statusBar.background': '#f8f8f8',
      'panel.background': '#ffffff'
    }
  },
  {
    id: 'dark-modern',
    label: 'Dark Modern',
    type: 'dark',
    description: 'VS Code Dark Modern theme',
    filename: 'dark_modern.json',
    colors: {
      'editor.background': '#1f1f1f',
      'titleBar.activeBackground': '#181818',
      'activityBar.background': '#181818',
      'sideBar.background': '#181818',
      'statusBar.background': '#181818'
    }
  },
  {
    id: 'dark-plus',
    label: 'Dark+ (Legacy Default)',
    type: 'dark',
    description: 'Classic VS Code Dark+ theme',
    filename: 'dark_plus.json',
    colors: {
      'editor.background': '#1e1e1e',
      'titleBar.activeBackground': '#3c3c3c',
      'activityBar.background': '#333333',
      'sideBar.background': '#252526',
      'statusBar.background': '#007acc'
    }
  },
  {
    id: 'light-modern',
    label: 'Light Modern',
    type: 'light',
    description: 'VS Code Light Modern theme',
    filename: 'light_modern.json',
    colors: {
      'editor.background': '#ffffff',
      'titleBar.activeBackground': '#f8f8f8',
      'activityBar.background': '#f8f8f8',
      'sideBar.background': '#f3f3f3',
      'statusBar.background': '#007acc'
    }
  },
  {
    id: 'light-plus',
    label: 'Light+ (Legacy Default)',
    type: 'light',
    description: 'Classic VS Code Light+ theme',
    filename: 'light_plus.json',
    colors: {
      'editor.background': '#ffffff',
      'titleBar.activeBackground': '#dddddd',
      'activityBar.background': '#2c2c2c',
      'sideBar.background': '#f3f3f3',
      'statusBar.background': '#007acc'
    }
  },
  {
    id: 'hc-black',
    label: 'High Contrast Dark',
    type: 'hcDark',
    description: 'High contrast black theme',
    filename: 'hc_black.json',
    colors: {
      'editor.background': '#000000',
      'titleBar.activeBackground': '#000000',
      'activityBar.background': '#000000',
      'sideBar.background': '#000000',
      'statusBar.background': '#000000',
      'sideBar.border': '#6fc2ef'
    }
  },
  {
    id: 'hc-light',
    label: 'High Contrast Light',
    type: 'hcLight',
    description: 'High contrast light theme',
    filename: 'hc_light.json',
    colors: {
      'editor.background': '#ffffff',
      'titleBar.activeBackground': '#ffffff',
      'activityBar.background': '#ffffff',
      'sideBar.background': '#ffffff',
      'statusBar.background': '#ffffff',
      'sideBar.border': '#0f4a85'
    }
  },
  {
    id: 'monokai',
    label: 'Monokai',
    type: 'dark',
    description: 'Vibrant Monokai theme',
    filename: 'monokai.json',
    colors: {
      'editor.background': '#272822',
      'titleBar.activeBackground': '#1e1f1c',
      'activityBar.background': '#272822',
      'sideBar.background': '#1e1f1c',
      'statusBar.background': '#414339'
    }
  },
  {
    id: 'solarized-dark',
    label: 'Solarized Dark',
    type: 'dark',
    description: 'Ethan Schoonover Solarized Dark',
    filename: 'solarized_dark.json',
    colors: {
      'editor.background': '#002b36',
      'titleBar.activeBackground': '#073642',
      'activityBar.background': '#073642',
      'sideBar.background': '#073642',
      'statusBar.background': '#002b36'
    }
  },
  {
    id: 'quiet-light',
    label: 'Quiet Light',
    type: 'light',
    description: 'Soft quiet light theme',
    filename: 'quiet_light.json',
    colors: {
      'editor.background': '#f5f5f5',
      'titleBar.activeBackground': '#e8e8e8',
      'activityBar.background': '#ededed',
      'sideBar.background': '#f0f0f0',
      'statusBar.background': '#7a3e9d'
    }
  }
];
