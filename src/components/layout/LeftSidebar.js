let currentViewMode = 'category';

export function renderLeftSidebar(containerEl, treeData, onSelectComponent) {
  containerEl.innerHTML = '';

  const headerContainer = document.createElement('div');
  headerContainer.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 15px 8px;
  `;

  const header = document.createElement('h2');
  header.style.cssText = `
    font-size: 11px;
    text-transform: uppercase;
    margin: 0;
    letter-spacing: 0.5px;
    color: var(--vscode-sideBarTitle-foreground, #ccc);
  `;
  header.textContent = 'UI Components';

  const leftPanel = document.getElementById('left-panel');
  const centerPanel = document.getElementById('center-panel');
  const rightPanel = document.getElementById('right-panel');

  // Set docked state by default (first time)
  if (!rightPanel.hasAttribute('data-layout-initialized')) {
    rightPanel.setAttribute('data-layout-initialized', 'true');
    leftPanel.style.order = '1';
    rightPanel.style.order = '2';
    centerPanel.style.order = '3';
  }

  const isDocked = rightPanel.style.order === '2';

  const toggleLayoutBtn = document.createElement('button');
  toggleLayoutBtn.textContent = isDocked ? '◧ separation' : '◨ docked';
  toggleLayoutBtn.title = 'Toggle right panel position';
  toggleLayoutBtn.style.cssText = `
    background: var(--vscode-button-secondaryBackground, #3a3d41);
    color: var(--vscode-button-secondaryForeground, #fff);
    border: none;
    border-radius: 3px;
    cursor: pointer;
    font-size: 10px;
    padding: 3px 6px;
    opacity: 0.8;
  `;
  toggleLayoutBtn.addEventListener('mouseover', () => toggleLayoutBtn.style.opacity = '1');
  toggleLayoutBtn.addEventListener('mouseout', () => toggleLayoutBtn.style.opacity = '0.8');

  toggleLayoutBtn.onclick = () => {
    if (rightPanel.style.order === '2') {
      leftPanel.style.order = '';
      centerPanel.style.order = '';
      rightPanel.style.order = '';
      toggleLayoutBtn.textContent = '◨ docked';
    } else {
      leftPanel.style.order = '1';
      rightPanel.style.order = '2';
      centerPanel.style.order = '3';
      toggleLayoutBtn.textContent = '◧ separation';
    }
  };

  headerContainer.appendChild(header);
  headerContainer.appendChild(toggleLayoutBtn);
  containerEl.appendChild(headerContainer);

  const modeSelectContainer = document.createElement('div');
  modeSelectContainer.style.cssText = `
    padding: 0 15px 12px;
    border-bottom: 1px solid var(--vscode-widget-border, #333);
  `;

  const modeSelect = document.createElement('select');
  modeSelect.style.cssText = `
    width: 100%;
    background: var(--vscode-dropdown-background, #3c3c3c);
    color: var(--vscode-dropdown-foreground, #f0f0f0);
    border: 1px solid var(--vscode-dropdown-border, #3c3c3c);
    padding: 4px;
    font-size: 11px;
    outline: none;
    cursor: pointer;
  `;

  // Calculate Semantic counts
  let semanticCount = 0;
  treeData.byCategory.forEach(cat => {
    if (cat.children) {
      cat.children.forEach(comp => {
        if (comp.colorIds) semanticCount += comp.colorIds.length;
      });
    }
  });

  // Calculate Layout counts
  let layoutMapped = 0;
  let layoutUnmapped = 0;
  treeData.byLayout.forEach(cat => {
    if (cat.category.includes('Unmapped Colors')) {
      if (cat.children) {
        cat.children.forEach(comp => {
          if (comp.colorIds) layoutUnmapped += comp.colorIds.length;
        });
      }
    } else {
      if (cat.children) {
        cat.children.forEach(comp => {
          if (comp.colorIds) layoutMapped += comp.colorIds.length;
        });
      }
    }
  });

  const layoutAll = layoutMapped + layoutUnmapped;

  const optCat = document.createElement('option');
  optCat.value = 'category';
  optCat.textContent = `View: Semantic Categories (${semanticCount} / ${semanticCount})`;

  const optLayout = document.createElement('option');
  optLayout.value = 'layout';
  optLayout.textContent = `View: Physical Layout (${layoutAll} | Mapped: ${layoutMapped}, Unmapped: ${layoutUnmapped})`;

  modeSelect.appendChild(optCat);
  modeSelect.appendChild(optLayout);
  modeSelect.value = currentViewMode;
  modeSelectContainer.appendChild(modeSelect);
  containerEl.appendChild(modeSelectContainer);

  const listContainer = document.createElement('div');
  listContainer.style.cssText = 'overflow-y: auto;';
  containerEl.appendChild(listContainer);

  const renderList = () => {
    listContainer.innerHTML = '';

    let actualData = treeData;
    if (treeData && !Array.isArray(treeData)) {
      actualData = currentViewMode === 'category' ? treeData.byCategory : treeData.byLayout;
    }

    if (!actualData) return;

    const list = document.createElement('ul');
    list.style.cssText = 'list-style: none; padding: 0; margin: 0;';

    actualData.forEach(category => {
      const catItem = document.createElement('li');
      catItem.style.cssText = `
        margin-bottom: 0px;
        border-bottom: 1px solid var(--vscode-widget-border, #333);
        padding-bottom: 8px;
      `;

      const catHeader = document.createElement('div');
      catHeader.style.cssText = `
        font-weight: 700;
        padding: 8px 15px;
        font-size: 13px;
        background-color: var(--vscode-sideBarSectionHeader-background, #252526);
        color: var(--vscode-textLink-foreground, #3794ff);
        border-left: 3px solid var(--vscode-textLink-foreground, #3794ff);
        cursor: pointer;
      `;
      let catTotalColors = 0;
      (category.children || []).forEach(comp => {
        if (comp.colorIds) {
          catTotalColors += comp.colorIds.length;
        }
      });

      catHeader.textContent = `${category.category} (${catTotalColors})`;
      catHeader.addEventListener('mouseover', () => {
        catHeader.style.backgroundColor = 'var(--vscode-list-hoverBackground, #2a2d2e)';
      });
      catHeader.addEventListener('mouseout', () => {
        catHeader.style.backgroundColor = 'var(--vscode-sideBarSectionHeader-background, #252526)';
      });

      catHeader.addEventListener('click', () => {
        const allColorIds = [];
        (category.children || []).forEach(comp => {
          if (comp.colorIds) {
            allColorIds.push(...comp.colorIds);
          }
        });

        listContainer.querySelectorAll('li').forEach(el => {
          el.classList.remove('selected');
          el.style.borderLeftColor = 'transparent';
          el.style.backgroundColor = 'transparent';
        });

        const compId = `category_${category.category}`;
        document.dispatchEvent(new CustomEvent('preview-highlight-target', {
          detail: { componentId: compId }
        }));

        onSelectComponent({
          componentId: compId,
          label: `[ALL] ${category.category}`,
          colorIds: Array.from(new Set(allColorIds))
        });
      });

      catItem.appendChild(catHeader);

      const childList = document.createElement('ul');
      childList.style.cssText = 'list-style: none; padding: 0; margin: 0;';

      (category.children || []).forEach(comp => {
        if (comp.type === 'header') {
          const headerItem = document.createElement('li');
          headerItem.style.cssText = `
            padding: 16px 15px 4px 15px;
            font-size: 11px;
            font-weight: 600;
            color: var(--vscode-sideBarTitle-foreground, #bbb);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            pointer-events: none;
            border-bottom: 1px dashed var(--vscode-widget-border, #333);
            margin-bottom: 4px;
            padding-bottom: 6px;
          `;
          headerItem.textContent = comp.label;
          childList.appendChild(headerItem);
          return;
        }

        const compItem = document.createElement('li');
        compItem.style.cssText = `
          padding: 8px 15px 8px 25px;
          cursor: pointer;
          font-size: 13px;
          transition: background-color 0.15s ease, color 0.15s ease;
          border-left: 3px solid transparent;
        `;
        compItem.textContent = comp.label;

        compItem.addEventListener('mouseover', () => {
          compItem.style.backgroundColor = 'var(--vscode-list-hoverBackground, #2a2d2e)';
          compItem.style.color = 'var(--vscode-list-hoverForeground, #fff)';
        });

        compItem.addEventListener('mouseout', () => {
          if (!compItem.classList.contains('selected')) {
            compItem.style.backgroundColor = 'transparent';
            compItem.style.color = 'inherit';
          }
        });

        compItem.addEventListener('click', () => {
          listContainer.querySelectorAll('li').forEach(el => {
            el.classList.remove('selected');
            el.style.borderLeftColor = 'transparent';
            el.style.backgroundColor = 'transparent';
          });
          compItem.classList.add('selected');
          compItem.style.borderLeftColor = 'var(--vscode-activityBar-activeBorder, #007acc)';
          compItem.style.backgroundColor = 'var(--vscode-list-activeSelectionBackground, #094771)';

          document.dispatchEvent(new CustomEvent('preview-highlight-target', {
            detail: { componentId: comp.componentId }
          }));
          onSelectComponent(comp);
        });

        childList.appendChild(compItem);
      });

      catItem.appendChild(childList);
      list.appendChild(catItem);
    });

    listContainer.appendChild(list);
  };

  modeSelect.addEventListener('change', (e) => {
    currentViewMode = e.target.value;
    renderList();
  });

  // Initial render
  renderList();
}