/**
 * FallbackEngine.js
 * Engine to parse VS Code default colors and automatically inject them into unset CSS variables.
 * Complements the Zero Runtime Cost architecture and prevents color pickers from defaulting to black (#000000).
 */
export class FallbackEngine {
  static defaultColors = {};

  /**
   * Fetch vscode-colors-db.json and extract default HEX colors.
   */
  static async init() {
    try {
      const res = await fetch('../src/assets/vscode-colors-db.json');
      const db = await res.json();
      
      db.forEach(entry => {
        // Regex to extract HEX color from formats like 'dark: "#333333"'
        // Skips variable references for now, focusing on direct HEX values.
        const match = entry.code.match(/dark:\s*['"](#[0-9a-fA-F]{3,8})['"]/i);
        if (match) {
          let hex = match[1];
          // Standardize format to #RRGGBB (6 hex digits) for HTML color inputs
          if (hex.length === 4) {
            // #RGB -> #RRGGBB
            hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
          } else if (hex.length === 9) {
            // #RRGGBBAA -> #RRGGBB (strip alpha channel)
            hex = hex.substring(0, 7);
          }
          this.defaultColors[entry.id] = hex.toLowerCase();
        }
      });
      console.log(`[FallbackEngine] Loaded ${Object.keys(this.defaultColors).length} default hex colors from DB.`);
    } catch (err) {
      console.error('[FallbackEngine] Initialization failed:', err);
    }
  }

  /**
   * Inject extracted default colors into the DOM root (<html>) as CSS variables.
   */
  static injectDefaults() {
    Object.keys(this.defaultColors).forEach(rawId => {
      const cssVarName = `--vscode-${rawId.replace(/\./g, '-')}`;
      // Inject default only if not already set inline by the user
      const currentVal = document.documentElement.style.getPropertyValue(cssVarName);
      if (!currentVal) {
        document.documentElement.style.setProperty(cssVarName, this.defaultColors[rawId]);
      }
    });
  }
}
