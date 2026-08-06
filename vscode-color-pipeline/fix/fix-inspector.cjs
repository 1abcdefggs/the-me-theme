const fs = require('fs');
const file = 'src/components/layout/RightInspector.js';
let content = fs.readFileSync(file, 'utf8');

const oldListener = `            // Listen for color applied event
            document.addEventListener('theme-color-applied', (e) => {
              if (e.detail.rawId === matchingColor.rawId) {
                picker.style.backgroundColor = e.detail.newColor;
                if (typeof updateHexLabel === 'function') {
                  updateHexLabel(e.detail.newColor);
                }
              }
            });`;

const newListener = `            // Listen for color applied event
            document.addEventListener('theme-color-applied', (e) => {
              if (e.detail.rawId === matchingColor.rawId) {
                picker.style.backgroundColor = e.detail.newColor;
                if (typeof updateHexLabel === 'function') {
                  updateHexLabel(e.detail.newColor);
                }
                document.documentElement.style.setProperty(cssVarName, e.detail.newColor);
                ThemeExporter.recordChange(matchingColor.rawId, e.detail.newColor);
              }
            });`;

content = content.replace(oldListener, newListener);
fs.writeFileSync(file, content);
console.log('success');
