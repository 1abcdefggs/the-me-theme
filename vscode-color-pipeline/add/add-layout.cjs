const fs = require('fs');
const file = 'src/components/color/InteractiveWheel.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("this.mode = '12'; // Default to 12 hues", "this.mode = '12'; // Default to 12 hues\n    this.layoutMode = 'wheel'; // Default to circular wheel layout");

const oldHeader = `<div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--vscode-foreground, #ccc); font-weight: bold; text-transform: uppercase;">🎨 Base Hue</span>
            <div style="display: flex; gap: 12px; font-size: 11px; color: #aaa;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="wheelMode" value="12" checked> 12 Hues</label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="wheelMode" value="3"> RGB Primary</label>
            </div>
          </div>`;

const newHeader = `<div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 11px; color: var(--vscode-foreground, #ccc); font-weight: bold; text-transform: uppercase;">🎨 Base Hue</span>
            <div style="display: flex; gap: 12px; font-size: 11px; color: #aaa;">
              <span style="font-weight: bold; color: #888;">Layout:</span>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="layoutMode" value="wheel" checked> ⭕ Wheel</label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="layoutMode" value="row"> ➖ Row</label>
            </div>
            <div style="display: flex; gap: 12px; font-size: 11px; color: #aaa;">
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="wheelMode" value="12" checked> 12 Hues</label>
              <label style="cursor: pointer; display: flex; align-items: center; gap: 4px;"><input type="radio" name="wheelMode" value="3"> RGB</label>
            </div>
          </div>`;
content = content.replace(oldHeader, newHeader);

const oldDrawWheelStart = `    const getPt = (radius, hueAngleDeg) => {
      // Map HSL hue to visual angle (Clockwise): 0 (Red) -> Top (-90), 120 (Green) -> Bottom-Right (30), 240 (Blue) -> Bottom-Left (150)
      const visualAngle = hueAngleDeg - 90;
      const rad = visualAngle * Math.PI / 180;
      return { x: this.cx + radius * Math.cos(rad), y: this.cy + radius * Math.sin(rad) };
    };

    // 1. Draw outermost white background/border
    if (this.mode === '12') {`;

const newDrawWheelStart = `    // HSL to Hex helper for drawing
    const hslToHex = (h, s, l) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return \`#\${f(0)}\${f(8)}\${f(4)}\`.toUpperCase();
    };

    if (this.layoutMode === 'row') {
      const cellW = this.size / hueSegments;
      const cellH = this.size / lightnessSegments;
      for (let r = 0; r < lightnessSegments; r++) {
        const ringIndex = lightnessSegments - 1 - r; 
        const midStep = ringIndex * 3 + 2; 
        const lightness = (midStep / 15) * 50;

        for (let i = 0; i < hueSegments; i++) {
          if (this.mode === '3' && i !== 0 && i !== 4 && i !== 8) continue;
          const hue = i * angleStep;
          let hexColor = hslToHex(hue, 100, lightness);
          
          if (hexColor[1] === hexColor[2] && hexColor[3] === hexColor[4] && hexColor[5] === hexColor[6]) {
            hexColor = \`#\${hexColor[1]}\${hexColor[3]}\${hexColor[5]}\`;
          }
          
          const isPassed = this.passesWcag(hexColor);
          this.ctx.globalAlpha = isPassed ? 1.0 : 0.05;
          this.ctx.fillStyle = hexColor;
          this.ctx.fillRect(i * cellW, r * cellH, cellW, cellH);

          this.ctx.globalAlpha = 1.0;
          this.ctx.strokeStyle = '#222';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(i * cellW, r * cellH, cellW, cellH);
        }
      }
      return;
    }

    const getPt = (radius, hueAngleDeg) => {
      const visualAngle = hueAngleDeg - 90;
      const rad = visualAngle * Math.PI / 180;
      return { x: this.cx + radius * Math.cos(rad), y: this.cy + radius * Math.sin(rad) };
    };

    // 1. Draw outermost white background/border
    if (this.mode === '12') {`;
content = content.replace(oldDrawWheelStart, newDrawWheelStart);

const oldHslToHex = `    // HSL to Hex helper for drawing
    const hslToHex = (h, s, l) => {
      l /= 100;
      const a = s * Math.min(l, 1 - l) / 100;
      const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
      };
      return \`#\${f(0)}\${f(8)}\${f(4)}\`.toUpperCase();
    };`;
content = content.replace(oldHslToHex, ""); // Remove the duplicate definition down below

const oldGetColorAtPoint = `  getColorAtPoint(x, y) {
    const dx = x - this.cx;
    const dy = y - this.cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > this.radius) return null;

    let visualAngle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    // Reverse visual angle to hue angle (Clockwise): hueAngle = visualAngle + 90
    let hueAngle = visualAngle + 90;
    while (hueAngle < 0) hueAngle += 360;
    while (hueAngle >= 360) hueAngle -= 360;

    // Handle central hole click
    const holeRadius = 25;
    if (distance < holeRadius) {
      const centerHex = this.themeMode === 'dark' ? '#000' : '#FFF';
      return {
        hex: centerHex,
        snappedHue: 0,
        ringIndex: -1,
        distance: distance,
        snapX: this.cx,
        snapY: this.cy
      };
    }
    
    // Snap to dynamic hues
    const hueSegments = 12;
    const angleStep = 360 / hueSegments;
    let hueIndex = Math.round(hueAngle / angleStep);
    if (hueIndex === hueSegments) hueIndex = 0;
    
    // Ignore clicks on hidden slices in RGB mode
    if (this.mode === '3' && hueIndex !== 0 && hueIndex !== 4 && hueIndex !== 8) {
      return null;
    }
    
    const snappedHue = hueIndex * angleStep;

    // Snap to 5 lightness rings, accounting for hole
    const lightnessSegments = 5;
    const radiusStep = (this.radius - holeRadius) / lightnessSegments;
    const ringIndex = Math.max(0, Math.min(lightnessSegments - 1, Math.floor((distance - holeRadius) / radiusStep)));
    
    const midStep = ringIndex * 3 + 2;
    const lightness = (midStep / 15) * 50;`;

const newGetColorAtPoint = `  getColorAtPoint(x, y) {
    const hueSegments = 12;
    const angleStep = 360 / hueSegments;
    const lightnessSegments = 5;
    const holeRadius = 25;
    const radiusStep = (this.radius - holeRadius) / lightnessSegments;

    let hueIndex, ringIndex, distance, snapX, snapY, snappedHue;

    if (this.layoutMode === 'row') {
       const cellW = this.size / hueSegments;
       const cellH = this.size / lightnessSegments;
       
       hueIndex = Math.floor(x / cellW);
       if (hueIndex >= hueSegments) hueIndex = hueSegments - 1;
       if (hueIndex < 0) hueIndex = 0;

       const rowIndex = Math.floor(y / cellH);
       if (rowIndex >= lightnessSegments) rowIndex = lightnessSegments - 1;
       if (rowIndex < 0) rowIndex = 0;

       ringIndex = lightnessSegments - 1 - rowIndex;

       if (this.mode === '3' && hueIndex !== 0 && hueIndex !== 4 && hueIndex !== 8) {
         return null;
       }

       snappedHue = hueIndex * angleStep;
       distance = 0;
       snapX = (hueIndex * cellW) + (cellW / 2);
       snapY = (rowIndex * cellH) + (cellH / 2);
    } else {
      const dx = x - this.cx;
      const dy = y - this.cy;
      distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > this.radius) return null;

      let visualAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      let hueAngle = visualAngle + 90;
      while (hueAngle < 0) hueAngle += 360;
      while (hueAngle >= 360) hueAngle -= 360;

      if (distance < holeRadius) {
        const centerHex = this.themeMode === 'dark' ? '#000' : '#FFF';
        return {
          hex: centerHex,
          snappedHue: 0,
          ringIndex: -1,
          distance: distance,
          snapX: this.cx,
          snapY: this.cy
        };
      }
      
      hueIndex = Math.round(hueAngle / angleStep);
      if (hueIndex === hueSegments) hueIndex = 0;
      
      if (this.mode === '3' && hueIndex !== 0 && hueIndex !== 4 && hueIndex !== 8) {
        return null;
      }
      
      snappedHue = hueIndex * angleStep;
      ringIndex = Math.max(0, Math.min(lightnessSegments - 1, Math.floor((distance - holeRadius) / radiusStep)));
      
      const centerRadius = holeRadius + (ringIndex * radiusStep) + (radiusStep / 2);
      const visualAngleRad = (snappedHue - 90) * Math.PI / 180;
      snapX = this.cx + centerRadius * Math.cos(visualAngleRad);
      snapY = this.cy + centerRadius * Math.sin(visualAngleRad);
    }

    const midStep = ringIndex * 3 + 2;
    const lightness = (midStep / 15) * 50;`;
content = content.replace(oldGetColorAtPoint, newGetColorAtPoint);

const oldEvents = `    const modeRadios = this.container.querySelectorAll('input[name="wheelMode"]');`;
const newEvents = `    const layoutRadios = this.container.querySelectorAll('input[name="layoutMode"]');
    layoutRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.layoutMode = e.target.value;
        this.drawWheel();
        document.getElementById('subPaletteContainer').innerHTML = '';
        this.hoverIndicator.style.opacity = '0';
      });
    });

    const modeRadios = this.container.querySelectorAll('input[name="wheelMode"]');`;
content = content.replace(oldEvents, newEvents);

fs.writeFileSync(file, content);
console.log('success');
