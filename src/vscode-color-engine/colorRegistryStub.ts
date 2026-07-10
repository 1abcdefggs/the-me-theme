// @ts-nocheck
import { Color } from './color';

export type ColorValue = string | ColorTransform | Color | null | any;

export interface ColorDefaults {
    dark?: ColorValue;
    light?: ColorValue;
    hcDark?: ColorValue;
    hcLight?: ColorValue;
}

export const colorRegistry = new Map<string, { id: string, defaults: any, description: string }>();

export function registerColor(id: string, defaults: any, description: string, deprecationMessage?: any, extra?: any) {
    colorRegistry.set(id, { id, defaults, description });
    return id;
}

export var ColorTransformType: any; 
ColorTransformType = { 
    Transparent: "transparent", 
    Darken: "darken", 
    Lighten: "lighten", 
    LessProminent: "lessProminent", 
    IfDefinedThenElse: "ifDefinedThenElse", 
    OneOf: "oneOf", 
    Mix: "mix" 
};

export interface ColorTransform {
    type: string;
    args: any[];
}

export function transparent(color: string, factor: number): ColorTransform {
    return { type: ColorTransformType.Transparent, args: [color, factor] };
}

export function darken(color: string, factor: number): ColorTransform {
    return { type: ColorTransformType.Darken, args: [color, factor] };
}

export function lighten(color: string, factor: number): ColorTransform {
    return { type: ColorTransformType.Lighten, args: [color, factor] };
}

export function lessProminent(color: string, backgroundColor: string, factor: number, opacity: number): ColorTransform {
    return { type: ColorTransformType.LessProminent, args: [color, backgroundColor, factor, opacity] };
}

export function ifDefinedThenElse(ifDefined: string, thenObj: ColorValue, elseObj: ColorValue): ColorTransform {
    return { type: ColorTransformType.IfDefinedThenElse, args: [ifDefined, thenObj, elseObj] };
}

export function oneOf(...colors: string[]): ColorTransform {
    return { type: ColorTransformType.OneOf, args: colors };
}
