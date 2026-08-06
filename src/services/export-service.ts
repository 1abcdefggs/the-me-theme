// src/services/export-service.ts
import JSZip from 'jszip';

export function downloadJsonFile(jsonContent: string, filename: string) {
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function downloadThemeExtensionZip(opts: {
    finalName: string,
    finalAuthor: string,
    finalLicense: string,
    finalJsonStr: string
}) {
    const safeName = opts.finalName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const packageJson = {
        name: safeName,
        displayName: opts.finalName,
        description: `${opts.finalName} theme generated via TheMeTheme editor`,
        version: "0.0.1",
        publisher: opts.finalAuthor !== 'anonymous' ? opts.finalAuthor.toLowerCase().replace(/[^a-z0-9-]/g, '-') : 'theme-creator',
        engines: { vscode: "^1.60.0" },
        categories: ["Themes"],
        contributes: {
            themes: [
                {
                    label: opts.finalName,
                    uiTheme: "vs-dark",
                    path: `./themes/${safeName}-color-theme.json`
                }
            ]
        }
    };

    const readmeMd = `# ${opts.finalName}\n\nGenerated with [TheMeTheme Editor](https://github.com/1abcdefggs/the-me-theme).\n\n## License\n${opts.finalLicense}`;

    const zip = new JSZip();
    zip.file("package.json", JSON.stringify(packageJson, null, 2));
    zip.file("README.md", readmeMd);
    
    const themesFolder = zip.folder("themes");
    if (themesFolder) {
        themesFolder.file(`${safeName}-color-theme.json`, opts.finalJsonStr);
    }

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeName}-${packageJson.version}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
