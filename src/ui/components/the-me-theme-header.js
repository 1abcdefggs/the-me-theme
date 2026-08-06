class ThemeHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div id="theme-top-bar"
      style="display: flex; justify-content: space-between; align-items: center; padding: 8px 20px; background: var(--vscode-titleBar-activeBackground); color: var(--vscode-titleBar-activeForeground); border-bottom: 1px solid var(--vscode-titleBar-border); flex-shrink: 0; position: relative; z-index: 10000;">
      <div style="display: flex; align-items: center; gap: 24px;">
        <div style="font-weight: bold; font-size: 15px; display: flex; align-items: center; gap: 8px;">
          <span class="codicon codicon-symbol-color" style="color: var(--vscode-activityBar-foreground); font-size: 18px;"></span>
          TheMeTheme <span style="font-size: 11px; color: var(--vscode-descriptionForeground); font-weight: normal; margin-top: 2px;">Visual Editor</span>
        </div>
        <div style="display: flex; gap: 8px; font-size: 13px; align-items: center;">
          <div class="step-dropdown">
            <div class="step-dropdown-title" data-workflow="setup" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;">
              1 SETUP <span class="codicon codicon-chevron-down" style="font-size: 11px;"></span>
            </div>
            <div class="step-dropdown-menu" style="min-width: 280px; padding: 8px 0; border: 1px solid #007acc; background: #1e1e1e; color: #cccccc; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
              <div style="padding: 4px 12px; font-size: 11px; color: #007acc; font-weight: bold; letter-spacing: 0.5px;">⚡ Quick Start</div>
              <div class="step-dropdown-item" id="step1-quick-start">📄 Start Blank (VS Code Default)</div>
              <div class="step-dropdown-item" id="step1-quick-pick-btn">🎨 Select Base Theme (Quick Pick)</div>
              <div style="height: 1px; background: #333; margin: 6px 0;"></div>
              <div style="padding: 4px 12px; font-size: 11px; color: #007acc; font-weight: bold; letter-spacing: 0.5px;">📁 Load Existing Theme</div>
              <div class="step-dropdown-item" id="step1-import-btn">📥 Import Theme (File/GitHub/vsce)</div>
            </div>
          </div>
          <div style="width: 1px; height: 16px; background: var(--vscode-titleBar-border); margin: 0 4px;"></div>
          <div class="step-dropdown">
            <div class="step-dropdown-title" data-workflow="edit" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;">
              2 EDIT <span class="codicon codicon-chevron-down" style="font-size: 11px;"></span>
            </div>
            <div class="step-dropdown-menu" style="min-width: 240px; padding: 8px 0; border: 1px solid #007acc; background: #1e1e1e; color: #cccccc; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
              <div style="padding: 4px 12px; font-size: 11px; color: #007acc; font-weight: bold; letter-spacing: 0.5px;">🎨 Color & Layout Tools</div>
              <div class="step-dropdown-item" id="header-edit-visual">🎯 Click-to-Edit Visual Mode</div>
              <div class="step-dropdown-item" id="header-edit-layout">⚙️ Workbench Layout Settings</div>
              <div class="step-dropdown-item" id="header-edit-color-norm">🌈 Color Norm & WCAG Contrast</div>
            </div>
          </div>
          <div style="width: 1px; height: 16px; background: var(--vscode-titleBar-border); margin: 0 4px;"></div>
          <div class="step-dropdown">
            <div class="step-dropdown-title" data-workflow="export" style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; font-size: 13px; cursor: pointer;">
              3 EXPORT <span class="codicon codicon-chevron-down" style="font-size: 11px;"></span>
            </div>
            <div class="step-dropdown-menu" style="min-width: 220px; padding: 8px 0; border: 1px solid #007acc; background: #1e1e1e; color: #cccccc; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
              <div style="padding: 4px 12px; font-size: 11px; color: #007acc; font-weight: bold; letter-spacing: 0.5px;">📦 Export Options</div>
              <div class="step-dropdown-item" id="header-export-publish">📦 Publish Extension (.vsix)</div>
              <div class="step-dropdown-item" id="header-export-download">💾 Download JSON Theme</div>
              <div class="step-dropdown-item" id="header-export-copy">📋 Copy JSON to Clipboard</div>
            </div>
          </div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 12px;">
        <button id="toggle-ui-mode-btn" title="Toggle UI Mode"
          style="border: 1px solid var(--vscode-button-border, var(--vscode-titleBar-border)); border-radius: 4px; padding: 4px 10px; background: var(--vscode-button-secondaryBackground); color: var(--vscode-button-secondaryForeground); cursor: pointer; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500;">
          <span class="codicon codicon-layout"></span>
          Toggle UI Mode
        </button>
      </div>
    </div>
    `;
  }
}
customElements.define('the-me-theme-header', ThemeHeader);

