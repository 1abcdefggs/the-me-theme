import { generateAll4096Colors, generateWebSafe216Colors, generatePureNeon90Colors, getLuminanceFromHex, type ColorData } from '../lib/colorUtils';

let popover: HTMLElement | null = null;
let gridContainer: HTMLElement | null = null;
let aestheticControl: HTMLElement | null = null;
let wcagControl: HTMLElement | null = null;
let hexInput: HTMLInputElement | null = null;
let paletteTitle: HTMLElement | null = null;

let currentColors: ColorData[] = [];
let activeColorId: string | null = null;
let currentReferenceBgHex: string | null = null;
let onColorSelect: ((color: string) => void) | null = null;

export function initColorPalette() {
    popover = document.getElementById('custom-palette-popover');
    gridContainer = document.getElementById('palette-grid');
    aestheticControl = document.getElementById('palette-aesthetic-filter');
    wcagControl = document.getElementById('palette-wcag-filter');
    hexInput = document.getElementById('palette-hex-input') as HTMLInputElement;
    paletteTitle = document.getElementById('palette-title');

    if (!popover || !gridContainer || !aestheticControl || !wcagControl || !hexInput) return;

    // Close when clicking outside
    document.addEventListener('mousedown', (e) => {
        if (popover && popover.style.display !== 'none' && !popover.contains(e.target as Node)) {
            // Ignore if clicking on a color picker button
            if ((e.target as HTMLElement).closest('.custom-color-picker-btn')) return;
            closePopover();
        }
    });

    // Segmented control event handlers
    const setupSegmentedControl = (control: HTMLElement, onChange: () => void) => {
        control.addEventListener('click', (e) => {
            if (control.classList.contains('disabled')) return;
            const btn = (e.target as HTMLElement).closest('.segment-btn');
            if (btn) {
                // Update active state
                control.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Update data-value on container
                control.dataset.value = (btn as HTMLElement).dataset.value;
                onChange();
            }
        });
    };

    setupSegmentedControl(aestheticControl, () => {
        updateColorsList();
        renderGrid();
    });

    setupSegmentedControl(wcagControl, () => {
        renderGrid();
    });

    hexInput.addEventListener('change', (e) => {
        const val = (e.target as HTMLInputElement).value;
        if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
            if (activeColorId && onColorSelect) {
                onColorSelect(val);
            }
        }
    });
    
    // Initialize default colors
    updateColorsList();
}

function updateColorsList() {
    if (!aestheticControl) return;
    const val = aestheticControl.dataset.value;
    if (val === '216') {
        currentColors = generateWebSafe216Colors();
    } else if (val === '90') {
        currentColors = generatePureNeon90Colors();
    } else {
        currentColors = generateAll4096Colors();
    }
}

function renderGrid() {
    if (!gridContainer || !wcagControl) return;
    gridContainer.innerHTML = '';
    
    // Disable WCAG filter entirely if referenceBgHex is null (e.g. for background colors)
    const wcagVal = currentReferenceBgHex === null ? 'none' : (wcagControl.dataset.value || 'none');
    
    if (currentReferenceBgHex === null) {
        wcagControl.classList.add('disabled');
        wcagControl.title = "WCAG filtering is not applicable for base backgrounds.";
    } else {
        wcagControl.classList.remove('disabled');
        wcagControl.title = "";
    }

    const requiredRatio = wcagVal === 'aaa' ? 7 : (wcagVal === 'aa' ? 4.5 : 0);
    const bgLuminance = currentReferenceBgHex ? getLuminanceFromHex(currentReferenceBgHex) : 0;

    const fragment = document.createDocumentFragment();
    
    // Sort colors if picking a background
    let colorsToRender = [...currentColors];
    if (currentReferenceBgHex === null) {
        // Dark mode: darker colors first (lower luminance)
        colorsToRender.sort((a, b) => a.luminance - b.luminance);
    }

    colorsToRender.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'palette-swatch-cell';
        swatch.style.background = color.hex;
        swatch.title = color.hex;

        // Dynamic Contrast Calculation against referenceBgHex (only if not null)
        let failsWcag = false;
        let contrast = 0;
        if (currentReferenceBgHex !== null && requiredRatio > 0) {
            const brightest = Math.max(color.luminance, bgLuminance);
            const darkest = Math.min(color.luminance, bgLuminance);
            contrast = (brightest + 0.05) / (darkest + 0.05);
            if (contrast < requiredRatio) {
                failsWcag = true;
            }
        }

        if (failsWcag) {
            swatch.classList.add('wcag-fail');
            swatch.title += ` (Fails WCAG ${wcagVal.toUpperCase()} against ${currentReferenceBgHex}: ${contrast.toFixed(1)}:1)`;
        } else {
            swatch.addEventListener('click', () => {
                if (activeColorId && onColorSelect) {
                    onColorSelect(color.hex);
                    if (hexInput) hexInput.value = color.hex;
                }
            });
        }
        fragment.appendChild(swatch);
    });

    gridContainer.appendChild(fragment);
}

export function openColorPalette(targetButton: HTMLElement, colorId: string, currentColor: string, referenceBgHex: string | null, onChange: (color: string) => void) {
    if (!popover || !hexInput) return;

    activeColorId = colorId;
    currentReferenceBgHex = referenceBgHex;
    onColorSelect = onChange;
    hexInput.value = currentColor || '#000000';
    
    if (paletteTitle) {
        if (currentReferenceBgHex) {
            paletteTitle.innerHTML = `${colorId} <span style="color:#888; font-weight:normal; margin-left: 6px;">(on bg: <span style="color:${currentReferenceBgHex};text-shadow:0 0 2px black;">${currentReferenceBgHex}</span>)</span>`;
        } else {
            paletteTitle.innerHTML = `${colorId} <span style="color:#888; font-weight:normal; margin-left: 6px;">(Base Background)</span>`;
        }
    }

    renderGrid();

    // Position popover
    const rect = targetButton.getBoundingClientRect();
    popover.style.display = 'flex';
    
    // Basic positioning (below button)
    let top = rect.bottom + 5 + window.scrollY;
    let left = rect.left + window.scrollX;

    // Prevent going off-screen
    if (top + 320 > window.innerHeight) {
        top = rect.top - 320 - 5 + window.scrollY; // open upwards
    }
    if (left + 280 > window.innerWidth) {
        left = window.innerWidth - 290;
    }

    popover.style.top = `${top}px`;
    popover.style.left = `${left}px`;
}

export function closePopover() {
    if (popover) {
        popover.style.display = 'none';
        activeColorId = null;
        onColorSelect = null;
    }
}
