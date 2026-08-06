/**
 * src/core/panel-resizer.ts
 * Drag-to-resize sash logic for left/right tool panels
 * Uses DOM but no UI framework dependencies
 */
import { PANEL_LIMITS } from './types';

// ============================================================
// Clamp helper
// ============================================================

export function clampPanelWidth(
  targetWidth: number,
  side: 'left' | 'right',
  containerWidth: number
): number {
  const limit = PANEL_LIMITS[side];
  // Dynamic max: leave at least centerMin + 200px for the other panel
  const dynamicMax = Math.min(
    limit.max,
    containerWidth - PANEL_LIMITS.centerMin - 200
  );
  return Math.max(limit.min, Math.min(targetWidth, dynamicMax));
}

// ============================================================
// Sash drag handler
// ============================================================

function setupSashDrag(
  sashEl: HTMLElement,
  side: 'left' | 'right',
  onResize: (width: number) => void
): void {
  sashEl.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();

    const startX = e.clientX;
    const panelId = side === 'left' ? 'tool-mode-left' : 'tool-mode-right';
    const panelEl = document.getElementById(panelId);
    if (!panelEl) return;

    const startWidth = panelEl.getBoundingClientRect().width;

    document.body.classList.add('is-resizing');
    sashEl.classList.add('is-dragging');

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      // Left panel: drag right = expand; Right panel: drag left = expand
      const rawWidth = side === 'left' ? startWidth + deltaX : startWidth - deltaX;
      const clamped = clampPanelWidth(rawWidth, side, window.innerWidth);
      onResize(clamped);
    };

    const stopResizing = () => {
      document.body.classList.remove('is-resizing');
      sashEl.classList.remove('is-dragging');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
      window.removeEventListener('mouseleave', stopResizing);
      window.removeEventListener('blur', stopResizing);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    window.addEventListener('mouseleave', stopResizing);
    window.addEventListener('blur', stopResizing);
  });
}

// ============================================================
// Init resizers
// ============================================================

export function initPanelResizer(): void {
  const leftPanel = document.getElementById('tool-mode-left');
  const rightPanel = document.getElementById('tool-mode-right');
  const leftSash = document.getElementById('tool-sash-left');
  const rightSash = document.getElementById('tool-sash-right');

  if (!leftPanel || !rightPanel) return;

  // Restore from localStorage
  const savedLeft = parseInt(localStorage.getItem('toolLeftWidth') ?? '280', 10);
  const savedRight = parseInt(localStorage.getItem('toolRightWidth') ?? '320', 10);
  leftPanel.style.width = `${savedLeft}px`;
  rightPanel.style.width = `${savedRight}px`;

  if (leftSash) {
    setupSashDrag(leftSash, 'left', (w) => {
      leftPanel.style.width = `${w}px`;
      localStorage.setItem('toolLeftWidth', String(w));
    });
  }

  if (rightSash) {
    setupSashDrag(rightSash, 'right', (w) => {
      rightPanel.style.width = `${w}px`;
      localStorage.setItem('toolRightWidth', String(w));
    });
  }

  // Re-clamp on browser resize
  window.addEventListener('resize', () => {
    const lw = clampPanelWidth(
      parseInt(leftPanel.style.width) || savedLeft,
      'left',
      window.innerWidth
    );
    const rw = clampPanelWidth(
      parseInt(rightPanel.style.width) || savedRight,
      'right',
      window.innerWidth
    );
    leftPanel.style.width = `${lw}px`;
    rightPanel.style.width = `${rw}px`;
  });
}
