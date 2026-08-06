import { Color } from '../vscode-color-engine/color';
import { ColorTransformType } from './ColorTransform';
import { ThemeState } from './ThemeState';
import type { ResolvedColor, ColorValue } from './types';

export class ColorResolver {
  private state: ThemeState;

  constructor(state: ThemeState) {
    this.state = state;
  }

  public resolve(id: string, baseType: 'dark' | 'light' | 'hcDark' | 'hcLight' = 'dark'): ResolvedColor {
    // 1. User overrides
    const override = this.state.getOverride(id);
    if (override && override.toLowerCase() !== 'default') {
      const color = Color.Format.CSS.parseHex(override);
      if (color) return { id, color, source: 'user' };
    }

    // 2. Base Theme definitions
    const themeColor = this.state.getBaseThemeColor(id);
    if (themeColor) {
      const color = Color.Format.CSS.parseHex(themeColor);
      if (color) return { id, color, source: 'theme' };
    }

    // 3. Registry Defaults
    const def = this.state.getRegistryDefinition(id);
    if (def && def.defaults && def.defaults[baseType]) {
      const color = this.evaluateColorValue(def.defaults[baseType], baseType);
      if (color) return { id, color, source: 'default' };
    }

    return { id, color: null, source: 'not-found' };
  }

  private evaluateColorValue(val: ColorValue, baseType: 'dark'|'light'|'hcDark'|'hcLight'): Color | null {
    if (!val) return null;
    
    if (typeof val === 'string') {
        if (val.startsWith('#')) return Color.Format.CSS.parseHex(val);
        // It's a reference to another color ID
        const resolved = this.resolve(val, baseType);
        return resolved.color;
    }
    
    // It's a ColorTransform
    if (val && typeof val === 'object' && val.type) {
        switch (val.type) {
            case ColorTransformType.Transparent: {
                const [colorRef, factor] = val.args;
                const c = this.getColorFromRef(colorRef, baseType);
                return c ? c.transparent(factor) : null;
            }
            case ColorTransformType.Darken: {
                const [colorRef, factor] = val.args;
                const c = this.getColorFromRef(colorRef, baseType);
                return c ? c.darken(factor) : null;
            }
            case ColorTransformType.Lighten: {
                const [colorRef, factor] = val.args;
                const c = this.getColorFromRef(colorRef, baseType);
                return c ? c.lighten(factor) : null;
            }
            case ColorTransformType.LessProminent: {
                const [colorRef, bgRef, factor, opacity] = val.args;
                const c = this.getColorFromRef(colorRef, baseType);
                const bg = this.getColorFromRef(bgRef, baseType);
                if (!c || !bg) return null;
                
                if (c.isDarkerThan(bg)) {
                    return Color.getLighterColor(c, bg, factor).transparent(opacity);
                }
                return Color.getDarkerColor(c, bg, factor).transparent(opacity);
            }
            case ColorTransformType.IfDefinedThenElse: {
                const [ifDefined, thenObj, elseObj] = val.args;
                // If defined means the user overrode it or it's in the base theme
                const override = this.state.getOverride(ifDefined);
                const themeColor = this.state.getBaseThemeColor(ifDefined);
                if (override || themeColor) {
                    return this.evaluateColorValue(thenObj, baseType);
                }
                return this.evaluateColorValue(elseObj, baseType);
            }
            case ColorTransformType.OneOf: {
                const colors = val.args;
                for (const colorRef of colors) {
                    const resolved = this.resolve(colorRef, baseType);
                    if (resolved.color) return resolved.color;
                }
                return null;
            }
        }
    }
    return null;
  }

  private getColorFromRef(ref: any, baseType: 'dark'|'light'|'hcDark'|'hcLight'): Color | null {
      if (typeof ref === 'string' && !ref.startsWith('#')) {
          return this.resolve(ref, baseType).color;
      }
      return this.evaluateColorValue(ref, baseType);
  }

  public resolveAll(baseType: 'dark' | 'light' | 'hcDark' | 'hcLight' = 'dark'): ResolvedColor[] {
    const ids = this.state.getAllRegistryIds();
    return ids.map(id => this.resolve(id, baseType));
  }
}
