import JSZip from 'jszip';

export class ImportExportController {
  public static async generateThemeZip(themeName: string, colors: Record<string, string>): Promise<Blob> {
    const zip = new JSZip();
    const cleanName = themeName.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const themeJson = {
      $schema: 'vscode://schemas/color-theme',
      name: themeName,
      type: 'dark',
      colors: colors,
      tokenColors: []
    };

    const packageJson = {
      name: cleanName,
      displayName: themeName,
      description: `Custom VS Code theme generated with TheMeTheme`,
      version: '0.0.1',
      engines: { vscode: '^1.60.0' },
      categories: ['Themes'],
      contributes: {
        themes: [
          {
            label: themeName,
            uiTheme: 'vs-dark',
            path: `./themes/${cleanName}-color-theme.json`
          }
        ]
      }
    };

    zip.file('package.json', JSON.stringify(packageJson, null, 2));
    zip.file(`themes/${cleanName}-color-theme.json`, JSON.stringify(themeJson, null, 2));

    return await zip.generateAsync({ type: 'blob' });
  }

  public static downloadFile(content: string | Blob, filename: string): void {
    const a = document.createElement('a');
    if (content instanceof Blob) {
      a.href = URL.createObjectURL(content);
    } else {
      a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
    }
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
