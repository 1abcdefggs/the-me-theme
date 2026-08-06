/**
 * src/core/export-formatter.ts
 * Theme export: 3-format output generation
 * NO DOM dependencies
 */
import type { ExportFormat, ThemeMetadata, TokenColorRule } from './types';

// ============================================================
// Theme Exporter
// ============================================================

export class ThemeExporter {
  /**
   * Generate JSON string output in the selected export format.
   * Cleans empty/undefined color values before output.
   */
  static generateOutput(
    colors: Record<string, string>,
    tokenColors: TokenColorRule[],
    metadata: ThemeMetadata,
    format: ExportFormat
  ): string {
    // Clean: remove empty/null color entries
    const cleanColors = Object.fromEntries(
      Object.entries(colors).filter(([, v]) => v && v.trim() !== '')
    );

    // Clean: remove tokenColor rules with no foreground
    const cleanTokenColors = tokenColors
      .filter((r) => r.settings.foreground || r.settings.fontStyle)
      .map((r) => {
        const cloned = { ...r, settings: { ...r.settings } };
        if (cloned.settings.fontStyle === '') {
          delete cloned.settings.fontStyle;
        }
        return cloned;
      });

    switch (format) {
      case 'customizations':
        return JSON.stringify(
          {
            'workbench.colorCustomizations': cleanColors,
            'editor.tokenColorCustomizations': {
              textMateRules: cleanTokenColors,
            },
          },
          null,
          2
        );

      case 'themeFile':
        return JSON.stringify(
          {
            $schema: 'vscode://schemas/color-theme',
            name: metadata.name || 'My Theme',
            type: metadata.type || 'dark',
            colors: cleanColors,
            tokenColors: cleanTokenColors,
          },
          null,
          2
        );

      case 'rawJson':
        return JSON.stringify(cleanColors, null, 2);
    }
  }
}

// ============================================================
// Clipboard helper with "Copied!" feedback
// ============================================================

/**
 * Copy text to clipboard and temporarily swap button label/icon.
 * @param text - content to copy
 * @param btnEl - the button element to show "Copied!" feedback on
 */
export async function copyToClipboardWithFeedback(
  text: string,
  btnEl: HTMLButtonElement | null
): Promise<void> {
  await navigator.clipboard.writeText(text);

  if (!btnEl) return;

  const original = btnEl.innerHTML;
  btnEl.innerHTML = '<i class="codicon codicon-check"></i> Copied!';
  btnEl.disabled = true;

  setTimeout(() => {
    btnEl.innerHTML = original;
    btnEl.disabled = false;
  }, 2000);
}

// ============================================================
// Export format descriptions (for Usage Guide UI)
// ============================================================

export const EXPORT_FORMAT_META: Record<
  ExportFormat,
  { label: string; fileHint: string; description: string }
> = {
  customizations: {
    label: 'Workbench Customizations',
    fileHint: 'settings.json',
    description:
      'Paste into your VS Code settings.json to override colors instantly. Perfect for personal use.',
  },
  themeFile: {
    label: 'Theme Extension File',
    fileHint: '*-color-theme.json',
    description:
      'Use this for packaging as a VS Code extension (.vsix) or publishing to the Marketplace.',
  },
  rawJson: {
    label: 'Raw JSON',
    fileHint: 'colors.json',
    description: 'Flat key-value color map. Useful for debugging or custom tooling.',
  },
};
