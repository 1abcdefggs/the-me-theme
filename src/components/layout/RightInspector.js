import { ThemeExporter } from '../../core/ThemeExporter.js';
import { ColorParser } from '../../core/ColorParser.js';

// Global listener for color application from InteractiveWheel
document.addEventListener('theme-color-applied', (e) => {
  const { rawId, newColor } = e.detail;
  if (!rawId) return;

  const cssVarName = `--vscode-${rawId.replace(/\./g, '-')}`;
  document.documentElement.style.setProperty(cssVarName, newColor);
  ThemeExporter.recordChange(rawId, newColor);

  // Update swatches visually
  document.querySelectorAll(`.theme-color-target-swatch[data-rawid="${rawId}"]`).forEach(el => {
    el.style.backgroundColor = newColor;
  });
  // Update hex text labels
  document.querySelectorAll(`.theme-color-target-hex[data-rawid="${rawId}"]`).forEach(el => {
    el.textContent = newColor;
  });
});

// View mode: 0 = RAW, 1 = Abbreviated, 2 = Semantic (Clean)
let displayMode = 2;

export function renderRightInspector(containerEl, selectedComponent) {
  document.dispatchEvent(new CustomEvent('theme-target-cleared'));
  containerEl.innerHTML = '';

  if (!selectedComponent) {
    containerEl.innerHTML = `
      <div style="padding: 30px; text-align: center; color: #888888; font-size: 13px;">
        👈 Please select a part from the tree on the left.
      </div>
    `;
    return;
  }

  const wrapper = document.createElement('div');
  wrapper.style.padding = '15px';

  // Header Row
  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;';

  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0; font-size: 14px; font-weight: 600; color: var(--vscode-sideBarTitle-foreground, #ffffff);';
  title.textContent = selectedComponent.label;

  const toggleBtn = document.createElement('button');
  toggleBtn.style.cssText = `
    background: transparent; border: 1px solid var(--vscode-widget-border, #444); 
    color: var(--vscode-foreground, #ccc); font-size: 11px; padding: 4px 8px; 
    border-radius: 3px; cursor: pointer; display: flex; align-items: center; gap: 4px;
  `;

  const modeLabels = ['👁️ RAW', '👁️ Abbreviated', '✨ Clean'];
  toggleBtn.innerHTML = modeLabels[displayMode];
  toggleBtn.title = "View mode (RAW -> Abbreviated -> Clean)";

  toggleBtn.addEventListener('click', () => {
    displayMode = (displayMode + 1) % 3;
    renderRightInspector(containerEl, selectedComponent);
  });

  headerRow.appendChild(title);
  headerRow.appendChild(toggleBtn);
  wrapper.appendChild(headerRow);

  const divider = document.createElement('hr');
  divider.style.cssText = 'border: none; border-top: 1px solid var(--vscode-widget-border, #333); margin-bottom: 15px;';
  wrapper.appendChild(divider);

  const colorIds = selectedComponent.colorIds || [];

  if (colorIds.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.style.cssText = 'font-size: 12px; color: #888;';
    emptyMsg.textContent = 'No mapped color variables';
    wrapper.appendChild(emptyMsg);
  } else {
    const parsedColors = colorIds.map(id => ColorParser.parse(id));
    const elementGroups = {};
    parsedColors.forEach(parsed => {
      const elKey = parsed.element || 'base_element';
      if (!elementGroups[elKey]) elementGroups[elKey] = [];
      elementGroups[elKey].push(parsed);
    });

    const modifierOrder = ['base', 'inactive', 'active', 'hover', 'focus', 'selection', 'error', 'warning', 'info'];

    Object.keys(elementGroups).forEach(elKey => {
      const colorsInElement = elementGroups[elKey];

      if (elKey !== 'base_element') {
        const elTitle = document.createElement('h4');
        elTitle.style.cssText = 'margin: 20px 0 10px 0; font-size: 12px; text-transform: uppercase; color: var(--vscode-textLink-foreground, #3794ff); border-bottom: 1px dashed var(--vscode-widget-border, #333333); padding-bottom: 4px;';
        elTitle.textContent = `Variant: ${elKey}`;
        wrapper.appendChild(elTitle);
      }

      const properties = [...new Set(colorsInElement.map(c => c.property))];
      properties.sort((a, b) => {
        const order = { 'background': 1, 'foreground': 2, 'border': 3 };
        const valA = order[a] || 99;
        const valB = order[b] || 99;
        return valA - valB;
      });

      const activeModifiersInGroup = [...new Set(colorsInElement.map(c => c.modifier))];
      activeModifiersInGroup.sort((a, b) => {
        let indexA = modifierOrder.indexOf(a);
        let indexB = modifierOrder.indexOf(b);
        if (indexA === -1) indexA = 99;
        if (indexB === -1) indexB = 99;
        return indexA - indexB;
      });

      const table = document.createElement('table');
      table.style.cssText = 'width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 20px;';

      const thead = document.createElement('thead');
      const headerTr = document.createElement('tr');

      const thProp = document.createElement('th');
      thProp.style.cssText = 'text-align: left; padding: 6px; color: var(--vscode-sideBarSectionHeader-foreground, #aaa); border-bottom: 1px solid var(--vscode-widget-border, #333);';
      thProp.textContent = 'Property';
      headerTr.appendChild(thProp);

      activeModifiersInGroup.forEach(mod => {
        const thMod = document.createElement('th');
        thMod.style.cssText = 'text-align: left; padding: 6px; color: var(--vscode-sideBarSectionHeader-foreground, #aaa); border-bottom: 1px solid var(--vscode-widget-border, #333); text-transform: capitalize;';
        thMod.textContent = mod;
        headerTr.appendChild(thMod);
      });
      thead.appendChild(headerTr);
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      properties.forEach(prop => {
        const tr = document.createElement('tr');

        const tdProp = document.createElement('td');
        // Clean display shortens property names (BG, FG, Border)
        let propLabel = prop;
        if (displayMode === 2) {
          if (prop === 'background') propLabel = 'BG';
          else if (prop === 'foreground') propLabel = 'FG';
        }
        tdProp.style.cssText = 'padding: 8px 6px; font-weight: bold; color: var(--vscode-foreground, #ccc); border-bottom: 1px dotted var(--vscode-widget-border, #333); text-transform: capitalize;';
        tdProp.textContent = propLabel;
        tr.appendChild(tdProp);

        activeModifiersInGroup.forEach(mod => {
          const tdMod = document.createElement('td');
          tdMod.style.cssText = 'padding: 8px 6px; border-bottom: 1px dotted var(--vscode-widget-border, #333); vertical-align: top;';

          const matchingColor = colorsInElement.find(c => c.property === prop && c.modifier === mod);

          if (matchingColor) {
            const cellContainer = document.createElement('div');
            cellContainer.style.cssText = 'display: flex; flex-direction: column; gap: 4px;';

            const cssVarName = `--vscode-${matchingColor.rawId.replace(/\./g, '-')}`;
            const currentVal = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();

            const pickerWrapper = document.createElement('div');
            pickerWrapper.style.cssText = 'display: flex; align-items: center; gap: 6px;';

            const picker = document.createElement('div');
            picker.className = 'theme-color-target-swatch';
            picker.setAttribute('data-rawid', matchingColor.rawId);
            picker.style.cssText = `
              cursor: pointer; 
              border: 1px solid var(--vscode-widget-border, #444); 
              background-color: ${currentVal.startsWith('#') ? currentVal : '#000000'}; 
              width: 24px; height: 24px; flex-shrink: 0;
              border-radius: 3px;
              transition: all 0.2s;
            `;

            // Active target selection logic
            picker.addEventListener('click', () => {
              // Remove active class from all swatches
              document.querySelectorAll('.theme-color-target-swatch').forEach(el => {
                el.style.border = '1px solid var(--vscode-widget-border, #444)';
                el.style.boxShadow = 'none';
              });
              // Highlight this swatch
              picker.style.border = '2px solid #00aaff';
              picker.style.boxShadow = '0 0 6px rgba(0, 170, 255, 0.6)';

              // Broadcast target changed
              document.dispatchEvent(new CustomEvent('theme-target-changed', {
                detail: {
                  rawId: matchingColor.rawId,
                  currentColor: currentVal,
                  cssVarName: cssVarName
                }
              }));

              // Open Advanced Color Palette
              if (window.openColorPalette) {
                 let refHex = null;
                 if (prop === 'foreground') {
                    const matchingBg = colorsInElement.find(c => c.property === 'background' && c.modifier === mod);
                    if (matchingBg) {
                       const computed = getComputedStyle(document.documentElement).getPropertyValue(`--vscode-${matchingBg.rawId.replaceAll('.', '-')}`).trim();
                       if (computed && computed.startsWith('#')) refHex = computed;
                    }
                 }
                 window.openColorPalette(picker, matchingColor.rawId, currentVal, refHex, (newColor) => {
                    document.dispatchEvent(new CustomEvent('theme-color-applied', {
                      detail: {
                        rawId: matchingColor.rawId,
                        newColor: newColor
                      }
                    }));
                 });
              }
            });



            // Variable name label display processing
            if (displayMode < 2) {
              const varLabel = document.createElement('div');
              varLabel.style.cssText = 'font-size: 10px; color: var(--vscode-descriptionForeground, #888); word-break: break-all; line-height: 1.2;';
              if (displayMode === 1 && matchingColor.context) {
                const regex = new RegExp('^' + matchingColor.context + '\\.?');
                varLabel.textContent = '.' + matchingColor.rawId.replace(regex, '');
              } else {
                varLabel.textContent = matchingColor.rawId;
              }
              cellContainer.appendChild(varLabel);

              const hexLabel = document.createElement('span');
              hexLabel.className = 'theme-color-target-hex';
              hexLabel.setAttribute('data-rawid', matchingColor.rawId);
              hexLabel.style.cssText = 'font-family: monospace; font-size: 10px; color: var(--vscode-foreground, #ccc);';
              hexLabel.textContent = currentVal.startsWith('#') ? currentVal : '#000000';



              pickerWrapper.appendChild(picker);
              pickerWrapper.appendChild(hexLabel);
            } else {
              // Clean display (displayMode === 2)
              pickerWrapper.appendChild(picker);

              // For FG, find the BG with the same Modifier and create a contrast preview
              if (prop === 'foreground') {
                const matchingBg = colorsInElement.find(c => c.property === 'background' && c.modifier === mod);
                const bgVarName = matchingBg ? `var(--vscode-${matchingBg.rawId.replace(/\./g, '-')}, #000)` : 'transparent';

                const contrastPreview = document.createElement('div');
                contrastPreview.style.cssText = `
                  display: flex; align-items: center; justify-content: center;
                  width: 30px; height: 24px; border-radius: 3px; font-weight: bold; font-size: 12px;
                  border: 1px solid var(--vscode-widget-border, #444);
                  background: ${bgVarName}; color: var(${cssVarName});
                `;
                contrastPreview.textContent = 'Aa';
                pickerWrapper.appendChild(contrastPreview);
              }
            }

            cellContainer.appendChild(pickerWrapper);
            tdMod.appendChild(cellContainer);
          } else {
            tdMod.innerHTML = '<span style="color: #444;">-</span>';
          }
          tr.appendChild(tdMod);
        });
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      wrapper.appendChild(table);
    });
  }

  // Export Button
  const btnContainer = document.createElement('div');
  btnContainer.style.marginTop = '30px';

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Theme Export (JSON)';
  exportBtn.style.cssText = `
    width: 100%;
    padding: 10px;
    background-color: var(--vscode-button-background, #0e639c);
    color: var(--vscode-button-foreground, #ffffff);
    border: none;
    border-radius: 2px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;
  `;

  exportBtn.addEventListener('mouseover', () => {
    exportBtn.style.backgroundColor = 'var(--vscode-button-hoverBackground, #1177bb)';
  });

  exportBtn.addEventListener('mouseout', () => {
    exportBtn.style.backgroundColor = 'var(--vscode-button-background, #0e639c)';
  });

  exportBtn.addEventListener('click', () => {
    ThemeExporter.exportToJson('My-TheMeTheme');
  });

  btnContainer.appendChild(exportBtn);
  wrapper.appendChild(btnContainer);

  containerEl.appendChild(wrapper);
}
