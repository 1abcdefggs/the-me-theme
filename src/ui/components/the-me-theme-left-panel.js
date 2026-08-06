class ThemeLeftPanel extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <div id="left-panel" class="theme-panel" style="width: 250px; min-width: 250px; border-right: 1px solid var(--vscode-sideBar-border);">
      <div class="theme-panel-header">
        <span>Component Navigation</span>
        <button id="toggle-left-panel-btn" title="Collapse Left Panel" style="background: transparent; border: none; color: var(--vscode-descriptionForeground); cursor: pointer; padding: 2px 4px; display: flex; align-items: center;">
          <span class="codicon codicon-chevron-left"></span>
        </button>
      </div>
      <div class="explorer-scroll-container" style="flex: 1; overflow-y: auto; padding: 6px 0;">
        <!-- SETUP Workflow Group -->
        <div data-workflow-group="setup" style="display: none; padding: 8px 12px;">
          <div class="section-header">⚡ QUICK SETUP</div>
          <div id="left-setup-quick-start" class="card-action">
            <span class="codicon codicon-file" style="color: var(--vscode-activityBar-foreground);"></span>
            <span>Start Blank (VS Code Defaults)</span>
          </div>
          <div id="left-setup-quick-pick" class="card-action">
            <span class="codicon codicon-color-mode" style="color: var(--vscode-editorInfo-foreground);"></span>
            <span>Select Base Theme</span>
          </div>
          <div class="section-header" style="margin-top: 8px;">📁 LOAD EXISTING THEME</div>
          <div id="left-setup-import" class="card-action">
            <span class="codicon codicon-cloud-upload" style="color: var(--vscode-terminal-ansiYellow);"></span>
            <span>Import Theme (File/URL)</span>
          </div>
        </div>

        <!-- EDIT Workflow Group (Active by default) -->
        <div data-workflow-group="edit" class="active" style="display: block;">
          <div class="section-header">CONTAINERS</div>
          <div class="explorer-tree" style="padding-bottom: 6px;">
            <div class="file-node" data-component="window" data-component-id="window">
              <span class="codicon codicon-window" style="color: var(--vscode-activityBar-foreground);"></span>
              <span>Window</span>
            </div>
            <div class="file-node" data-component="titlebar" data-component-id="titlebar">
              <span class="codicon codicon-layout-statusbar" style="color: var(--vscode-editorInfo-foreground);"></span>
              <span>Title Bar</span>
            </div>
            <div class="file-node" data-component="activitybar" data-component-id="activitybar">
              <span class="codicon codicon-layout-activitybar-left" style="color: var(--vscode-editorWarning-foreground);"></span>
              <span>Activity Bar</span>
            </div>
            <div class="file-node" data-component="sidebar" data-component-id="sidebar">
              <span class="codicon codicon-layout-sidebar-left" style="color: var(--vscode-activityBar-foreground);"></span>
              <span>Primary Sidebar</span>
            </div>
            <div class="file-node" data-component="editor" data-component-id="editor">
              <span class="codicon codicon-layout-panel" style="color: var(--vscode-terminal-ansiMagenta);"></span>
              <span>Editor Area</span>
            </div>
            <div class="file-node" data-component="panel" data-component-id="panel">
              <span class="codicon codicon-terminal" style="color: var(--vscode-terminal-ansiBlue);"></span>
              <span>Terminal / Panel</span>
            </div>
            <div class="file-node" data-component="secondarysidebar" data-component-id="secondarysidebar">
              <span class="codicon codicon-layout-sidebar-right" style="color: var(--vscode-foreground);"></span>
              <span>Secondary Sidebar</span>
            </div>
            <div class="file-node" data-component="statusbar" data-component-id="statusbar">
              <span class="codicon codicon-layout" style="color: var(--vscode-activityBar-foreground);"></span>
              <span>Status Bar</span>
            </div>
          </div>

          <div class="section-header" style="border-top: 1px solid var(--vscode-sideBar-border); margin-top: 4px; padding-top: 8px;">
            COMMON UI ELEMENTS
          </div>
          <div class="explorer-tree" style="padding-bottom: 6px;">
            <div class="file-node" data-component="quickinput" data-component-id="quickinput">
              <span class="codicon codicon-symbol-property" style="color: var(--vscode-editorInfo-foreground);"></span>
              <span>Command Palette / Quick Pick</span>
            </div>
            <div class="file-node" data-component="menu" data-component-id="menu">
              <span class="codicon codicon-menu" style="color: var(--vscode-editorInfo-foreground);"></span>
              <span>Context Menu</span>
            </div>
            <div class="file-node" data-component="notification" data-component-id="notification">
              <span class="codicon codicon-bell" style="color: var(--vscode-terminal-ansiMagenta);"></span>
              <span>Notifications</span>
            </div>
            <div class="file-node" data-component="widget" data-component-id="widget">
              <span class="codicon codicon-widget" style="color: var(--vscode-terminal-ansiBlue);"></span>
              <span>Widgets (Hover/Find)</span>
            </div>
            <div class="file-node" data-component="webview" data-component-id="webview">
              <span class="codicon codicon-browser" style="color: var(--vscode-editorInfo-foreground);"></span>
              <span>Webview</span>
            </div>
            <div class="file-node" data-component="walkthrough" data-component-id="walkthrough">
              <span class="codicon codicon-guide" style="color: var(--vscode-terminal-ansiMagenta);"></span>
              <span>Walkthroughs</span>
            </div>
            <div class="file-node" data-component="settings" data-component-id="settings">
              <span class="codicon codicon-settings" style="color: var(--vscode-activityBar-foreground);"></span>
              <span>Settings UI</span>
            </div>
          </div>
        </div>

        <!-- EXPORT Workflow Group -->
        <div data-workflow-group="export" style="display: none; padding: 8px 12px;">
          <div class="section-header">🚀 THEME EXPORT & PUBLISH</div>
          <div id="left-export-download-json" class="card-action">
            <span class="codicon codicon-json" style="color: var(--vscode-editorInfo-foreground);"></span>
            <span>Download Theme JSON</span>
          </div>
          <div id="left-export-publish" class="card-action">
            <span class="codicon codicon-rocket" style="color: var(--vscode-terminal-ansiMagenta);"></span>
            <span>Publish Theme Extension</span>
          </div>
        </div>
      </div>
    </div>`;
  }
}
customElements.define('the-me-theme-left-panel', ThemeLeftPanel);
