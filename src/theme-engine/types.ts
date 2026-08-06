import { Color } from '../vscode-color-engine/color';

export type ColorSource = 'user' | 'theme' | 'default' | 'not-found';

export interface ResolvedColor {
  id: string;
  color: Color | null;
  source: ColorSource;
}

export interface ThemeStats {
  totalRegistryColors: number;
  baseThemeUsage: number;
  userModifiedCount: number;
}

export interface BaseThemeData {
  name?: string;
  type?: 'dark' | 'light' | 'hcDark' | 'hcLight';
  colors: Record<string, string>;
}

export type ColorValue = string | ColorTransform | Color | null | any;

export interface RegistryColorDefinition {
    id: string;
    description: string;
    defaults: {
        dark?: ColorValue;
        light?: ColorValue;
        hcDark?: ColorValue;
        hcLight?: ColorValue;
    } | null;
}

export interface ColorTransform {
    type: string;
    args: any[];
}
