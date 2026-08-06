import { themeEngineState, colorResolver, themeExporter } from '../theme-engine';
import type { BaseThemeData, RegistryColorDefinition } from '../theme-engine';
import rawDb from '../data/db/vscode-colors-db.json';
import defaultDarkTheme from '../data/themes/2026-dark.resolved.json';

/**
 * Initialize the ThemeEngine with registry and base theme data.
 */
export function initThemeEngine(): void {
  // Load full registry definition
  themeEngineState.loadRegistry(rawDb as unknown as RegistryColorDefinition[]);

  // Load default base theme
  themeEngineState.loadBaseTheme(defaultDarkTheme as BaseThemeData);

  renderStatsBadge();
}

/**
 * Renders or updates the statistics badge in the UI header/toolbar if present.
 */
export function renderStatsBadge(): void {
  const stats = themeEngineState.getStats();
  const badgeContainer = document.getElementById('theme-engine-stats-badge');
  
  if (badgeContainer) {
    badgeContainer.textContent = `Base: ${stats.baseThemeUsage} | Custom: ${stats.userModifiedCount} | Total: ${stats.totalRegistryColors}`;
  }
}

/**
 * Applies all resolved colors to the specified container as CSS variables (`--vscode-*`).
 * @param container Target element (defaults to #vscode-mock-container or body)
 * @param mode 'dark' | 'light' | 'hcDark' | 'hcLight'
 */
export function applyThemeToUI(
  container: HTMLElement | null = document.getElementById('vscode-mock-container'),
  mode: 'dark' | 'light' | 'hcDark' | 'hcLight' = 'dark'
): void {
  if (!container) return;

  const resolvedColors = colorResolver.resolveAll(mode);
  for (const item of resolvedColors) {
    if (item.color) {
      const varName = `--vscode-${item.id.replace(/\./g, '-')}`;
      container.style.setProperty(varName, item.color.toString());
    }
  }

  renderStatsBadge();
}

/**
 * Set a color override and refresh the UI CSS variables & stats.
 */
export function updateUserColorOverride(id: string, hexColor: string): void {
  themeEngineState.setOverride(id, hexColor);
  applyThemeToUI();
}

/**
 * Export customizations using the ThemeEngine Exporter.
 */
export function exportUserCustomizations(): Record<string, string> {
  return themeExporter.exportCustomizations();
}

/**
 * Export full theme using the ThemeEngine Exporter.
 */
export function exportFullTheme(name: string = 'Custom Theme', mode: 'dark' | 'light' = 'dark'): any {
  return themeExporter.exportFullTheme(name, mode);
}

/**
 * Get current stats from the engine.
 */
export function getThemeEngineStats() {
  return themeEngineState.getStats();
}
