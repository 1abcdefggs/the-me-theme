// @ts-nocheck
import { Color } from './color';
import { colorRegistry, ColorTransformType } from './colorRegistryStub';
import type { ColorValue } from './colorRegistryStub';

import './colors/baseColors';
import './colors/chartsColors';
import './colors/editorColors';
import './colors/inputColors';
import './colors/listColors';
import './colors/menuColors';
import './colors/minimapColors';
import './colors/miscColors';
import './colors/quickpickColors';
import './colors/searchColors';

export { colorRegistry, Color };

export function resolveColor(
    id: string, 
    themeType: 'dark' | 'light' | 'hcDark' | 'hcLight', 
    overrides: Record<string, string>
): Color | null {
    // Check if the user overrode this color directly
    if (overrides[id] && overrides[id].toLowerCase() !== 'default') {
        return Color.Format.CSS.parseHex(overrides[id]);
    }
    
    const definition = colorRegistry.get(id);
    if (!definition || !definition.defaults) return null; // Unknown color or missing defaults

    const val = definition.defaults[themeType];
    return evaluateColorValue(val, themeType, overrides);
}

function evaluateColorValue(val: ColorValue, themeType: 'dark'|'light'|'hcDark'|'hcLight', overrides: Record<string, string>): Color | null {
    if (!val) return null;
    
    if (typeof val === 'string') {
        if (val.startsWith('#')) return Color.Format.CSS.parseHex(val);
        // It might be a reference to another color ID!
        return resolveColor(val, themeType, overrides);
    }
    
    // It's a ColorTransform
    switch (val.type) {
        case ColorTransformType.Transparent: {
            const [colorRef, factor] = val.args;
            const c = typeof colorRef === 'string' && !colorRef.startsWith('#') 
                ? resolveColor(colorRef, themeType, overrides) 
                : evaluateColorValue(colorRef as ColorValue, themeType, overrides);
            if (!c) return null;
            return c.transparent(factor);
        }
        case ColorTransformType.Darken: {
            const [colorRef, factor] = val.args;
            const c = typeof colorRef === 'string' && !colorRef.startsWith('#') 
                ? resolveColor(colorRef, themeType, overrides) 
                : evaluateColorValue(colorRef as ColorValue, themeType, overrides);
            if (!c) return null;
            return c.darken(factor);
        }
        case ColorTransformType.Lighten: {
            const [colorRef, factor] = val.args;
            const c = typeof colorRef === 'string' && !colorRef.startsWith('#') 
                ? resolveColor(colorRef, themeType, overrides) 
                : evaluateColorValue(colorRef as ColorValue, themeType, overrides);
            if (!c) return null;
            return c.lighten(factor);
        }
        case ColorTransformType.LessProminent: {
            const [colorRef, bgRef, factor, opacity] = val.args;
            const c = typeof colorRef === 'string' && !colorRef.startsWith('#') 
                ? resolveColor(colorRef, themeType, overrides) 
                : evaluateColorValue(colorRef as ColorValue, themeType, overrides);
            if (!c) return null;
            const bg = typeof bgRef === 'string' && !bgRef.startsWith('#') 
                ? resolveColor(bgRef, themeType, overrides) 
                : evaluateColorValue(bgRef as ColorValue, themeType, overrides);
            if (!bg) return null;
            
            // From VS Code lessProminent:
            if (c.isDarkerThan(bg)) {
                return Color.getLighterColor(c, bg, factor).transparent(opacity);
            }
            return Color.getDarkerColor(c, bg, factor).transparent(opacity);
        }
        case ColorTransformType.IfDefinedThenElse: {
            const [ifDefined, thenObj, elseObj] = val.args;
            // If the user overrode it, it's defined
            if (overrides[ifDefined]) {
                return evaluateColorValue(thenObj as ColorValue, themeType, overrides);
            }
            return evaluateColorValue(elseObj as ColorValue, themeType, overrides);
        }
        case ColorTransformType.OneOf: {
            const colors = val.args;
            for (const colorRef of colors) {
                const c = resolveColor(colorRef, themeType, overrides);
                if (c) return c;
            }
            return null;
        }
    }
    return null;
}
