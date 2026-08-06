

export interface InspectorVariable {
  id: string;
  description: string;
}

export interface InspectorOptions {
  containerEl: HTMLElement;
  searchInput: HTMLInputElement;
  progressElement: HTMLElement | null;
  onColorChange: (varId: string, color: string) => void;
  openPalette: (varId: string, initialColor: string) => void;
}

export class InspectorController {
  private options: InspectorOptions;
  private userOverrides: Record<string, { current: string }> = {};

  constructor(options: InspectorOptions) {
    this.options = options;
    this.options.searchInput.addEventListener('input', () => this.renderList());
  }

  public setOverrides(overrides: Record<string, { current: string }>): void {
    this.userOverrides = overrides;
    this.renderList();
  }

  public renderList(variables: InspectorVariable[] = []): void {
    const listContainer = this.options.containerEl;
    const filterText = this.options.searchInput.value.toLowerCase().trim();
    if (!listContainer) return;

    listContainer.innerHTML = '';

    const filtered = variables.filter(v => 
      v.id.toLowerCase().includes(filterText) || 
      (v.description && v.description.toLowerCase().includes(filterText))
    );

    const customizedCount = Object.keys(this.userOverrides).length;
    if (this.options.progressElement) {
      this.options.progressElement.textContent = `${customizedCount} / ${variables.length || 916} Customized`;
    }

    filtered.forEach(v => {
      const currentOverride = this.userOverrides[v.id]?.current || '';
      const isCustomized = !!currentOverride;

      const item = document.createElement('div');
      item.className = 'variable-item';
      item.style.cssText = `
        padding: 8px 12px;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
      `;

      const info = document.createElement('div');
      info.style.cssText = 'flex: 1; min-width: 0; padding-right: 10px;';

      const name = document.createElement('div');
      name.textContent = v.id;
      name.style.cssText = `font-weight: 500; font-family: monospace; color: ${isCustomized ? '#4fc1ff' : '#cccccc'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`;

      info.appendChild(name);

      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 28px;
        height: 20px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.2);
        background: ${currentOverride || 'var(--vscode-' + v.id.replace(/\./g, '-') + ', #3c3c3c)'};
        cursor: pointer;
        flex-shrink: 0;
      `;

      colorBox.addEventListener('click', () => {
        this.options.openPalette(v.id, currentOverride || '#007acc');
      });

      item.appendChild(info);
      item.appendChild(colorBox);
      listContainer.appendChild(item);
    });
  }
}
