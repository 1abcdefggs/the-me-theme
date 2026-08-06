const fs = require('fs');
const file = 'src/components/color/InteractiveWheel.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add activeTarget state to init()
const initOld = `  init() {
    this.mode = '12'; // Default to 12 hues
    this.layoutMode = 'wheel'; // Default to circular wheel layout
    this.themeMode = 'dark';
    this.wcagThreshold = 1.0;`;
const initNew = `  init() {
    this.activeTarget = null;
    this.mode = '12'; // Default to 12 hues
    this.layoutMode = 'wheel'; // Default to circular wheel layout
    this.themeMode = 'dark';
    this.wcagThreshold = 1.0;`;
content = content.replace(initOld, initNew);

// 2. Add target banner to HTML
const htmlOld = `      <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px 10px 20px; align-items: center; border-bottom: 1px dashed #333; margin-bottom: 10px;">`;
const htmlNew = `      <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        
        <div id="activeTargetBanner" style="display: none; width: 100%; padding: 10px 20px; background: rgba(0, 170, 255, 0.1); border-bottom: 1px solid #00aaff; margin-bottom: 10px; font-size: 12px; font-family: monospace;">
          <span style="color: #00aaff; font-weight: bold;">🎯 Target:</span> <span id="activeTargetName" style="color: #fff;"></span>
        </div>

        <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px 10px 20px; align-items: center; border-bottom: 1px dashed #333; margin-bottom: 10px;">`;
content = content.replace(htmlOld, htmlNew);

// 3. Attach elements in init
const varsOld = `    this.stepText = document.getElementById('wheelStepText');
    this.grayscaleContainer = document.getElementById('grayscaleContainer');`;
const varsNew = `    this.stepText = document.getElementById('wheelStepText');
    this.grayscaleContainer = document.getElementById('grayscaleContainer');
    this.targetBanner = document.getElementById('activeTargetBanner');
    this.targetName = document.getElementById('activeTargetName');`;
content = content.replace(varsOld, varsNew);

// 4. Update attachEvents to listen to 'theme-target-changed'
const eventsOld = `  attachEvents() {
    const wheelRadios = this.container.querySelectorAll('input[name="wheelMode"]');`;
const eventsNew = `  attachEvents() {
    document.addEventListener('theme-target-changed', (e) => {
      this.activeTarget = e.detail;
      this.targetBanner.style.display = 'block';
      this.targetName.textContent = e.detail.rawId;
    });

    const wheelRadios = this.container.querySelectorAll('input[name="wheelMode"]');`;
content = content.replace(eventsOld, eventsNew);

// 5. Update click behavior in InteractiveWheel canvas
const clickOld = `    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colorData = this.getColorAtPoint(x, y);
      
      if (colorData && this.onSelect) {
        this.showSubPalette(colorData);
        this.onSelect(colorData.hex);
      }
    });`;
const clickNew = `    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const colorData = this.getColorAtPoint(x, y);
      
      if (colorData) {
        this.showSubPalette(colorData);
        if (this.onSelect) this.onSelect(colorData.hex);
        
        // Dispatch color applied if target is active
        if (this.activeTarget) {
          document.dispatchEvent(new CustomEvent('theme-color-applied', {
            detail: {
              rawId: this.activeTarget.rawId,
              newColor: colorData.hex
            }
          }));
        }
      }
    });`;
content = content.replace(clickOld, clickNew);

// 6. Update grayscale click behavior
const grayClickOld = `      swatch.addEventListener('click', () => {
        const hex = swatch.getAttribute('data-hex');
        // Treat as selecting a color from the palette
        this.hoverIndicator.style.opacity = '0';
        // Clear sub-palette for grayscale to keep it simple, or we could generate a sub-palette
        document.getElementById('subPaletteContainer').innerHTML = \`<div style="color: #aaa; font-size: 11px;">Selected Grayscale: <span style="color:#fff; font-weight:bold;">\${hex}</span></div>\`;
      });`;
const grayClickNew = `      swatch.addEventListener('click', () => {
        const hex = swatch.getAttribute('data-hex');
        // Treat as selecting a color from the palette
        this.hoverIndicator.style.opacity = '0';
        document.getElementById('subPaletteContainer').innerHTML = \`<div style="color: #aaa; font-size: 11px;">Selected Grayscale: <span style="color:#fff; font-weight:bold;">\${hex}</span></div>\`;
        
        if (this.activeTarget) {
          document.dispatchEvent(new CustomEvent('theme-color-applied', {
            detail: {
              rawId: this.activeTarget.rawId,
              newColor: hex
            }
          }));
        }
      });`;
content = content.replace(grayClickOld, grayClickNew);

fs.writeFileSync(file, content);
console.log('success');
