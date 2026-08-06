const fs = require('fs');
const file = 'src/components/color/InteractiveWheel.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add grayscaleContainer to the HTML template in init()
const htmlOld = `        <div id="subPaletteContainer" style="width: 100%; padding: 15px 20px 5px 20px; display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; min-height: 44px;"></div>`;
const htmlNew = `        <div id="grayscaleContainer" style="width: 100%; padding: 10px 20px 0 20px; display: flex; gap: 2px; justify-content: center; height: 32px;"></div>
        <div id="subPaletteContainer" style="width: 100%; padding: 15px 20px 5px 20px; display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; min-height: 44px;"></div>`;
content = content.replace(htmlOld, htmlNew);

// 2. Add this.grayscaleContainer = ...
const varsOld = `    this.stepText = document.getElementById('wheelStepText');`;
const varsNew = `    this.stepText = document.getElementById('wheelStepText');
    this.grayscaleContainer = document.getElementById('grayscaleContainer');`;
content = content.replace(varsOld, varsNew);

// 3. Create a renderGrayscale method in the class and call it from drawWheel()
// Let's insert it before drawWheel()
const methodOld = `  drawWheel() {`;
const methodNew = `  renderGrayscale() {
    if (!this.grayscaleContainer) return;
    let html = '';
    for (let i = 0; i <= 15; i++) {
      const hexChar = i.toString(16).toUpperCase();
      const hexColor = \`#\${hexChar}\${hexChar}\${hexChar}\`;
      const isPassed = this.passesWcag(hexColor);
      const opacity = isPassed ? 1.0 : 0.05;
      
      html += \`<div 
        class="gray-swatch"
        data-hex="\${hexColor}"
        style="
          flex: 1; 
          background-color: \${hexColor}; 
          opacity: \${opacity};
          border: 1px solid #333;
          cursor: pointer;
          transition: transform 0.1s;
        "></div>\`;
    }
    this.grayscaleContainer.innerHTML = html;
    
    // Attach events
    const swatches = this.grayscaleContainer.querySelectorAll('.gray-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('mousemove', (e) => {
        const hex = swatch.getAttribute('data-hex');
        this.colorPreview.style.background = hex;
        this.hexText.textContent = hex;
        this.hexText.style.color = '#fff';
        
        const contrast = this.cr(hex, this.themeMode === 'dark' ? '#000000' : '#FFFFFF');
        this.stepText.innerHTML = \`CR: \${contrast.toFixed(2)}:1 vs \${this.themeMode === 'dark' ? '#000' : '#FFF'}\`;
        
        // Slightly enlarge
        swatch.style.transform = 'scale(1.1)';
        swatch.style.zIndex = '10';
        swatch.style.position = 'relative';
      });
      
      swatch.addEventListener('mouseleave', () => {
        swatch.style.transform = 'scale(1)';
        swatch.style.zIndex = '1';
      });
      
      swatch.addEventListener('click', () => {
        const hex = swatch.getAttribute('data-hex');
        // Treat as selecting a color from the palette
        this.hoverIndicator.style.opacity = '0';
        // Clear sub-palette for grayscale to keep it simple, or we could generate a sub-palette
        document.getElementById('subPaletteContainer').innerHTML = \`<div style="color: #aaa; font-size: 11px;">Selected Grayscale: <span style="color:#fff; font-weight:bold;">\${hex}</span></div>\`;
      });
    });
  }

  drawWheel() {`;
content = content.replace(methodOld, methodNew);

// 4. Call this.renderGrayscale() inside drawWheel()
// Put it at the very end of drawWheel()
const endWheelOld = `    // 2. Draw 5 rings of 12 hues`;
const endWheelNew = `    this.renderGrayscale();
    // 2. Draw 5 rings of 12 hues`;
// Wait, better to just put it in drawWheel before the early return, or just at the top of drawWheel
const topWheelOld = `    this.canvas.style.borderRadius = this.layoutMode === 'wheel' ? '50%' : '0%';`;
const topWheelNew = `    this.canvas.style.borderRadius = this.layoutMode === 'wheel' ? '50%' : '0%';
    this.renderGrayscale();`;
content = content.replace(topWheelOld, topWheelNew);


fs.writeFileSync(file, content);
console.log('success');
