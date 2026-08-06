// src/ui/controllers/layout-controller.ts

export function initLayoutController() {
    // 1. Accordion Toggle Logic for Left Panel
    const leftPanel = document.getElementById('left-panel');
    const toggleLeftBtn = document.getElementById('toggle-left-panel-btn');
    if (leftPanel && toggleLeftBtn) {
        toggleLeftBtn.addEventListener('click', () => {
            leftPanel.classList.toggle('collapsed');
            const icon = toggleLeftBtn.querySelector('.codicon');
            if (icon) {
                if (leftPanel.classList.contains('collapsed')) {
                    icon.classList.replace('codicon-chevron-left', 'codicon-chevron-right');
                    toggleLeftBtn.title = "Expand Left Panel";
                } else {
                    icon.classList.replace('codicon-chevron-right', 'codicon-chevron-left');
                    toggleLeftBtn.title = "Collapse Left Panel";
                }
            }
        });
        
        leftPanel.addEventListener('click', () => {
            if (leftPanel.classList.contains('collapsed')) {
                leftPanel.classList.remove('collapsed');
                const icon = toggleLeftBtn.querySelector('.codicon');
                if (icon) {
                    icon.classList.replace('codicon-chevron-right', 'codicon-chevron-left');
                    toggleLeftBtn.title = "Collapse Left Panel";
                }
            }
        });
    }

    // 2. Accordion Toggle Logic for Right Panel
    const rightPanel = document.getElementById('right-panel');
    const toggleRightBtn = document.getElementById('toggle-right-panel-btn');
    if (rightPanel && toggleRightBtn) {
        toggleRightBtn.addEventListener('click', () => {
            rightPanel.classList.toggle('collapsed');
            const icon = toggleRightBtn.querySelector('.codicon');
            if (icon) {
                if (rightPanel.classList.contains('collapsed')) {
                    icon.classList.replace('codicon-chevron-right', 'codicon-chevron-left');
                    toggleRightBtn.title = "Expand Right Panel";
                } else {
                    icon.classList.replace('codicon-chevron-left', 'codicon-chevron-right');
                    toggleRightBtn.title = "Collapse Right Panel";
                }
            }
        });

        rightPanel.addEventListener('click', () => {
            if (rightPanel.classList.contains('collapsed')) {
                rightPanel.classList.remove('collapsed');
                const icon = toggleRightBtn.querySelector('.codicon');
                if (icon) {
                    icon.classList.replace('codicon-chevron-left', 'codicon-chevron-right');
                    toggleRightBtn.title = "Collapse Right Panel";
                }
            }
        });
    }

    // 3. UI Mode Toggle (Tool vs Integrated)
    let isToolMode = true; // Default to Tool Mode
    const toggleLayoutBtn = document.getElementById('toggle-layout-btn');
    const leftSidebar = document.getElementById('sidebar-mock');
    const inspectorPanel = document.getElementById('inspector-panel');
    const toolModeLeft = document.getElementById('tool-mode-left');
    const toolModeRight = document.getElementById('tool-mode-right');
    const centerPanel = document.getElementById('center-panel');
    const vscodeMockContainer = document.getElementById('vscode-mock-container');
    const innerFlexContainer = leftSidebar?.parentElement;

    function applyLayoutMode() {
        if (!leftSidebar || !toolModeLeft || !toolModeRight || !centerPanel || !vscodeMockContainer || !innerFlexContainer) return;

        if (isToolMode) {
            toolModeLeft.style.display = 'flex';
            toolModeRight.style.display = 'flex';
            toolModeLeft.appendChild(leftSidebar);
            if (inspectorPanel) toolModeRight.appendChild(inspectorPanel);
            
            centerPanel.style.padding = '20px';
            vscodeMockContainer.style.border = '1px solid #3c3c3c';
            vscodeMockContainer.style.borderRadius = '8px';
            vscodeMockContainer.style.boxShadow = '0 10px 30px rgba(0,0,0,0.8)';
        } else {
            toolModeLeft.style.display = 'none';
            toolModeRight.style.display = 'none';
            
            innerFlexContainer.insertBefore(leftSidebar, innerFlexContainer.firstChild);
            if (inspectorPanel) innerFlexContainer.appendChild(inspectorPanel);
            
            centerPanel.style.padding = '0';
            vscodeMockContainer.style.border = 'none';
            vscodeMockContainer.style.borderRadius = '0';
            vscodeMockContainer.style.boxShadow = 'none';
        }
    }

    if (toggleLayoutBtn) {
        toggleLayoutBtn.addEventListener('click', () => {
            isToolMode = !isToolMode;
            localStorage.setItem('themeEditorLayoutMode', isToolMode ? 'tool' : 'integrated');
            applyLayoutMode();
        });
    }

    const savedMode = localStorage.getItem('themeEditorLayoutMode');
    if (savedMode === 'integrated') {
        isToolMode = false;
    }
    
    // Call once to initialize
    applyLayoutMode();

    // 4. Sash Resizing Logic
    const rightSash = document.getElementById("right-sash");
    if (inspectorPanel && rightSash) {
        let isRightDragging = false;
        let rightStartWidth = 0;
        let rightStartX = 0;

        rightSash.addEventListener("mousedown", (e) => {
            isRightDragging = true;
            rightStartWidth = inspectorPanel.offsetWidth;
            rightStartX = e.clientX;
            document.body.style.cursor = "col-resize";
            e.preventDefault();
        });

        document.addEventListener("mousemove", (e) => {
            if (!isRightDragging) return;
            const deltaX = rightStartX - e.clientX; 
            const newWidth = rightStartWidth + deltaX;
            const minWidth = 100;
            const maxWidth = 500;
            let constrainedWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
            inspectorPanel.style.width = `${constrainedWidth}px`;
        });

        document.addEventListener("mouseup", () => {
            if (isRightDragging) {
                isRightDragging = false;
                document.body.style.cursor = "default";
            }
        });
    }
}

