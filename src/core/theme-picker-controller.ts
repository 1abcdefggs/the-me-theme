import { VSCODE_THEME_PRESETS, type ThemePreset } from './theme-presets';

export interface ThemePickerOptions {
  onPreview: (preset: ThemePreset) => void;
  onApply: (preset: ThemePreset) => void;
  onCancel: () => void;
}

export class ThemePickerController {
  private containerEl: HTMLElement | null = null;
  private inputEl: HTMLInputElement | null = null;
  private listEl: HTMLElement | null = null;
  private selectedIndex: number = 0;
  private filteredPresets: ThemePreset[] = [...VSCODE_THEME_PRESETS];
  private isOpen: boolean = false;
  private options: ThemePickerOptions;

  constructor(options: ThemePickerOptions) {
    this.options = options;
    this.createDom();
  }

  private createDom(): void {
    const existing = document.getElementById('vscode-quick-pick-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'vscode-quick-pick-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.4);
      z-index: 100000;
      display: none;
      justify-content: center;
      align-items: flex-start;
      padding-top: 50px;
    `;

    const widget = document.createElement('div');
    widget.className = 'vscode-quick-pick-widget';
    widget.style.cssText = `
      width: 600px;
      max-width: 90vw;
      background: var(--vscode-quickInput-background, #252526);
      color: var(--vscode-quickInput-foreground, #cccccc);
      border: 1px solid var(--vscode-widget-border, #454545);
      border-radius: 6px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.6);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
    `;

    const inputWrapper = document.createElement('div');
    inputWrapper.style.cssText = `
      padding: 8px 10px;
      background: var(--vscode-quickInput-background, #252526);
      border-bottom: 1px solid var(--vscode-widget-border, #3c3c3c);
    `;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Select Color Theme (Type to filter, ↑↓ to preview, Enter to select, Esc to cancel)';
    input.style.cssText = `
      width: 100%;
      background: var(--vscode-input-background, #3c3c3c);
      color: var(--vscode-input-foreground, #cccccc);
      border: 1px solid var(--vscode-input-border, #555555);
      outline: none;
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 13px;
      box-sizing: border-box;
    `;

    inputWrapper.appendChild(input);

    const list = document.createElement('div');
    list.className = 'quick-pick-list';
    list.style.cssText = `
      max-height: 360px;
      overflow-y: auto;
      padding: 4px 0;
    `;

    widget.appendChild(inputWrapper);
    widget.appendChild(list);
    overlay.appendChild(widget);
    document.body.appendChild(overlay);

    this.containerEl = overlay;
    this.inputEl = input;
    this.listEl = list;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.close(false);
      }
    });

    input.addEventListener('input', () => {
      this.filter(input.value);
    });

    input.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  public open(): void {
    if (!this.containerEl || !this.inputEl) return;
    this.isOpen = true;
    this.containerEl.style.display = 'flex';
    this.inputEl.value = '';
    this.filter('');
    this.inputEl.focus();
  }

  public close(commit: boolean = false): void {
    if (!this.containerEl) return;
    this.isOpen = false;
    this.containerEl.style.display = 'none';

    if (commit && this.filteredPresets[this.selectedIndex]) {
      this.options.onApply(this.filteredPresets[this.selectedIndex]);
    } else {
      this.options.onCancel();
    }
  }

  private filter(query: string): void {
    const q = query.toLowerCase().trim();
    this.filteredPresets = VSCODE_THEME_PRESETS.filter(p => 
      p.label.toLowerCase().includes(q) || 
      p.id.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
    this.selectedIndex = 0;
    this.renderList();
    if (this.filteredPresets.length > 0) {
      this.options.onPreview(this.filteredPresets[0]);
    }
  }

  private renderList(): void {
    if (!this.listEl) return;
    this.listEl.innerHTML = '';

    if (this.filteredPresets.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding: 12px 16px; color: #888; text-align: center;';
      empty.textContent = 'No matching color themes found';
      this.listEl.appendChild(empty);
      return;
    }

    this.filteredPresets.forEach((preset, index) => {
      const item = document.createElement('div');
      const isSelected = index === this.selectedIndex;
      item.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 7px 14px;
        cursor: pointer;
        background: ${isSelected ? 'var(--vscode-quickInputList-focusBackground, #04395e)' : 'transparent'};
        color: ${isSelected ? 'var(--vscode-quickInputList-focusForeground, #ffffff)' : 'var(--vscode-foreground, #cccccc)'};
      `;

      const left = document.createElement('div');
      left.style.cssText = 'display: flex; align-items: center; gap: 10px;';

      const icon = document.createElement('span');
      icon.className = 'codicon codicon-color-mode';
      icon.style.cssText = `font-size: 14px; color: ${preset.type.includes('dark') || preset.type === 'hcDark' ? '#007acc' : '#e2c08d'};`;

      const label = document.createElement('span');
      label.textContent = preset.label;
      label.style.fontWeight = isSelected ? '600' : '400';

      left.appendChild(icon);
      left.appendChild(label);

      const right = document.createElement('span');
      right.textContent = preset.type;
      right.style.cssText = 'font-size: 11px; opacity: 0.6; text-transform: uppercase; border: 1px solid rgba(255,255,255,0.2); padding: 1px 5px; border-radius: 3px;';

      item.appendChild(left);
      item.appendChild(right);

      item.addEventListener('mouseenter', () => {
        this.selectedIndex = index;
        this.renderList();
        this.options.onPreview(preset);
      });

      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.close(true);
      });

      this.listEl!.appendChild(item);
    });

    // Ensure focused item is visible in scroll container
    const selectedChild = this.listEl.children[this.selectedIndex] as HTMLElement;
    if (selectedChild) {
      selectedChild.scrollIntoView({ block: 'nearest' });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.filteredPresets.length > 0) {
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredPresets.length;
        this.renderList();
        this.options.onPreview(this.filteredPresets[this.selectedIndex]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.filteredPresets.length > 0) {
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredPresets.length) % this.filteredPresets.length;
        this.renderList();
        this.options.onPreview(this.filteredPresets[this.selectedIndex]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.close(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      this.close(false);
    }
  }
}
