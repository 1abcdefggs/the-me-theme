import { ThemeState } from './ThemeState';
import { ColorResolver } from './ColorResolver';
import { Exporter } from './Exporter';

// Singleton instances for easy usage
export const themeEngineState = new ThemeState();
export const colorResolver = new ColorResolver(themeEngineState);
export const themeExporter = new Exporter(themeEngineState, colorResolver);

export * from './types';
export { Color } from '../vscode-color-engine/color';
export * from './ColorTransform';
export * from './ThemeState';
export * from './ColorResolver';
export * from './Exporter';
