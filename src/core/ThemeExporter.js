/**
 * ThemeExporter.js
 */
export class ThemeExporter {
  static modifiedColors = {};
  static currentBase = 'dark';

  /**
   * @param {string} colorId - VS Code Color ID (ex: "activityBar.background")
   * @param {string} hexValue - Modified Hex value (ex: "#ff00ff")
   */
  static recordChange(colorId, hexValue) {
    this.modifiedColors[colorId] = hexValue;
  }

  /**
   * @param {string} themeName - 
   */
  static exportToJson(themeName = "My TheMeTheme") {
    const themeFormat = {
      name: themeName,
      type: this.currentBase.includes('light') ? 'light' : 'dark',
      colors: this.modifiedColors,
      tokenColors: []
    };

    const jsonString = JSON.stringify(themeFormat, null, 4);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeName.replace(/\s+/g, '-').toLowerCase()}-color-theme.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
