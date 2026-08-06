/**
 * PreviewArea.js
 * 
 * JS only uses computed values (--vscode-*) to draw
 * VS Code mockup preview component (Zero Runtime Cost)
 */

export function renderPreviewArea(containerEl) {
  // Add a wrapper for the toggle and the window
  containerEl.innerHTML = `
    <!-- Load Codicons -->
    <link href="https://cdn.jsdelivr.net/npm/@vscode/codicons/dist/codicon.css" rel="stylesheet" />
    
    <style>
      .mock-window { 
        border: 1px solid var(--vscode-window-activeBorder, #444); 
        font-family: 'Segoe WPC', 'Segoe UI', sans-serif;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
        border-radius: 8px;
        overflow: hidden;
      }
      .mock-window.inactive-window { border: 1px solid var(--vscode-window-inactiveBorder, #454545); }
      
      .mock-titlebar { 
        background-color: var(--vscode-titleBar-activeBackground, #3c3c3c); 
        color: var(--vscode-titleBar-activeForeground, #cccccc); 
      }
      .mock-window.inactive-window .mock-titlebar { 
        background-color: var(--vscode-titleBar-inactiveBackground, #252526); 
        color: var(--vscode-titleBar-inactiveForeground, #cccccc); 
      }
      
      .codicon { vertical-align: middle; }
      
      /* Mac/Win Window Controls Toggle */
      .win-controls { display: flex; }
      .mac-controls { display: none; }
      .mock-window.mac-style .win-controls { display: none !important; }
      .mock-window.mac-style .mac-controls { display: flex !important; }
      
      /* Custom scrollbar mockup */
      .mock-scrollbar::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      .mock-scrollbar::-webkit-scrollbar-thumb {
        background: var(--vscode-scrollbarSlider-background, #252526);
      }
      .mock-scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--vscode-scrollbarSlider-hoverBackground, #252526);
      }
      .mock-scrollbar::-webkit-scrollbar-thumb:active {
        background: var(--vscode-scrollbarSlider-activeBackground, #252526);
      }
    </style>

    <div style="display: flex; justify-content: flex-end; padding-bottom: 8px; gap: 15px;">
      <label style="color: #aaa; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
        <input type="checkbox" onchange="document.getElementById('mock-window').classList.toggle('mac-style')" />
        Mac Style Controls
      </label>
      <label style="color: #aaa; font-size: 11px; cursor: pointer; display: flex; align-items: center; gap: 5px;">
        <input type="checkbox" id="inactive-toggle" onchange="document.getElementById('mock-window').classList.toggle('inactive-window')" />
        Simulate Inactive Window
      </label>
    </div>

    <div id="mock-window" data-preview-id="window" class="mock-window" style="
      display: flex;
      flex-direction: column;
      flex: 1;
      height: calc(100% - 25px);
      background-color: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-editor-foreground, #cccccc);
      box-sizing: border-box;
      position: relative; /* For overlay */
      transition: outline 0.2s, box-shadow 0.2s, border 0.2s;
    ">
      <!-- Title Bar Mockup -->
      <div data-preview-id="titleBar" class="mock-titlebar" style="
        height: 35px;
        border-bottom: 1px solid var(--vscode-titleBar-border, #007acc);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        transition: outline 0.2s, box-shadow 0.2s, background-color 0.2s;
        user-select: none;
      ">
        <!-- Mac Controls -->
        <div class="mac-controls" style="gap: 8px; padding-left: 15px; width: 100px;">
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #ff5f56; border: 1px solid #e0443e;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #ffbd2e; border: 1px solid #dea123;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #27c93f; border: 1px solid #1aab29;"></div>
        </div>

        <!-- App Icon & Menu (Windows/Linux) -->
        <div class="win-controls" style="display:flex; align-items:center; gap: 15px; padding-left: 10px; width: calc(50% - 200px);">
          <i class="codicon codicon-vscode" style="color: #007acc; font-size: 16px;"></i>
          <div style="display:flex; gap: 12px; font-size: 13px;">
            <span style="opacity: 0.9;">File</span>
            <span style="opacity: 0.9;">Edit</span>
            <span style="opacity: 0.9;">Selection</span>
            <span style="opacity: 0.9;">View</span>
            <span style="opacity: 0.9;">Go</span>
            <span style="opacity: 0.9;">Run</span>
            <span style="opacity: 0.9;">Terminal</span>
            <span style="opacity: 0.9;">Help</span>
          </div>
        </div>

        <!-- Command Center -->
        <div data-preview-id="commandCenter" style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 400px;
          height: 24px;
          background-color: var(--vscode-commandCenter-background, #252526);
          color: var(--vscode-commandCenter-foreground, #cccccc);
          border: 1px solid var(--vscode-commandCenter-border, #454545);
          border-radius: 6px;
          font-size: 12px;
          transition: outline 0.2s, box-shadow 0.2s;
          gap: 6px;
        ">
          <i class="codicon codicon-arrow-left" style="font-size: 14px; opacity: 0.5;"></i>
          <i class="codicon codicon-arrow-right" style="font-size: 14px; opacity: 0.5;"></i>
          <span style="margin: 0 10px;"><i class="codicon codicon-search" style="font-size: 14px; margin-right: 4px;"></i> TheMeTheme Mockup</span>
        </div>

        <!-- Window Controls (Windows) -->
        <div class="win-controls" style="width: calc(50% - 200px); justify-content: flex-end; display: flex; height: 100%;">
          <div style="width: 46px; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.8;"><i class="codicon codicon-chrome-minimize"></i></div>
          <div style="width: 46px; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.8;"><i class="codicon codicon-chrome-maximize"></i></div>
          <div style="width: 46px; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0.8;"><i class="codicon codicon-chrome-close"></i></div>
        </div>
        <!-- Spacer for Mac layout -->
        <div class="mac-controls" style="width: 100px;"></div>
      </div>

      <!-- Main Body -->
      <div style="display: flex; flex: 1; overflow: hidden;">
        <!-- Activity Bar Mockup -->
        <div data-preview-id="activityBar" style="
          width: 48px;
          background-color: var(--vscode-activityBar-background, #252526);
          border-right: 1px solid var(--vscode-activityBar-border, #454545);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 10px;
          transition: outline 0.2s, box-shadow 0.2s;
        ">
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-foreground, #cccccc);">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background-color: var(--vscode-activityBar-activeBorder, #454545);"></div>
            <i class="codicon codicon-files" style="font-size: 24px;"></i>
          </div>
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-search" style="font-size: 24px;"></i>
          </div>
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-source-control" style="font-size: 24px;"></i>
            <!-- Badge -->
            <div style="
              position: absolute;
              bottom: 8px;
              right: 8px;
              width: 18px;
              height: 18px;
              background-color: var(--vscode-activityBarBadge-background, #252526);
              color: var(--vscode-activityBarBadge-foreground, #cccccc);
              font-size: 10px;
              font-weight: 600;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
            ">3</div>
          </div>
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-debug-alt" style="font-size: 24px;"></i>
          </div>
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-extensions" style="font-size: 24px;"></i>
          </div>

          <div style="margin-top: auto; position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-account" style="font-size: 24px;"></i>
          </div>
          <div style="position: relative; width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; color: var(--vscode-activityBar-inactiveForeground, #cccccc);">
            <i class="codicon codicon-settings-gear" style="font-size: 24px;"></i>
          </div>
        </div>

        <!-- Primary Sidebar Mockup -->
        <div data-preview-id="sideBar" style="
          width: 260px;
          background-color: var(--vscode-sideBar-background, #252526);
          color: var(--vscode-sideBar-foreground, #cccccc);
          border-right: 1px solid var(--vscode-sideBar-border, #454545);
          display: flex;
          flex-direction: column;
          transition: outline 0.2s, box-shadow 0.2s;
        ">
          <div data-preview-id="sideBarTitle" style="
            padding: 10px 20px;
            font-size: 11px;
            color: var(--vscode-sideBarTitle-foreground, #cccccc);
            display: flex;
            align-items: center;
            justify-content: space-between;
            transition: outline 0.2s, box-shadow 0.2s;
          ">
            <span>EXPLORER</span>
            <i class="codicon codicon-ellipsis" style="cursor: pointer;"></i>
          </div>
          
          <div data-preview-id="sideBarSectionHeader" style="
            background-color: var(--vscode-sideBarSectionHeader-background, #252526);
            color: var(--vscode-sideBarSectionHeader-foreground, #cccccc);
            border-top: 1px solid var(--vscode-sideBarSectionHeader-border, #454545);
            padding: 0 4px;
            height: 22px;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            transition: outline 0.2s, box-shadow 0.2s;
          ">
            <i class="codicon codicon-chevron-down" style="margin-right: 2px;"></i>
            THEMETHEME PROJECT
          </div>
          
          <div data-preview-id="list" style="
            display: flex; flex-direction: column; flex: 1;
            font-size: 13px;
            transition: outline 0.2s, box-shadow 0.2s;
          ">
            <!-- Indent guide visualization trick using border-left -->
            <div style="padding: 4px 10px 4px 22px; color: var(--vscode-list-inactiveSelectionForeground, #cccccc); display: flex; align-items: center; gap: 6px;">
              <i class="codicon codicon-chevron-right" style="margin-right: -2px;"></i>
              <i class="codicon codicon-folder" style="color: #dcb67a;"></i>
              <span>.vscode</span>
            </div>
            <div style="padding: 4px 10px 4px 22px; color: var(--vscode-list-inactiveSelectionForeground, #cccccc); display: flex; align-items: center; gap: 6px;">
              <i class="codicon codicon-chevron-down" style="margin-right: -2px;"></i>
              <i class="codicon codicon-folder" style="color: #dcb67a;"></i>
              <span>src</span>
            </div>
            
            <div style="padding: 4px 10px 4px 44px; color: var(--vscode-list-hoverForeground, #cccccc); background-color: var(--vscode-list-hoverBackground, #252526); display: flex; align-items: center; gap: 6px; border-left: 1px solid var(--vscode-tree-indentGuidesStroke, #333333);">
              <i class="codicon codicon-chevron-right" style="margin-right: -2px; margin-left: -18px;"></i>
              <i class="codicon codicon-folder" style="color: #dcb67a;"></i>
              <span>components</span>
            </div>

            <div style="padding: 4px 10px 4px 62px; background-color: var(--vscode-list-activeSelectionBackground, #252526); color: var(--vscode-list-activeSelectionForeground, #cccccc); display: flex; align-items: center; gap: 6px; border-left: 1px solid var(--vscode-tree-indentGuidesStroke, #333333);">
              <i class="codicon codicon-file-code" style="color: #519aba;"></i>
              <span>main.js</span>
            </div>

            <div style="padding: 4px 10px 4px 62px; background-color: var(--vscode-list-inactiveSelectionBackground, #252526); color: var(--vscode-list-inactiveSelectionForeground, #cccccc); display: flex; align-items: center; gap: 6px; border-left: 1px solid var(--vscode-tree-indentGuidesStroke, #333333);">
              <i class="codicon codicon-file-code" style="color: #519aba;"></i>
              <span>style.css</span>
            </div>

            <div style="padding: 4px 10px 4px 22px; color: var(--vscode-list-inactiveSelectionForeground, #cccccc); display: flex; align-items: center; gap: 6px;">
              <i class="codicon codicon-file-code" style="color: #519aba; margin-left: 16px;"></i>
              <span>index.html</span>
            </div>
          </div>
        </div>

        <!-- Editor Area & Panel -->
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <!-- Editor Area Mockup -->
          <div data-preview-id="editor" style="
            flex: 1;
            background-color: var(--vscode-editor-background, #1e1e1e);
            display: flex;
            flex-direction: column;
            transition: outline 0.2s, box-shadow 0.2s;
            position: relative;
          ">
            <!-- Tab Bar -->
            <div data-preview-id="editorGroupHeader" class="mock-scrollbar" style="
              display: flex;
              background-color: var(--vscode-editorGroupHeader-tabsBackground, #252526);
              border-bottom: 1px solid var(--vscode-editorGroupHeader-tabsBorder, #454545);
              height: 35px;
              transition: outline 0.2s, box-shadow 0.2s;
              overflow-x: auto;
            ">
              <div data-preview-id="tab" style="
                padding: 0 10px;
                background-color: var(--vscode-tab-activeBackground, #252526);
                color: var(--vscode-tab-activeForeground, #cccccc);
                border-top: 1px solid var(--vscode-tab-activeBorderTop, #454545);
                border-bottom: 1px solid var(--vscode-tab-activeBorder, #454545);
                border-right: 1px solid var(--vscode-tab-border, #454545);
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 120px;
                justify-content: space-between;
                transition: outline 0.2s, box-shadow 0.2s;
              ">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <i class="codicon codicon-file-code" style="color: #519aba;"></i>
                  <span>main.js</span>
                </div>
                <i class="codicon codicon-close" style="font-size: 16px; border-radius: 3px; padding: 2px;"></i>
              </div>
              <div style="
                padding: 0 10px;
                background-color: var(--vscode-tab-inactiveBackground, #252526);
                color: var(--vscode-tab-inactiveForeground, #cccccc);
                border-right: 1px solid var(--vscode-tab-border, #454545);
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 6px;
                min-width: 120px;
                justify-content: space-between;
              ">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <i class="codicon codicon-file-code" style="color: #519aba;"></i>
                  <span>style.css</span>
                </div>
                <i class="codicon codicon-close" style="font-size: 16px; border-radius: 3px; padding: 2px; opacity: 0;"></i>
              </div>
            </div>

            <!-- Breadcrumbs -->
            <div data-preview-id="breadcrumb" style="
              height: 22px;
              background-color: var(--vscode-breadcrumb-background, #252526);
              color: var(--vscode-breadcrumb-foreground, #cccccc);
              padding: 0 20px;
              display: flex;
              align-items: center;
              font-size: 12px;
              gap: 4px;
              transition: outline 0.2s, box-shadow 0.2s;
            ">
              <span>src</span> <i class="codicon codicon-chevron-right" style="font-size: 14px; opacity: 0.8;"></i> 
              <span>components</span> <i class="codicon codicon-chevron-right" style="font-size: 14px; opacity: 0.8;"></i> 
              <i class="codicon codicon-file-code" style="font-size: 14px; color: #519aba;"></i> <span style="color: var(--vscode-breadcrumb-activeSelectionForeground, #cccccc);">main.js</span>
            </div>

            <!-- Code Content Area with Gutter -->
            <div style="display: flex; flex: 1; overflow: hidden;">
              <!-- Gutter (Line Numbers) -->
              <div data-preview-id="editorLineNumber" style="
                width: 60px;
                padding-top: 5px;
                text-align: right;
                padding-right: 20px;
                background-color: var(--vscode-editorGutter-background, #252526);
                color: var(--vscode-editorLineNumber-foreground, #cccccc);
                font-family: Consolas, 'Fira Code', 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
                transition: outline 0.2s, box-shadow 0.2s;
              ">
                <div>1</div>
                <div style="color: var(--vscode-editorLineNumber-activeForeground, #cccccc);">2</div>
                <div>3</div>
                <div>4</div>
              </div>
              
              <!-- Code -->
              <div style="
                flex: 1;
                padding: 5px 0px;
                font-family: Consolas, 'Fira Code', 'Courier New', monospace;
                font-size: 14px;
                line-height: 1.5;
              ">
                <div style="color: #6a9955;">// Welcome to TheMeTheme Live Preview</div>
                <div><span style="color: #569cd6;">const</span> <span style="color: #4fc1ff;">theme</span> = <span style="color: #ce9178;">"Zero Runtime Cost"</span>;</div>
                <div><span style="color: #dcdcaa;">console</span>.<span style="color: #dcdcaa;">log</span>(<span style="color: #ce9178;">\`Engine initialized: \${theme}\`</span>);</div>
                <div><span style="color: #569cd6;">export</span> <span style="color: #569cd6;">default</span> theme;</div>
              </div>
            </div>

            <!-- Find Widget Overlay -->
            <div id="mock-editor-widget" data-preview-id="editorWidget" style="
              display: none;
              position: absolute;
              top: 35px; /* Right below tabs */
              right: 28px;
              width: 380px;
              height: 34px;
              background-color: var(--vscode-editorWidget-background, #252526);
              border: 1px solid var(--vscode-editorWidget-border, #454545);
              box-shadow: 0 2px 8px var(--vscode-widget-shadow, #333333);
              align-items: center;
              padding: 0 4px;
              gap: 4px;
              border-radius: 3px;
              transition: outline 0.2s, box-shadow 0.2s;
              z-index: 10;
            ">
              <div style="display:flex; flex:1; background-color: var(--vscode-input-background, #252526); border: 1px solid var(--vscode-input-border, #454545); outline: 1px solid var(--vscode-focusBorder, #454545); border-radius: 2px; align-items: center; padding: 0 4px;">
                <input type="text" value="Zero Runtime" style="
                  flex: 1;
                  background: transparent;
                  color: var(--vscode-input-foreground, #cccccc);
                  border: none;
                  outline: none;
                  padding: 4px 6px;
                  font-size: 13px;
                "/>
                <i class="codicon codicon-case-sensitive" style="padding: 2px; border-radius:3px;"></i>
                <i class="codicon codicon-whole-word" style="padding: 2px; border-radius:3px;"></i>
                <i class="codicon codicon-regex" style="padding: 2px; border-radius:3px;"></i>
              </div>
              <div style="display:flex; gap:2px; color: var(--vscode-editorWidget-foreground, #cccccc);">
                <i class="codicon codicon-arrow-up" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-arrow-down" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-three-bars" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-close" style="padding: 4px; border-radius:3px;"></i>
              </div>
            </div>

          </div>
          
          <!-- Panel Mockup -->
          <div id="mock-panel" data-preview-id="panel" style="
            height: 180px;
            background-color: var(--vscode-panel-background, #1e1e1e);
            border-top: 1px solid var(--vscode-panel-border, #454545);
            display: flex;
            flex-direction: column;
            transition: outline 0.2s, box-shadow 0.2s;
          ">
            <div data-preview-id="panelTitle" style="
              display: flex;
              height: 35px;
              padding: 0 10px;
              align-items: center;
              justify-content: space-between;
              background-color: var(--vscode-panelTitle-background, #252526);
              transition: outline 0.2s, box-shadow 0.2s;
            ">
              <div style="display: flex; gap: 20px; height: 100%; align-items: center; padding-left: 10px;">
                <span style="font-size: 11px; font-family: 'Segoe WPC', 'Segoe UI', sans-serif; color: var(--vscode-panelTitle-inactiveForeground, #cccccc);">PROBLEMS</span>
                <span style="font-size: 11px; font-family: 'Segoe WPC', 'Segoe UI', sans-serif; color: var(--vscode-panelTitle-inactiveForeground, #cccccc);">OUTPUT</span>
                <span style="font-size: 11px; font-family: 'Segoe WPC', 'Segoe UI', sans-serif; color: var(--vscode-panelTitle-inactiveForeground, #cccccc);">DEBUG CONSOLE</span>
                <span style="font-size: 11px; font-family: 'Segoe WPC', 'Segoe UI', sans-serif; color: var(--vscode-panelTitle-activeForeground, #cccccc); border-bottom: 1px solid var(--vscode-panelTitle-activeBorder, #454545); height: 100%; display: flex; align-items: center;">TERMINAL</span>
                <span style="font-size: 11px; font-family: 'Segoe WPC', 'Segoe UI', sans-serif; color: var(--vscode-panelTitle-inactiveForeground, #cccccc);">PORTS</span>
              </div>
              <div style="display: flex; gap: 4px; color: var(--vscode-panelTitle-inactiveForeground, #cccccc);">
                <i class="codicon codicon-add" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-split-horizontal" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-trash" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-chevron-up" style="padding: 4px; border-radius:3px;"></i>
                <i class="codicon codicon-close" style="padding: 4px; border-radius:3px;"></i>
              </div>
            </div>
            <div style="padding: 10px 20px; font-family: Consolas, 'Fira Code', monospace; font-size: 14px; color: var(--vscode-terminal-foreground, #cccccc); line-height: 1.4;">
              $ npm run dev<br>
              <span style="color: var(--vscode-terminal-ansiGreen, #333333);">✔</span> Engine started successfully.<br>
              <span style="color: var(--vscode-terminal-ansiBrightBlue, #333333);">ℹ</span> Ready on http://localhost:5173
            </div>
          </div>
        </div>
      </div>

      
        <!-- Secondary Sidebar Mockup -->
        <div data-preview-id="secondarySideBar" style="
          width: 220px;
          background-color: var(--vscode-sideBar-background, #252526);
          color: var(--vscode-sideBar-foreground, #cccccc);
          border-left: 1px solid var(--vscode-sideBar-border, #454545);
          display: flex;
          flex-direction: column;
          z-index: 10;
        ">
          <div style="
            padding: 10px 20px;
            font-size: 11px;
            color: var(--vscode-sideBarTitle-foreground, #cccccc);
            display: flex;
            align-items: center;
            justify-content: space-between;
          ">
            <span>OUTLINE</span>
            <i class="codicon codicon-ellipsis" style="cursor: pointer;"></i>
          </div>
          <div style="padding: 10px 20px; font-size: 13px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;"><i class="codicon codicon-symbol-class" style="color: #4ec9b0;"></i> ThemeEngine</div>
            <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px;"><i class="codicon codicon-symbol-method" style="color: #dcdcaa;"></i> constructor()</div>
            <div style="display: flex; align-items: center; gap: 6px; padding-left: 12px;"><i class="codicon codicon-symbol-method" style="color: #dcdcaa;"></i> resolveColor()</div>
          </div>
        </div>
      
      <!-- Context Menu Mockup -->
      <div data-preview-id="menu" style="
        position: absolute;
        top: 250px;
        left: 350px;
        width: 200px;
        background-color: var(--vscode-menu-background, #252526);
        color: var(--vscode-menu-foreground, #cccccc);
        border: 1px solid var(--vscode-menu-border, #454545);
        border-radius: 4px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5);
        padding: 4px 0;
        font-size: 12px;
        z-index: 1000;
      ">
        <div style="padding: 6px 24px;">Go to Definition</div>
        <div style="padding: 6px 24px;">Go to References</div>
        <div style="height: 1px; background-color: var(--vscode-menu-separatorBackground, #454545); margin: 4px 0;"></div>
        <div style="padding: 6px 24px; background-color: var(--vscode-menu-selectionBackground, #007acc); color: var(--vscode-menu-selectionForeground, #ffffff);">Format Document</div>
      </div>
      <!-- Status Bar Mockup -->
      <div data-preview-id="statusBar" style="
        height: 22px;
        background-color: var(--vscode-statusBar-background, #007acc);
        color: var(--vscode-statusBar-foreground, #ffffff);
        border-top: 1px solid var(--vscode-statusBar-border, #454545);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 10px;
        font-size: 12px;
        transition: outline 0.2s, box-shadow 0.2s;
      ">
        <div style="display: flex; height: 100%; align-items: center; gap: 4px;">
          <span style="background-color: var(--vscode-statusBarItem-remoteBackground, #252526); color: var(--vscode-statusBarItem-remoteForeground, #cccccc); padding: 0 10px; height: 100%; display: flex; align-items: center; margin-left: -10px;">
            <i class="codicon codicon-remote" style="font-size: 14px;"></i>
          </span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%; gap: 4px; background-color: var(--vscode-statusBarItem-hoverBackground, #252526);">
            <i class="codicon codicon-repo-forked" style="font-size: 14px;"></i> main*
          </span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%; gap: 4px;">
            <i class="codicon codicon-sync" style="font-size: 14px;"></i>
          </span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%; gap: 4px;">
            <i class="codicon codicon-error" style="font-size: 14px;"></i> 0 
            <i class="codicon codicon-warning" style="font-size: 14px;"></i> 0
          </span>
        </div>
        <div style="display: flex; height: 100%; align-items: center; gap: 4px;">
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">Ln 3, Col 43</span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">Spaces: 2</span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">UTF-8</span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">CRLF</span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">
            <i class="codicon codicon-braces" style="font-size: 14px; margin-right: 4px;"></i> JavaScript
          </span>
          <span style="display: flex; align-items: center; padding: 0 6px; height: 100%;">
            <i class="codicon codicon-bell" style="font-size: 14px;"></i>
          </span>
        </div>
      </div>

      <!-- Overlays (Floating Elements) -->
      
      <!-- Command Palette / Quick Pick -->
      <div id="mock-command-palette" data-preview-id="commandPalette" style="
        display: none;
        position: absolute;
        top: 0px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        background-color: var(--vscode-quickInput-background, #252526);
        color: var(--vscode-quickInput-foreground, #cccccc);
        border: 1px solid var(--vscode-widget-border, #454545);
        border-radius: 6px;
        box-shadow: 0 5px 15px var(--vscode-widget-shadow, #333333);
        overflow: hidden;
        transition: outline 0.2s, box-shadow 0.2s;
        z-index: 100;
        font-family: 'Segoe WPC', 'Segoe UI', sans-serif;
      ">
        <div data-preview-id="input" style="padding: 6px;">
          <div style="
            display: flex; align-items: center;
            background-color: var(--vscode-input-background, #252526);
            color: var(--vscode-input-foreground, #cccccc);
            border: 1px solid var(--vscode-input-border, #454545);
            outline: 1px solid var(--vscode-focusBorder, #454545);
            border-radius: 2px;
            padding: 0 8px;
          ">
            <input type="text" value=">theme" style="
              width: 100%;
              padding: 8px 0;
              background: transparent;
              color: inherit;
              border: none;
              outline: none;
              font-size: 13px;
            " readonly />
          </div>
        </div>
        <div style="font-size: 13px;">
          <div data-preview-id="pickerGroup" style="padding: 4px 12px; color: var(--vscode-pickerGroup-foreground, #cccccc); border-bottom: 1px solid var(--vscode-pickerGroup-border, #454545); font-size: 11px;">recently used</div>
          <div data-preview-id="quickInputList" style="padding: 6px 20px; background-color: var(--vscode-quickInputList-focusBackground, #252526); color: var(--vscode-quickInputList-focusForeground, #cccccc); display: flex; align-items: center; justify-content: space-between;">
            <div style="display:flex; align-items:center; gap: 8px;">
              <i class="codicon codicon-gear" style="font-size: 14px;"></i>
              <span>Preferences: Color Theme</span>
            </div>
            <i class="codicon codicon-gear" style="font-size: 14px; opacity: 0.5;"></i>
          </div>
          <div style="padding: 6px 20px; display: flex; align-items: center; gap: 8px;">
            <i class="codicon codicon-refresh" style="font-size: 14px;"></i>
            <span>Developer: Reload Window</span>
          </div>
        </div>
      </div>

      <!-- Notifications -->
      <div id="mock-notifications" data-preview-id="notifications" style="
        display: none;
        position: absolute;
        bottom: 30px;
        right: 15px;
        width: 350px;
        background-color: var(--vscode-editor-background, #1e1e1e);
        border: 1px solid var(--vscode-notifications-border, #454545);
        box-shadow: 0 4px 20px var(--vscode-widget-shadow, #333333);
        border-radius: 4px;
        overflow: hidden;
        transition: outline 0.2s, box-shadow 0.2s;
        z-index: 100;
        font-family: 'Segoe WPC', 'Segoe UI', sans-serif;
      ">
        <div data-preview-id="notificationCenterHeader" style="
          padding: 8px 12px;
          background-color: var(--vscode-notificationCenterHeader-background, #252526);
          color: var(--vscode-notificationCenterHeader-foreground, #cccccc);
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
          <span style="font-weight: 600;">Notifications</span>
          <div style="display: flex; gap: 8px;">
            <i class="codicon codicon-clear-all" style="cursor: pointer;"></i>
            <i class="codicon codicon-chevron-down" style="cursor: pointer;"></i>
          </div>
        </div>
        <div style="
          padding: 12px;
          background-color: var(--vscode-notifications-background, #252526);
          color: var(--vscode-notifications-foreground, #cccccc);
          font-size: 13px;
          display: flex;
          gap: 12px;
        ">
          <i class="codicon codicon-info" style="color: var(--vscode-notificationsInfoIcon-foreground, #cccccc); font-size: 16px;"></i>
          <div>
            <div style="margin-bottom: 8px; line-height: 1.4;">Theme engine synchronized successfully with Zero Runtime Cost mode.</div>
            <div style="display: flex; gap: 8px;">
              <button style="background: var(--vscode-button-background, #252526); color: var(--vscode-button-foreground, #cccccc); border: none; padding: 4px 10px; border-radius: 2px; font-size: 12px; cursor: pointer;">View Output</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

/**
 * Listen for selection events from LeftSidebar to highlight the relevant area
 */
document.addEventListener('preview-highlight-target', (e) => {
  if (e.detail && e.detail.componentId) {
    updatePreviewState(e.detail.componentId);
  }
});

/**
 * Select left panel component ID, 
 * display/hide overlay (floating element) in the preview,
 * and highlight the relevant area
 */
export function updatePreviewState(selectedCompId) {
  const cp = document.getElementById('mock-command-palette');
  const notif = document.getElementById('mock-notifications');
  const widget = document.getElementById('mock-editor-widget');

  if (cp) cp.style.display = 'none';
  if (notif) notif.style.display = 'none';
  if (widget) widget.style.display = 'none';

  if (!selectedCompId) return;

  const idLower = selectedCompId.toLowerCase();
  let targetPreviewId = '';

  // Determine target preview ID based on componentId
  if (idLower.includes('window')) {
    targetPreviewId = 'window';
  } else if (idLower.includes('commandcenter')) {
    targetPreviewId = 'commandCenter';
  } else if (idLower.includes('titlebar')) {
    targetPreviewId = 'titleBar';
  } else if (idLower.includes('activitybar')) {
    targetPreviewId = 'activityBar';
  } else if (idLower.includes('sidebarsectionheader')) {
    targetPreviewId = 'sideBarSectionHeader';
  } else if (idLower.includes('sidebartitle')) {
    targetPreviewId = 'sideBarTitle';
  } else if (idLower.includes('sidebar') || idLower.includes('explorer')) {
    targetPreviewId = 'sideBar';
  } else if (idLower.includes('breadcrumb')) {
    targetPreviewId = 'breadcrumb';
  } else if (idLower.includes('editorlinenumber') || idLower.includes('editorgutter')) {
    targetPreviewId = 'editorLineNumber';
  } else if (idLower.includes('editorwidget') || idLower.includes('findwidget') || idLower.includes('suggestwidget')) {
    targetPreviewId = 'editorWidget';
    if (widget) widget.style.display = 'flex';
  } else if (idLower.includes('editorgroup') || idLower.includes('tab')) {
    targetPreviewId = 'tab';
  } else if (idLower.includes('editor')) {
    targetPreviewId = 'editor';
  } else if (idLower.includes('paneltitle')) {
    targetPreviewId = 'panelTitle';
  } else if (idLower.includes('panel') || idLower.includes('terminal')) {
    targetPreviewId = 'panel';
  } else if (idLower.includes('statusbar')) {
    targetPreviewId = 'statusBar';
  } else if (idLower.includes('pickergroup')) {
    targetPreviewId = 'pickerGroup';
    if (cp) cp.style.display = 'block';
  } else if (idLower.includes('quickinput') || idLower.includes('list')) {
    targetPreviewId = 'quickInputList';
    if (cp) cp.style.display = 'block';
  } else if (idLower.includes('input')) {
    targetPreviewId = 'input';
    if (cp) cp.style.display = 'block';
  } else if (idLower.includes('command') || idLower.includes('quickpick')) {
    targetPreviewId = 'commandPalette';
    if (cp) cp.style.display = 'block';
  } else if (idLower.includes('notificationcenterheader')) {
    targetPreviewId = 'notificationCenterHeader';
    if (notif) notif.style.display = 'block';
  } else if (idLower.includes('notification')) {
    targetPreviewId = 'notifications';
    if (notif) notif.style.display = 'block';
  }

  // Remove outline from all elements
  document.querySelectorAll('[data-preview-id]').forEach(el => {
    el.style.outline = 'none';
    if (el.id !== 'mock-command-palette' && el.id !== 'mock-notifications' && el.id !== 'mock-editor-widget') {
      el.style.boxShadow = 'none';
    }
  });

  // Apply outline to target element
  if (targetPreviewId) {
    const targetEl = document.querySelector(`[data-preview-id="${targetPreviewId}"]`);
    if (targetEl) {
      targetEl.style.outline = '2px solid #00aaff';
      targetEl.style.outlineOffset = '-2px';

      // Preserve existing box shadow for overlays, otherwise use glow
      if (['commandPalette', 'notifications', 'editorWidget'].includes(targetPreviewId)) {
        targetEl.style.boxShadow = '0 5px 15px var(--vscode-widget-shadow, #333333), 0 0 15px rgba(0, 170, 255, 0.6)';
      } else {
        targetEl.style.boxShadow = 'inset 0 0 15px rgba(0, 170, 255, 0.3)';
      }
    }
  }
}
