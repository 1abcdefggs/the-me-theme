import type { ColorValue, ColorTransform } from './types';

export const ColorTransformType = { 
    Transparent: "transparent", 
    Darken: "darken", 
    Lighten: "lighten", 
    LessProminent: "lessProminent", 
    IfDefinedThenElse: "ifDefinedThenElse", 
    OneOf: "oneOf", 
    Mix: "mix" 
};

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
