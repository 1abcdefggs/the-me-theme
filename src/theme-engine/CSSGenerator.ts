/**
 * CSSGenerator.ts
 */
export class CSSGenerator {
  /**
   * @param expr VS Code expression (ex: "#ff0000", "editor.background", "transparent(activityBar.foreground, 0.4)")
   */
  public static convertToCSSValue(expr: string): string {
    if (!expr) return 'transparent';
    expr = expr.trim();

    if (expr.startsWith('#') || expr.startsWith('rgb') || expr.startsWith('hsl')) {
      return expr;
    }


    const functionMatch = expr.match(/^([a-zA-Z]+)\((.+)\)$/);
    if (functionMatch) {
      const funcName = functionMatch[1];
      const args = functionMatch[2].split(',').map(arg => arg.trim());
      const refVar = this.formatVarName(args[0]);

      switch (funcName) {
        case 'transparent': {

          const opacityPct = Math.round(parseFloat(args[1]) * 100);
          return `color-mix(in srgb, ${refVar} ${opacityPct}%, transparent)`;
        }
        case 'darken': {

          const darkenPct = Math.round(parseFloat(args[1]) * 100);
          return `color-mix(in srgb, ${refVar} ${100 - darkenPct}%, black)`;
        }
        case 'lighten': {

          const lightenPct = Math.round(parseFloat(args[1]) * 100);
          return `color-mix(in srgb, ${refVar} ${100 - lightenPct}%, white)`;
        }
        case 'lessProminent': {
          return `color-mix(in srgb, ${refVar} 50%, transparent)`;
        }
        default: {
          return refVar;
        }
      }
    }

    return this.formatVarName(expr);
  }


  public static formatVarName(id: string): string {
    const normalizedId = id.toLowerCase().replace(/_/g, '.');
    return `var(--vscode-${normalizedId.replace(/\./g, '-')})`;
  }
}
