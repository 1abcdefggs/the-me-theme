import { ThemeState } from './ThemeState';
import { ColorResolver } from './ColorResolver';

export class Exporter {
  private resolver: ColorResolver;

  constructor(_state: ThemeState, resolver: ColorResolver) {
    this.resolver = resolver;
  }

  /**
   * Returns an object containing ONLY user-modified color overrides (`workbench.colorCustomizations` format).
   */
  public exportCustomizations(): Record<string, string> {
    const result: Record<string, string> = {};
    const allResolved = this.resolver.resolveAll();
    
    for (const item of allResolved) {
      if (item.source === 'user' && item.color) {
        result[item.id] = item.color.toString();
      }
    }
    return result;
  }

  /**
   * Returns a complete VS Code Theme object suitable for a standalone theme extension.
   */
  public exportFullTheme(themeName: string = 'Custom Theme', mode: 'dark' | 'light' = 'dark'): any {
    const colors: Record<string, string> = {};
    const allResolved = this.resolver.resolveAll(mode);

    for (const item of allResolved) {
      if (item.color) {
        colors[item.id] = item.color.toString();
      }
    }

    return {
      $schema: 'vscode://schemas/color-theme',
      name: themeName,
      type: mode,
      colors,
      tokenColors: []
    };
  }
}
