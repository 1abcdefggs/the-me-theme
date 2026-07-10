// Color Generation and WCAG utility functions

export interface ColorData {
    hex: string;
    r: number;
    g: number;
    b: number;
    h: number; // Hue 0-360
    s: number; // Saturation 0-1
    l: number; // Lightness 0-1
    luminance: number;
    contrastVsBlack: number;
}

// Convert RGB 0-255 to HEX
function rgbToHex(r: number, g: number, b: number): string {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert RGB 0-255 to HSL (h: 0-360, s: 0-1, l: 0-1)
function rgbToHsl(r: number, g: number, b: number): { h: number, s: number, l: number } {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: Math.round(h * 360), s, l };
}

// WCAG relative luminance
export function getLuminance(r: number, g: number, b: number): number {
    const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Helper to get luminance from Hex
export function getLuminanceFromHex(hex: string): number {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { r = parseInt(hex[1]+hex[1],16); g = parseInt(hex[2]+hex[2],16); b = parseInt(hex[3]+hex[3],16); }
    else if (hex.length >= 7) { r = parseInt(hex.substring(1,3),16); g = parseInt(hex.substring(3,5),16); b = parseInt(hex.substring(5,7),16); }
    return getLuminance(r, g, b);
}

// Contrast ratio vs pure black (luminance 0)
function getContrastVsBlack(luminance: number): number {
    return (luminance + 0.05) / 0.05;
}

function createColorData(r: number, g: number, b: number): ColorData {
    const hsl = rgbToHsl(r, g, b);
    const lum = getLuminance(r, g, b);
    return {
        hex: rgbToHex(r, g, b),
        r, g, b,
        h: hsl.h, s: hsl.s, l: hsl.l,
        luminance: lum,
        contrastVsBlack: getContrastVsBlack(lum)
    };
}

// Sort colors by Hue (primary), then Lightness, then Saturation
export function sortColors(colors: ColorData[]): ColorData[] {
    return colors.sort((a, b) => {
        // Group grayscales at the very end
        const aIsGray = a.s === 0;
        const bIsGray = b.s === 0;
        if (aIsGray && !bIsGray) return 1;
        if (!aIsGray && bIsGray) return -1;
        
        if (a.h !== b.h) return a.h - b.h;
        if (a.s !== b.s) return b.s - a.s; // Higher saturation first
        return b.l - a.l; // Higher lightness first
    });
}

export function generateAll4096Colors(): ColorData[] {
    const colors: ColorData[] = [];
    for (let r = 0; r <= 15; r++) {
        for (let g = 0; g <= 15; g++) {
            for (let b = 0; b <= 15; b++) {
                colors.push(createColorData(r * 17, g * 17, b * 17));
            }
        }
    }
    return sortColors(colors);
}

export function generateWebSafe216Colors(): ColorData[] {
    const colors: ColorData[] = [];
    const levels = [0, 51, 102, 153, 204, 255]; // 00, 33, 66, 99, CC, FF
    for (const r of levels) {
        for (const g of levels) {
            for (const b of levels) {
                colors.push(createColorData(r, g, b));
            }
        }
    }
    return sortColors(colors);
}

export function generatePureNeon90Colors(): ColorData[] {
    const colors: ColorData[] = [];
    for (let r = 0; r <= 15; r++) {
        for (let g = 0; g <= 15; g++) {
            for (let b = 0; b <= 15; b++) {
                if (Math.max(r, g, b) === 15 && Math.min(r, g, b) === 0) {
                    colors.push(createColorData(r * 17, g * 17, b * 17));
                }
            }
        }
    }
    return sortColors(colors);
}
