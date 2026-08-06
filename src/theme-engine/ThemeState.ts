import type { BaseThemeData, RegistryColorDefinition, ThemeStats } from './types';

export class ThemeState {
  private registry: Map<string, RegistryColorDefinition> = new Map();
  private baseTheme: BaseThemeData | null = null;
  private overrides: Map<string, string> = new Map();

  public loadRegistry(registryData: RegistryColorDefinition[]): void {
    this.registry.clear();
    for (const def of registryData) {
      this.registry.set(def.id, def);
    }
  }

  public loadBaseTheme(theme: BaseThemeData): void {
    this.baseTheme = theme;
  }

  public setOverride(id: string, colorHex: string): void {
    this.overrides.set(id, colorHex);
  }

  public removeOverride(id: string): void {
    this.overrides.delete(id);
  }

  public getRegistryDefinition(id: string): RegistryColorDefinition | undefined {
    return this.registry.get(id);
  }

  public getBaseThemeColor(id: string): string | undefined {
    return this.baseTheme?.colors[id];
  }

  public getOverride(id: string): string | undefined {
    return this.overrides.get(id);
  }
  
  public getAllRegistryIds(): string[] {
    return Array.from(this.registry.keys());
  }

  public getStats(): ThemeStats {
    return {
      totalRegistryColors: this.registry.size,
      baseThemeUsage: this.baseTheme ? Object.keys(this.baseTheme.colors).length : 0,
      userModifiedCount: this.overrides.size,
    };
  }
}
