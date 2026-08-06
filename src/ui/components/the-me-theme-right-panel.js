class ThemeRightPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div id="right-panel" class="theme-panel" style="width: 320px; min-width: 320px; border-left: 1px solid var(--vscode-sideBar-border);">
      <div class="theme-panel-header">
        <span>Color Inspector</span>
        <button id="toggle-right-panel-btn" title="Collapse Right Panel" style="background: transparent; border: none; color: var(--vscode-descriptionForeground); cursor: pointer; padding: 2px 4px; display: flex; align-items: center;">
          <span class="codicon codicon-chevron-right"></span>
        </button>
      </div>
      <div id="inspector-panel" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
        <header class="inspector-header">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h2 style="margin: 0; font-size: 14px; color: var(--vscode-foreground);">Theme Variables</h2>
            <div id="theme-progress" style="font-size: 11px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); padding: 2px 8px; border-radius: 10px; font-weight: 600;">
              0 / 916 Customized
            </div>
          </div>
          <div class="controls" style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 5px;">
              <input type="text" id="search-input" placeholder="Search..." style="flex: 1;">
              <button id="view-toggle-btn">Toggle Tree</button>
              <button id="bulk-tools-toggle-btn">Bulk Tools</button>
            </div>
            <div class="export-mode-tabs" style="display: flex; background: var(--vscode-editor-background); border-radius: 3px; padding: 2px;">
              <button class="export-tab active" data-mode="customizations" style="flex: 1; padding: 4px; font-size: 11px; border: none; border-radius: 2px; background: var(--vscode-button-background); color: var(--vscode-button-foreground); cursor: pointer;">Customizations</button>
              <button class="export-tab" data-mode="theme" style="flex: 1; padding: 4px; font-size: 11px; border: none; border-radius: 2px; background: transparent; color: var(--vscode-foreground); cursor: pointer;">Theme File</button>
              <button class="export-tab" data-mode="raw" style="flex: 1; padding: 4px; font-size: 11px; border: none; border-radius: 2px; background: transparent; color: var(--vscode-foreground); cursor: pointer;">Raw JSON</button>
            </div>
            <button id="export-btn" style="width: 100%;">Copy JSON</button>
          </div>
        </header>
        <div id="variables-list" style="display: none;"></div>

        <div id="bulk-tools-panel" style="display: none; padding: 15px; border-top: 1px solid var(--vscode-sideBar-border); flex: 1; overflow-y: auto;">
          <h3 style="margin-top: 0; font-size: 13px; color: var(--vscode-foreground);">ALLgen (Bulk Generate)</h3>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 10px;">Check categories and press Generate to insert all default colors into your JSON.</div>
          <div id="allgen-categories" style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px;">
            <label style="font-size: 11px;"><input type="checkbox" value="editor" checked> editor</label>
            <label style="font-size: 11px;"><input type="checkbox" value="sideBar"> sideBar</label>
            <label style="font-size: 11px;"><input type="checkbox" value="activityBar"> activityBar</label>
            <label style="font-size: 11px;"><input type="checkbox" value="statusBar"> statusBar</label>
            <label style="font-size: 11px;"><input type="checkbox" value="titleBar"> titleBar</label>
            <label style="font-size: 11px;"><input type="checkbox" value="tab"> tab</label>
            <label style="font-size: 11px;"><input type="checkbox" value="button"> button</label>
            <label style="font-size: 11px;"><input type="checkbox" value="list"> list</label>
            <label style="font-size: 11px;"><input type="checkbox" value="terminal"> terminal</label>
            <label style="font-size: 11px; color: var(--vscode-editorWarning-foreground);"><input type="checkbox" value="all"> <b>ALL (900+)</b></label>
          </div>
          <button id="allgen-btn" class="header-btn primary" style="width: 100%; margin-bottom: 20px;">Generate Colors</button>

          <h3 style="margin-top: 0; font-size: 13px; color: var(--vscode-foreground);">Bulk Set Color (by suffix)</h3>
          <div style="display: flex; gap: 5px; margin-bottom: 10px;">
            <select id="bulk-suffix-select" style="flex: 1; background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border); color: var(--vscode-input-foreground); padding: 4px;">
              <option value="background">background</option>
              <option value="foreground">foreground</option>
              <option value="border">border</option>
              <option value="activeBackground">activeBackground</option>
              <option value="inactiveBackground">inactiveBackground</option>
              <option value="hoverBackground">hoverBackground</option>
            </select>
            <input type="color" id="bulk-color-picker" value="#ff0000" style="width: 30px; height: 24px; padding: 0; border: none; cursor: pointer;">
          </div>
          <button id="bulk-apply-btn" class="header-btn" style="width: 100%; margin-bottom: 20px;">Apply to ALL</button>

          <h3 style="margin-top: 0; font-size: 13px; color: var(--vscode-foreground);">Pattern Mapper</h3>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 10px;">Apply a 3-color palette to standard component keys (Bg/Fg/Border) across all UI elements.</div>
          <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span>Base Background</span> <input type="color" id="pattern-bg" value="#1e1e1e" style="cursor:pointer; border:none; padding:0; width:30px; height:20px;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span>Base Foreground</span> <input type="color" id="pattern-fg" value="#cccccc" style="cursor:pointer; border:none; padding:0; width:30px; height:20px;">
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px;">
              <span>Base Border</span> <input type="color" id="pattern-border" value="#333333" style="cursor:pointer; border:none; padding:0; width:30px; height:20px;">
            </div>
          </div>
          <button id="pattern-apply-btn" class="header-btn" style="width: 100%; margin-bottom: 20px;">Map Pattern to Components</button>

          <h3 style="margin-top: 0; font-size: 13px; color: var(--vscode-foreground);">Code Formatter</h3>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom: 10px;">Simplify 6-digit colors to 3-digit shorthand (e.g. #ff00cc -&gt; #f0c) where possible for a cleaner JSON.</div>
          <button id="minify-hex-btn" class="header-btn" style="width: 100%;">Minify Hex (#RGB)</button>
        </div>

        <div id="inspector-placeholder" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--vscode-descriptionForeground); font-size: 12px; text-align: center; padding: 20px;">
          <span class="codicon codicon-symbol-color" style="font-size: 48px; margin-bottom: 15px; opacity: 0.5;"></span>
          <p>Select Component<br>Edit color / Bulk Tools / Pattern Tools</p>
        </div>
      </div>
    </div>
    `;
  }
}

customElements.define('the-me-theme-right-panel', ThemeRightPanel);

