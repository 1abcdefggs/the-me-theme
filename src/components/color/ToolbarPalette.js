export class ToolbarPalette {
  constructor(containerId, onColorSelected) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.onColorSelected = onColorSelected;
    this.activeTarget = null;
    this.init();
    this.attachEvents();
  }

  hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(15 * color).toString(16);
    };
    return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
  }

  init() {
    this.container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 4px; position: relative;" id="toolbar-palette-wrapper">
        <div id="tp-active-target" style="font-size: 10px; color: #aaa; margin-right: 10px; font-family: monospace; display: none;"></div>
        <div id="tp-hues" style="display: flex; border-radius: 4px; overflow: hidden; border: 1px solid #444;"></div>
        <div id="tp-grays" style="display: flex; border-radius: 4px; overflow: hidden; border: 1px solid #444; margin-left: 5px;"></div>
        
        <!-- Popover -->
        <div id="tp-popover" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 8px; background: #252526; border: 1px solid #454545; border-radius: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 1000; padding: 10px; flex-direction: column; gap: 8px;">
          <div style="font-size: 10px; color: #ccc; font-weight: bold; text-align: center;" id="tp-popover-title">Variations</div>
          <div id="tp-popover-swatches" style="display: flex; gap: 4px;"></div>
        </div>
      </div>
    `;

    this.huesContainer = document.getElementById('tp-hues');
    this.graysContainer = document.getElementById('tp-grays');
    this.popover = document.getElementById('tp-popover');
    this.popoverSwatches = document.getElementById('tp-popover-swatches');
    this.targetLabel = document.getElementById('tp-active-target');

    this.renderHues();
    this.renderGrays();
  }

  renderHues() {
    // 12 base hues
    for (let i = 0; i < 12; i++) {
      const hue = i * 30;
      const hex = this.hslToHex(hue, 100, 50);
      const swatch = this.createSwatch(hex, () => this.openPopover(hue, 'color'));
      this.huesContainer.appendChild(swatch);
    }
  }

  renderGrays() {
    // 5 grayscales
    const grays = ['#FFFFFF', '#AAAAAA', '#666666', '#333333', '#000000'];
    grays.forEach(hex => {
      const swatch = this.createSwatch(hex, () => this.applyColor(hex));
      this.graysContainer.appendChild(swatch);
    });
  }

  createSwatch(hex, onClick) {
    const el = document.createElement('div');
    el.style.width = '16px';
    el.style.height = '16px';
    el.style.backgroundColor = hex;
    el.style.cursor = 'pointer';
    el.addEventListener('mouseenter', () => { el.style.opacity = '0.8'; });
    el.addEventListener('mouseleave', () => { el.style.opacity = '1.0'; });
    el.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent closing popover immediately
      onClick();
    });
    return el;
  }

  openPopover(baseHue, type) {
    this.popover.style.display = 'flex';
    this.popoverSwatches.innerHTML = '';

    // Generate 15 lightness variations from 90% down to 20%
    const variations = [90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20];

    // Ensure container can wrap if it's too wide
    this.popoverSwatches.style.flexWrap = 'wrap';
    this.popoverSwatches.style.maxWidth = '250px';

    variations.forEach((l, idx) => {
      const hex = this.hslToHex(baseHue, 100, l);

      const swatchWrapper = document.createElement('div');
      swatchWrapper.style.display = 'flex';
      swatchWrapper.style.flexDirection = 'column';
      swatchWrapper.style.alignItems = 'center';
      swatchWrapper.style.gap = '4px';

      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundColor = hex;
      el.style.borderRadius = '3px';
      el.style.border = '1px solid #444';
      el.style.cursor = 'pointer';

      el.addEventListener('click', () => {
        this.applyColor(hex);
      });

      const label = document.createElement('div');
      label.style.fontSize = '9px';
      label.style.color = '#888';
      label.innerText = `L${l}`;

      swatchWrapper.appendChild(el);
      swatchWrapper.appendChild(label);
      this.popoverSwatches.appendChild(swatchWrapper);
    });
  }

  applyColor(hex) {
    if (this.activeTarget) {
      document.dispatchEvent(new CustomEvent('theme-color-applied', {
        detail: {
          rawId: this.activeTarget.rawId,
          newColor: hex
        }
      }));
    }
    // Automatically close popover when a color is picked
    this.popover.style.display = 'none';
  }

  attachEvents() {
    // Listen for target component variable selection
    document.addEventListener('theme-target-changed', (e) => {
      this.activeTarget = e.detail;
      if (this.targetLabel) {
        this.targetLabel.style.display = 'block';
        // show short name
        const parts = this.activeTarget.rawId.split('.');
        const shortName = parts[parts.length - 1];
        this.targetLabel.innerText = `Target: ${shortName}`;
      }
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target)) {
        this.popover.style.display = 'none';
      }
    });
  }
}
