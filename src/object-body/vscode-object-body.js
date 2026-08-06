class VSCodeObjectBody extends HTMLElement {
  connectedCallback() {
    this.style.display = 'flex';
    this.style.flex = '1';
    this.style.minWidth = '0';
    this.style.height = '100%';
    this.innerHTML = `
    <div id="center-panel"
      style="flex: 1 1 0; width: 100%; height: 100%; min-width: 0; display: flex; flex-direction: column; padding: 1rem; background: #141414; align-items: center; justify-content: center; overflow: hidden; box-sizing: border-box;">
      <div id="window-mock"
        style="width: 100%; height: 100%; display: flex; flex-direction: column; border: 1px solid #3c3c3c; border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.6); overflow: hidden; max-width: none;"
        class="mock-component" data-component="window">

        <!-- Top Toolbar (VS Code Style) -->
        <header id="titlebar-mock" class="mock-component"
          data-color-keys="titleBar.activeBackground,titleBar.activeForeground,titleBar.border"
          style="display: flex; justify-content: space-between; align-items: center; background: var(--vscode-titleBar-activeBackground); color: var(--vscode-titleBar-activeForeground); border-bottom: 1px solid var(--vscode-titleBar-border); width: 100%; box-sizing: border-box; height: 35px; user-select: none; flex-wrap: nowrap; overflow: hidden;"
          data-component="titlebar">

          <!-- Left: VS Code Menu Bar -->
          <div class="menubar"
            style="display: flex; align-items: center; height: 100%; padding-left: 10px; font-size: 13px; gap: 4px; flex-shrink: 1; overflow: hidden; white-space: nowrap;">
            <span class="codicon codicon-vscode" style="color: #007acc; font-size: 16px; margin-right: 10px;"></span>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">File</div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Edit</div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Selection</div>
            <div class="menu-item view-menu-trigger"
              style="padding: 4px 8px; cursor: pointer; border-radius: 3px; position: relative;">
              View
              <div class="mock-dropdown-menu view-dropdown"
                data-color-keys="menu.background,menu.foreground,menu.border,menu.selectionBackground,menu.selectionForeground,menu.separatorBackground"
                style="display: none; position: absolute; top: 100%; left: 0; min-width: 160px; padding: 4px 0; z-index: 1000;
                    background: var(--vscode-menu-background); color: var(--vscode-menu-foreground);
                    border: 1px solid var(--vscode-menu-border); box-shadow: 0 2px 8px rgba(0,0,0,0.4); border-radius: 4px;">
                <div class="mock-dropdown-item toggle-activitybar"
                  style="padding: 6px 20px; cursor: pointer; display: flex; justify-content: space-between;">
                  <span>Activity Bar</span><span class="codicon codicon-check activitybar-check"
                    style="display: none;"></span>
                </div>
                <div class="mock-dropdown-item toggle-panel"
                  style="padding: 6px 20px; cursor: pointer; display: flex; justify-content: space-between;">
                  <span>Panel</span><span class="codicon codicon-check panel-check" style="display: none;"></span>
                </div>
                <div class="mock-dropdown-item toggle-statusbar"
                  style="padding: 6px 20px; cursor: pointer; display: flex; justify-content: space-between;">
                  <span>Status Bar</span><span class="codicon codicon-check statusbar-check"
                    style="display: none;"></span>
                </div>
              </div>
            </div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Go</div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Run</div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Terminal</div>
            <div class="menu-item" style="padding: 4px 8px; cursor: pointer; border-radius: 3px;">Help</div>
          </div>

          <!-- Center Title -->
          <div id="mock-title-bar" class="title-center"
            style="flex-grow: 1; flex-shrink: 1; text-align: center; font-size: 12px; opacity: 0.8; pointer-events: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 0 10px;">
            TheMeTheme - Visual Theme Editor</div>

          <div class="right-section" style="display: flex; align-items: center; height: 100%; flex-shrink: 0;">
            <!-- Window Controls -->
            <div class="window-controls" style="display: flex; align-items: center; height: 100%;">
              <div class="window-icon"
                style="padding: 0 15px; height: 100%; display: flex; align-items: center; cursor: pointer;"><span
                  class="codicon codicon-chrome-minimize"></span></div>
              <div class="window-icon"
                style="padding: 0 15px; height: 100%; display: flex; align-items: center; cursor: pointer;"><span
                  class="codicon codicon-chrome-maximize"></span></div>
              <div class="window-icon close-icon"
                style="padding: 0 15px; height: 100%; display: flex; align-items: center; cursor: pointer;"><span
                  class="codicon codicon-chrome-close"></span></div>
            </div>
          </div>
        </header>

        <!-- Main Workspace Area (ActivityBar + Sidebar + Preview Panel) -->
        <div id="app" style="display: flex; flex: 1; min-height: 0; overflow: hidden; width: 100%;">
          <!-- Activity Bar -->
          <div id="activitybar-mock" class="mock-component" data-component="activitybar"
            data-color-keys="activityBar.background,activityBar.foreground,activityBar.inactiveForeground,activityBar.border"
            style="display: flex; flex-direction: column; width: 48px; background: var(--vscode-activityBar-background); color: var(--vscode-activityBar-foreground); border-right: 1px solid var(--vscode-activityBar-border); justify-content: space-between; align-items: center; padding: 10px 0; box-sizing: border-box; user-select: none; flex-shrink: 0;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 18px;">
              <div class="activity-icon active" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-foreground);"><span class="codicon codicon-files"></span></div>
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-search"></span></div>
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-source-control"></span></div>
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-debug-alt"></span></div>
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-extensions"></span></div>
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 18px;">
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-account"></span></div>
              <div class="activity-icon" style="font-size: 20px; cursor: pointer; color: var(--vscode-activityBar-inactiveForeground);"><span class="codicon codicon-settings-gear"></span></div>
            </div>
          </div>

          <!-- Primary Sidebar -->
          <div id="sidebar-mock" class="mock-component" data-component="sidebar"
            data-color-keys="sideBar.background,sideBar.foreground,sideBar.border,sideBarTitle.foreground"
            style="display: flex; flex-direction: column; width: 200px; background: var(--vscode-sideBar-background); color: var(--vscode-sideBar-foreground); border-right: 1px solid var(--vscode-sideBar-border); box-sizing: border-box; overflow: hidden; user-select: none; flex-shrink: 0;">
            <div class="sidebar-header" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--vscode-sideBarTitle-foreground);">
              <span>Explorer</span>
              <span class="codicon codicon-ellipsis" style="cursor: pointer;"></span>
            </div>
            <div class="sidebar-content" style="flex: 1; overflow-y: auto; padding: 4px 0;">
              <div style="padding: 4px 12px; font-size: 11px; font-weight: bold; opacity: 0.8; display: flex; align-items: center; gap: 4px;">
                <span class="codicon codicon-chevron-down"></span>
                <span>THEME-PROJECT</span>
              </div>
              <div class="file-node" style="display: flex; align-items: center; gap: 6px; padding: 4px 24px; font-size: 13px; cursor: pointer;">
                <span class="codicon codicon-json" style="color: #cbcb41;"></span>
                <span>settings.json</span>
              </div>
              <div class="file-node" style="display: flex; align-items: center; gap: 6px; padding: 4px 24px; font-size: 13px; cursor: pointer;">
                <span class="codicon codicon-file-code" style="color: #519aba;"></span>
                <span>index.ts</span>
              </div>
              <div class="file-node" style="display: flex; align-items: center; gap: 6px; padding: 4px 24px; font-size: 13px; cursor: pointer;">
                <span class="codicon codicon-markdown" style="color: #4fc1ff;"></span>
                <span>README.md</span>
              </div>
            </div>
          </div>

          <!-- Column 2: Visual Mock UI -->
          <div id="preview-panel" style="flex: 1; display: flex; flex-direction: column; min-width: 0;">
        <!-- Editor Mock -->
        <div id="editor-mock" class="mock-component" data-color-keys="editor.background,editor.foreground"
          style="display: flex; flex: 1; flex-direction: column; box-sizing: border-box; min-height: 0;"
          data-component="editor">
          <!-- Editor Tabs -->
          <div id="editor-tabs" class="editor-tabs"
            data-color-keys="editorGroupHeader.tabsBackground,editorGroupHeader.tabsBorder"
            style="display: flex; height: 35px; border-bottom: 1px solid var(--vscode-editorGroupHeader-tabsBorder); box-sizing: border-box; overflow-x: auto;">
            <div class="editor-tab active" data-tab-target="settings-json"
              data-color-keys="tab.activeBackground,tab.activeForeground,tab.activeBorder,tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-activeBackground); color: var(--vscode-tab-activeForeground); position: relative; cursor: pointer;">
              <span style="color: #cbcb41; font-family: monospace; font-weight: bold; font-size: 14px;">{}</span>
              <span>settings.json</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="activitybar"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>activitybar</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="editor"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>editor</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="statusbar"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>statusbar</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="panel"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>panel</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="titlebar"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>titlebar</span>
            </div>
            <div class="editor-tab inactive" data-tab-target="sidebar"
              data-color-keys="tab.inactiveBackground,tab.inactiveForeground,tab.border"
              style="padding: 0 15px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-right: 1px solid var(--vscode-tab-border); background: var(--vscode-tab-inactiveBackground); color: var(--vscode-tab-inactiveForeground); cursor: pointer;">
              <span class="codicon codicon-symbol-color" style="color: #cbcb41; font-size: 13px;"></span>
              <span>sidebar</span>
            </div>

            <!-- Editor Actions (Right aligned) -->
            <div class="editor-actions"
              style="margin-left: auto; display: flex; align-items: center; padding: 0 10px; gap: 10px;">
              <button id="theme-mode-btn" class="header-btn primary" data-mode="dark"
                style="background: #007acc; border-color: #007acc; width: auto; padding: 4px 8px; font-size: 11px; white-space: nowrap; line-height: 1;">🌙
                Dark Mode Base</button>
              <button id="color-lab-btn" class="header-btn" onclick="window.location.href='pages/color-lab'"
                style="width: auto; padding: 4px 8px; font-size: 11px; white-space: nowrap; line-height: 1;">Color
                Lab</button>
              <span id="clear-comments-btn" class="codicon codicon-clear-all"
                style="cursor: pointer; color: var(--vscode-tab-activeForeground); opacity: 0.7; font-size: 16px;"
                title="Clear Comments (Remove all // comments from JSON)" onmouseover="this.style.opacity='1'"
                onmouseout="this.style.opacity='0.7'"></span>
            </div>
          </div>
          <!-- Breadcrumbs -->
          <div class="breadcrumbs" data-color-keys="breadcrumb.background,breadcrumb.foreground"
            style="display: flex; align-items: center; gap: 6px; padding: 6px 15px; font-size: 11px; background: var(--vscode-breadcrumb-background); color: var(--vscode-breadcrumb-foreground); opacity: 0.8; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span>src</span>
            <span class="codicon codicon-chevron-right" style="font-size: 10px;"></span>
            <span>components</span>
            <span class="codicon codicon-chevron-right" style="font-size: 10px;"></span>
            <span id="mock-breadcrumb-file">ThemePreview.json</span>
          </div>
          <!-- Editor content body -->
          <div style="display: flex; flex: 1; min-height: 0; position: relative;">
            <div class="editor-content"
              style="padding: 15px; display: flex; flex: 1; align-items: center; justify-content: center; box-sizing: border-box; background: var(--vscode-editor-background); overflow-y: auto;">
              <div id="editor-watermark"
                style="display: flex; flex-direction: column; align-items: center; gap: 20px; color: var(--vscode-editor-foreground); opacity: 0.3; user-select: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; display: none;">
                <span class="codicon codicon-vscode" style="font-size: 120px;"></span>
                <div>
                  <h3 style="margin: 0 0 10px 0; font-weight: normal; font-size: 18px;">Editor Preveiw</h3>
                  <p style="margin: 0; font-size: 13px; line-height: 1.6;">left Sidebar<br>sele File<br> UI parts
                    CLICK color Edit</p>
                </div>
              </div>

              <div id="syntax-preview"
                style="display: block; padding: 20px; font-family: 'Consolas', 'Courier New', monospace; font-size: 14px; line-height: 1.5; color: var(--vscode-editor-foreground); width: 100%; height: 100%; box-sizing: border-box; text-align: left;">
                <pre style="margin: 0; tab-size: 4;"><span style="color: #cccccc;">{</span>
    <span style="color: #9cdcfe;">"name"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"My Custom Theme"</span><span style="color: #cccccc;">,</span>
    <span style="color: #9cdcfe;">"colors"</span><span style="color: #cccccc;">:</span> <span style="color: #cccccc;">{</span>
        <span style="color: #9cdcfe;">"editor.background"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"<span data-color-keys="editor.background">#1e1e1e</span>"</span><span style="color: #cccccc;">,</span>
        <span style="color: #9cdcfe;">"editor.foreground"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"<span data-color-keys="editor.foreground">#cccccc</span>"</span><span style="color: #cccccc;">,</span>
        <span style="color: #9cdcfe;">"activityBar.background"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"<span data-color-keys="activityBar.background">#333333</span>"</span><span style="color: #cccccc;">,</span>
        <span style="color: #9cdcfe;">"sideBar.background"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"<span data-color-keys="sideBar.background">#252526</span>"</span><span style="color: #cccccc;">,</span>
        <span style="color: #9cdcfe;">"statusBar.background"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"<span data-color-keys="statusBar.background">#007acc</span>"</span>
    <span style="color: #cccccc;">}</span><span style="color: #cccccc;">,</span>
    <span style="color: #9cdcfe;">"tokenColors"</span><span style="color: #cccccc;">:</span> <span style="color: #cccccc;">[</span>
        <span style="color: #cccccc;">{</span>
            <span style="color: #9cdcfe;">"scope"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"comment"</span><span style="color: #cccccc;">,</span>
            <span style="color: #9cdcfe;">"settings"</span><span style="color: #cccccc;">:</span> <span style="color: #cccccc;">{</span>
                <span style="color: #9cdcfe;">"foreground"</span><span style="color: #cccccc;">:</span> <span style="color: #ce9178;">"#6a9955"</span>
            <span style="color: #cccccc;">}</span>
        <span style="color: #cccccc;">}</span>
    <span style="color: #cccccc;">]</span>
<span style="color: #cccccc;">}</span>
</pre>
              </div>
              <div id="settings-json-view"
                style="display: block; width: 100%; height: 100%; box-sizing: border-box; text-align: left;">
              </div>

              <div id="tutorial-view"
                style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.4; color: #cccccc; max-width: 800px; width: 100%; margin: 0 auto; box-sizing: border-box; align-self: flex-start; margin-top: 40px; display: none;">
                <h2
                  style="color: #ffffff; font-weight: 300; border-bottom: 1px solid #3c3c3c; padding-bottom: 8px; margin-top: 0;">
                  1. Fine-tune Specific Workbench Colors</h2>
                <div style="font-size: 14px; line-height: 1.8; margin-bottom: 15px;">
                  <p>If you want to build upon an existing theme but only change specific colors (such as the
                    sidebar background or active tab), add <code>workbench.colorCustomizations</code> to your
                    <code>settings.json</code> file.
                  </p>

                  <pre
                    style="background: #1e1e1e; padding: 15px; border-radius: 6px; border: 1px solid #333; overflow-x: auto; font-family: Consolas, 'Courier New', monospace; color: #d4d4d4;"><code><span style="color: #9cdcfe;">"workbench.colorCustomizations"</span>: {
    <span class="mock-component" data-color-keys="sideBar.background" style="color: #9cdcfe; cursor: pointer; text-decoration: underline dotted rgba(255,255,255,0.3);">"sideBar.background"</span>: <span class="mock-component" data-color-keys="sideBar.background" style="color: #ce9178; cursor: pointer;">"#1e1e2e"</span>,
    <span class="mock-component" data-color-keys="activityBar.background" style="color: #9cdcfe; cursor: pointer; text-decoration: underline dotted rgba(255,255,255,0.3);">"activityBar.background"</span>: <span class="mock-component" data-color-keys="activityBar.background" style="color: #ce9178; cursor: pointer;">"#11111b"</span>
}</code></pre>

                  <p style="margin-top: 15px;">
                    When exporting, you can use this snippet directly in your workbench settings, or output it as
                    a complete JSON theme to use as a standalone theme file.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Sash for resizing panel -->
        <div id="sash-bottom"
          style="height: 4px; cursor: row-resize; background: transparent; flex-shrink: 0; z-index: 10;"></div>

        <!-- Panel Mock -->
        <div id="panel-mock" class="mock-component" data-color-keys="panel.background,panel.border"
          style="display: flex; background: var(--vscode-panel-background); height: 180px; box-sizing: border-box; flex-direction: column; border-top: 1px solid var(--vscode-panel-border);"
          data-component="panel">

          <div class="panel-header"
            data-color-keys="panelTitle.activeForeground,panelTitle.activeBorder,panelTitle.inactiveForeground"
            style="display: flex; justify-content: space-between; align-items: center; padding: 0 15px; font-size: 11px; text-transform: uppercase; border-bottom: 1px solid rgba(255,255,255,0.05); box-sizing: border-box; height: 35px;">
            <div class="panel-tabs" style="display: flex; gap: 20px; align-items: center; height: 100%;">
              <div class="panel-title active"
                style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid var(--vscode-panelTitle-activeBorder); color: var(--vscode-panelTitle-activeForeground); cursor: pointer;">
                PROBLEMS
              </div>
              <div class="panel-title inactive"
                style="padding: 8px 0; opacity: 0.6; color: var(--vscode-panelTitle-inactiveForeground); cursor: pointer;">
                OUTPUT
              </div>
              <div class="panel-title inactive"
                style="padding: 8px 0; opacity: 0.6; color: var(--vscode-panelTitle-inactiveForeground); cursor: pointer;">
                TERMINAL
              </div>
            </div>
            <div class="panel-toolbar" style="display: flex; align-items: center; gap: 10px; opacity: 0.8;">
              <span class="codicon codicon-clear-all" style="cursor: pointer;" title="Clear Output"></span>
              <span class="codicon codicon-split-horizontal" style="cursor: pointer;" title="Split Terminal"></span>
              <span class="codicon codicon-chevron-up" style="cursor: pointer;" title="Maximize Panel Size"></span>
              <span class="codicon codicon-close" style="cursor: pointer;" title="Close Panel"></span>
            </div>
          </div>

          <div class="panel-content"
            style="padding: 10px 15px; font-family: monospace; font-size: 12px; flex: 1; overflow: auto; box-sizing: border-box;">
            <div data-color-keys="terminal.foreground,terminal.background"
              style="display: flex; flex-direction: column; gap: 4px;">
              <div style="color: #858585;">No problems have been detected in the workspace so far.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Secondary Sidebar Mock -->
      <div id="secondarysidebar-mock" class="mock-component" data-component="secondarysidebar"
        data-color-keys="sideBar.background,sideBar.border,sideBar.foreground"
        style="display: flex; flex-direction: column; width: 220px; border-left: 1px solid var(--vscode-sideBar-border); background: var(--vscode-sideBar-background); color: var(--vscode-sideBar-foreground); flex-shrink: 0; user-select: none;">
        <div class="explorer-header"
          style="display: flex; justify-content: space-between; align-items: center; padding: 10px 15px; font-size: 11px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.05); text-transform: uppercase; color: #858585;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="codicon codicon-symbol-class" style="color: #c586c0;"></span>
            <span>OUTLINE</span>
          </div>
          <span class="codicon codicon-ellipsis" style="cursor: pointer; opacity: 0.8;"></span>
        </div>
        <div class="outline-scroll-container"
          style="flex: 1; overflow-y: auto; padding: 10px 15px; font-size: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #cccccc;">
            <span class="codicon codicon-symbol-class" style="color: #4ec9b0;"></span>
            <span>ThemeEngine</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px; color: #cccccc;">
            <span class="codicon codicon-symbol-method" style="color: #dcdcaa;"></span>
            <span>constructor()</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px; color: #cccccc;">
            <span class="codicon codicon-symbol-method" style="color: #dcdcaa;"></span>
            <span>resolveColor()</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px; color: #cccccc;">
            <span class="codicon codicon-symbol-method" style="color: #dcdcaa;"></span>
            <span>applyCustomizations()</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; color: #cccccc; margin-top: 6px;">
            <span class="codicon codicon-symbol-interface" style="color: #4ec9b0;"></span>
            <span>ThemeConfig</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px; color: #cccccc;">
            <span class="codicon codicon-symbol-field" style="color: #75beff;"></span>
            <span>colors</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px; color: #cccccc;">
            <span class="codicon codicon-symbol-field" style="color: #75beff;"></span>
            <span>tokenColors</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Status Bar Mock -->
    <div id="statusbar-mock" class="mock-component"
      data-color-keys="statusBar.background,statusBar.foreground,statusBar.border"
      style="display: flex; background: var(--vscode-statusBar-background); color: var(--vscode-statusBar-foreground); height: 22px; padding: 0 10px; flex-direction: row; justify-content: space-between; align-items: center; font-size: 11px; border-top: 1px solid var(--vscode-statusBar-border); box-sizing: border-box; width: 100%; z-index: 1000;"
      data-component="statusbar">
      <div class="statusbar-left" style="display: flex; align-items: center; gap: 12px;">
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground"
          style="display: flex; align-items: center; gap: 4px;">
          <span class="codicon codicon-git-branch"></span>
          <span>main*</span>
        </span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground"
          style="display: flex; align-items: center; gap: 4px;">
          <span class="codicon codicon-sync" style="font-size: 10px;"></span>
        </span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground"
          style="display: flex; align-items: center; gap: 4px;">
          <span class="codicon codicon-error" style="color: #f85149; font-size: 11px;"></span>
          <span>0</span>
          <span class="codicon codicon-warning" style="color: #d29922; font-size: 11px;"></span>
          <span>0</span>
        </span>
      </div>
      <div class="statusbar-right" style="display: flex; align-items: center; gap: 12px;">
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">Ln 1, Col 12</span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">Spaces: 2</span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">UTF-8</span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">LF</span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">JSON</span>
        <span class="statusbar-item" data-color-keys="statusBarItem.hoverBackground">
          <span class="codicon codicon-bell"></span>
        </span>
      </div>
    </div>
  </div>
</div>
    `;
  }
}

customElements.define('vscode-object-body', VSCodeObjectBody);
