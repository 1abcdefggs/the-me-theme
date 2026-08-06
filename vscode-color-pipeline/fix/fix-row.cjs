const fs = require('fs');
const file = 'src/components/color/InteractiveWheel.js';
let content = fs.readFileSync(file, 'utf8');

// Replace the row drawing logic in drawWheel
const oldDrawWheelRow = `    if (this.layoutMode === 'row') {
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
    }`;

const newDrawWheelRow = `    if (this.layoutMode === 'row') {
      const activeHues = this.mode === '3' ? [0, 4, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      const cellW = this.size / activeHues.length;
      const cellH = this.size / lightnessSegments;
      for (let r = 0; r < lightnessSegments; r++) {
        const ringIndex = lightnessSegments - 1 - r; 
        const midStep = ringIndex * 3 + 2; 
        const lightness = (midStep / 15) * 50;

        for (let col = 0; col < activeHues.length; col++) {
          const hueIndex = activeHues[col];
          const hue = hueIndex * angleStep;
          let hexColor = hslToHex(hue, 100, lightness);
          
          if (hexColor[1] === hexColor[2] && hexColor[3] === hexColor[4] && hexColor[5] === hexColor[6]) {
            hexColor = \`#\${hexColor[1]}\${hexColor[3]}\${hexColor[5]}\`;
          }
          
          const isPassed = this.passesWcag(hexColor);
          this.ctx.globalAlpha = isPassed ? 1.0 : 0.05;
          this.ctx.fillStyle = hexColor;
          this.ctx.fillRect(col * cellW, r * cellH, cellW, cellH);

          this.ctx.globalAlpha = 1.0;
          this.ctx.strokeStyle = '#222';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(col * cellW, r * cellH, cellW, cellH);
        }
      }
      return;
    }`;

content = content.replace(oldDrawWheelRow, newDrawWheelRow);

// Replace the row logic in getColorAtPoint
const oldGetColorRow = `    if (this.layoutMode === 'row') {
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
    } else {`;

const newGetColorRow = `    if (this.layoutMode === 'row') {
       const activeHues = this.mode === '3' ? [0, 4, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
       const cellW = this.size / activeHues.length;
       const cellH = this.size / lightnessSegments;
       
       let col = Math.floor(x / cellW);
       if (col >= activeHues.length) col = activeHues.length - 1;
       if (col < 0) col = 0;
       hueIndex = activeHues[col];

       const rowIndex = Math.floor(y / cellH);
       if (rowIndex >= lightnessSegments) rowIndex = lightnessSegments - 1;
       if (rowIndex < 0) rowIndex = 0;

       ringIndex = lightnessSegments - 1 - rowIndex;

       snappedHue = hueIndex * angleStep;
       distance = 0;
       snapX = (col * cellW) + (cellW / 2);
       snapY = (rowIndex * cellH) + (cellH / 2);
    } else {`;

content = content.replace(oldGetColorRow, newGetColorRow);

fs.writeFileSync(file, content);
console.log('success');
