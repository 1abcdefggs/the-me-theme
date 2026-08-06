const fs = require('fs');
const file = 'src/components/layout/RightInspector.js';
let content = fs.readFileSync(file, 'utf8');

// The place where the color picker is created is ar ound line 150
const oldPickerLogic = `            const picker = document.createElement('input');
            picker.type = 'color';
            picker.value = currentVal.startsWith('#') && currentVal.length === 7 ? currentVal : '#000000';
            picker.style.cssText = 'cursor: pointer; border: 1px solid var(--vscode-widget-border, #444); background: transparent; width: 24px; height: 24px; padding: 0; flex-shrink: 0;';

            // Variable name label display processing
            if (displayMode < 2) {
              const varLabel = document.createElement('div');
              varLabel.style.cssText = 'font-size: 10px; color: var(--vscode-descriptionForeground, #888); word-break: break-all; line-height: 1.2;';
              if (displayMode === 1 && matchingColor.context) {
                const regex = new RegExp('^' + matchingColor.context + '\\\\.?');
                varLabel.textContent = '.' + matchingColor.rawId.replace(regex, '');
              } else {
                varLabel.textContent = matchingColor.rawId;
              }
              cellContainer.appendChild(varLabel);

              const hexLabel = document.createElement('span');
              hexLabel.style.cssText = 'font-family: monospace; font-size: 10px; color: var(--vscode-foreground, #ccc);';
              hexLabel.textContent = picker.value;

              pickerWrapper.appendChild(picker);
              pickerWrapper.appendChild(hexLabel);

              picker.addEventListener('input', (e) => {
                const newVal = e.target.value;
                hexLabel.textContent = newVal;
                document.documentElement.style.setProperty(cssVarName, newVal);
                ThemeExporter.recordChange(matchingColor.rawId, newVal);
              });
            } else {
              // Clean display (displayMode === 2)
              pickerWrapper.appendChild(picker);

              // For FG, find the BG with the same Modifier and create a contrast preview
              if (prop === 'foreground') {
                const matchingBg = colorsInElement.find(c => c.property === 'background' && c.modifier === mod);
                const bgVarName = matchingBg ? \`var(--vscode-\${matchingBg.rawId.replace(/\\./g, '-')}, #000)\` : 'transparent';

                const contrastPreview = document.createElement('div');
                contrastPreview.style.cssText = \`
                  display: flex; align-items: center; justify-content: center;
                  width: 30px; height: 24px; border-radius: 3px; font-weight: bold; font-size: 12px;
                  border: 1px solid var(--vscode-widget-border, #444);
                  background: \${bgVarName}; color: \${cssVarName};
                \`;
                contrastPreview.textContent = 'Aa';
                pickerWrapper.appendChild(contrastPreview);
              }

              picker.addEventListener('input', (e) => {
                const newVal = e.target.value;
                document.documentElement.style.setProperty(cssVarName, newVal);
                ThemeExporter.recordChange(matchingColor.rawId, newVal);
              });
            }`;

const newPickerLogic = `            const picker = document.createElement('div');
            picker.className = 'theme-color-target-swatch';
            picker.setAttribute('data-rawid', matchingColor.rawId);
            picker.style.cssText = \`
              cursor: pointer; 
              border: 1px solid var(--vscode-widget-border, #444); 
              background-color: \${currentVal.startsWith('#') ? currentVal : '#000000'}; 
              width: 24px; height: 24px; flex-shrink: 0;
              border-radius: 3px;
              transition: all 0.2s;
            \`;

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
            });

            // Listen for color applied event
            document.addEventListener('theme-color-applied', (e) => {
              if (e.detail.rawId === matchingColor.rawId) {
                picker.style.backgroundColor = e.detail.newColor;
                if (typeof updateHexLabel === 'function') {
                  updateHexLabel(e.detail.newColor);
                }
              }
            });

            let updateHexLabel = null;

            // Variable name label display processing
            if (displayMode < 2) {
              const varLabel = document.createElement('div');
              varLabel.style.cssText = 'font-size: 10px; color: var(--vscode-descriptionForeground, #888); word-break: break-all; line-height: 1.2;';
              if (displayMode === 1 && matchingColor.context) {
                const regex = new RegExp('^' + matchingColor.context + '\\\\.?');
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
              
              updateHexLabel = (newColor) => {
                hexLabel.textContent = newColor;
              };

              pickerWrapper.appendChild(picker);
              pickerWrapper.appendChild(hexLabel);
            } else {
              // Clean display (displayMode === 2)
              pickerWrapper.appendChild(picker);

              // For FG, find the BG with the same Modifier and create a contrast preview
              if (prop === 'foreground') {
                const matchingBg = colorsInElement.find(c => c.property === 'background' && c.modifier === mod);
                const bgVarName = matchingBg ? \`var(--vscode-\${matchingBg.rawId.replace(/\\./g, '-')}, #000)\` : 'transparent';

                const contrastPreview = document.createElement('div');
                contrastPreview.style.cssText = \`
                  display: flex; align-items: center; justify-content: center;
                  width: 30px; height: 24px; border-radius: 3px; font-weight: bold; font-size: 12px;
                  border: 1px solid var(--vscode-widget-border, #444);
                  background: \${bgVarName}; color: var(\${cssVarName});
                \`;
                contrastPreview.textContent = 'Aa';
                pickerWrapper.appendChild(contrastPreview);
              }
            }`;

content = content.replace(oldPickerLogic, newPickerLogic);
fs.writeFileSync(file, content);
console.log('success');
