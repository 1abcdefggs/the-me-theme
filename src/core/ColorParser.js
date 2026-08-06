/**
 * ColorParser.js
 * Sandwich parsing engine for decomposing VS Code color variables into 4-layer model.
 */

export class ColorParser {
  static PROPERTY_DICT = [
    'background', 'foreground', 'border', 'shadow', 'highlight',
    'red', 'green', 'blue', 'yellow', 'black', 'white', 'boolean', 'string', 'number'
  ].sort((a, b) => b.length - a.length);

  static MODIFIER_DICT = [
    'hover', 'active', 'focus', 'disabled', 'inactive', 'unfocused',
    'selected', 'selection', 'toggled', 'error', 'warning', 'info', 'contrast'
  ].sort((a, b) => b.length - a.length);

  /**
   * ID parse
   * @param {string} rawId - ID
   * @returns {{ context: string|null, element: string|null, modifier: string, property: string, rawId: string }}
   */
  static parse(rawId) {
    let context = null;
    let element = null;
    let modifier = 'base';
    let property = 'unknown';

    let remainder = rawId;

    // 1. Extract Context (Left)
    if (remainder.includes('.')) {
      const parts = remainder.split('.');
      context = parts[0];
      remainder = parts.slice(1).join('.'); // ex: "secondaryHoverBackground"
    }

    let lowerRemainder = remainder.toLowerCase();

    let foundProp = false;
    for (const prop of this.PROPERTY_DICT) {
      if (lowerRemainder.endsWith(prop.toLowerCase())) {
        property = prop;

        remainder = remainder.substring(0, remainder.length - prop.length);
        lowerRemainder = lowerRemainder.substring(0, lowerRemainder.length - prop.length);
        foundProp = true;
        break;
      }
    }

    if (!foundProp && remainder.length > 0) {
      property = remainder;
      remainder = "";
      lowerRemainder = "";
    }

    if (remainder.length > 0) {
      for (const mod of this.MODIFIER_DICT) {
        if (lowerRemainder.endsWith(mod.toLowerCase())) {
          modifier = mod;
          remainder = remainder.substring(0, remainder.length - mod.length);
          lowerRemainder = lowerRemainder.substring(0, lowerRemainder.length - mod.length);
          break;
        }
      }
    }

    if (remainder.length > 0) {
      element = remainder.charAt(0).toLowerCase() + remainder.slice(1);
    }

    return {
      context,
      element,
      modifier: modifier.toLowerCase(),
      property: property.toLowerCase(),
      rawId
    };
  }
}
