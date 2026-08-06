/**
 * src/core/highlight-controller.ts
 * Bidirectional highlight: ObjectBody ↔ Left panel tree
 */
import type { UIComponentNode } from './types';

// ============================================================
// ObjectBody → Left panel (click on preview → select tree item)
// ============================================================

/**
 * Bind click/hover events on the ObjectBody.
 * Scoped to elements with [data-component-id].
 * @param objectBodyEl - the #vscode-mock-container element
 * @param onSelectComponent - callback with the selected componentId
 * @param onHoverComponent  - callback when hovering (null = mouse left)
 */
export function bindObjectBodyEvents(
  objectBodyEl: HTMLElement,
  onSelectComponent: (id: string) => void,
  onHoverComponent: (id: string | null) => void
): void {
  // Click: select component
  objectBodyEl.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const componentEl = target.closest('[data-component-id]') as HTMLElement | null;
    if (!componentEl) return;

    e.preventDefault();
    e.stopPropagation();

    const id = componentEl.getAttribute('data-component-id');
    if (id) onSelectComponent(id);
  });

  // Mouseenter/leave via event delegation
  objectBodyEl.addEventListener('mouseover', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const componentEl = target.closest('[data-component-id]') as HTMLElement | null;
    if (componentEl) {
      onHoverComponent(componentEl.getAttribute('data-component-id'));
    }
  });

  objectBodyEl.addEventListener('mouseleave', () => {
    onHoverComponent(null);
  });
}

// ============================================================
// Apply visual states to ObjectBody elements
// ============================================================

export function applyHoverHighlight(
  objectBodyEl: HTMLElement,
  hoveredId: string | null
): void {
  // Clear all hovered states
  objectBodyEl.querySelectorAll<HTMLElement>('.is-hovered').forEach((el) => {
    el.classList.remove('is-hovered');
  });

  if (hoveredId) {
    const el = objectBodyEl.querySelector<HTMLElement>(
      `[data-component-id="${hoveredId}"]`
    );
    el?.classList.add('is-hovered');
  }
}

export function applySelectionHighlight(
  objectBodyEl: HTMLElement,
  selectedId: string | null
): void {
  // Clear all selected states
  objectBodyEl.querySelectorAll<HTMLElement>('.is-selected').forEach((el) => {
    el.classList.remove('is-selected');
  });

  if (selectedId) {
    const el = objectBodyEl.querySelector<HTMLElement>(
      `[data-component-id="${selectedId}"]`
    );
    el?.classList.add('is-selected');
  }
}

// ============================================================
// Left panel → ObjectBody (tree item → reveal + scroll in tree)
// ============================================================

/**
 * Find ancestor IDs in the UI component tree.
 */
export function getParentPath(
  tree: UIComponentNode[],
  targetId: string,
  path: string[] = []
): string[] {
  for (const node of tree) {
    const currentPath = [...path, node.id];
    if (node.id === targetId) return currentPath;
    if (node.children) {
      const found = getParentPath(node.children, targetId, currentPath);
      if (found.length) return found;
    }
  }
  return [];
}

/**
 * Expand ancestor accordion items and smooth-scroll to the tree item.
 * @param componentId - the target tree node id
 * @param tree - the full UI component tree
 */
export function revealAndScrollToNode(
  componentId: string,
  tree: UIComponentNode[]
): void {
  const path = getParentPath(tree, componentId);

  // Expand parent accordion items
  path.slice(0, -1).forEach((parentId) => {
    const accordion = document.querySelector<HTMLElement>(
      `[data-tree-id="${parentId}"]`
    );
    accordion?.classList.add('is-open');
  });

  // Scroll to the target item after DOM updates
  requestAnimationFrame(() => {
    const treeItemEl = document.querySelector<HTMLElement>(
      `[data-tree-id="${componentId}"]`
    );
    if (treeItemEl) {
      treeItemEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      // Brief flash highlight
      treeItemEl.classList.add('flash-highlight');
      setTimeout(() => treeItemEl.classList.remove('flash-highlight'), 600);
    }
  });
}
