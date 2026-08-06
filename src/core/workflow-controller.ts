/**
 * src/core/workflow-controller.ts
 * Header workflow tab ↔ left panel content switching
 * + Panel collapse (accordion) control
 */
import type { WorkflowType, LayoutState } from './types';

// ============================================================
// Workflow Mode
// ============================================================

/**
 * Switch the active workflow:
 * 1. Highlight the correct header tab
 * 2. Show/hide left panel workflow-group sections
 * 3. Persist to localStorage
 */
export function setWorkflowMode(workflow: WorkflowType): void {
  // 1. Header tabs
  document.querySelectorAll<HTMLElement>('[data-workflow]').forEach((tab) => {
    const isActive = tab.dataset.workflow === workflow;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  // 2. Left panel groups
  document.querySelectorAll<HTMLElement>('[data-workflow-group]').forEach((group) => {
    const isActive = group.dataset.workflowGroup === workflow;
    group.classList.toggle('active', isActive);
  });

  // 3. Persist
  localStorage.setItem('activeWorkflow', workflow);
}

/**
 * Restore the workflow from localStorage on init.
 * Defaults to 'edit'.
 */
export function restoreWorkflow(): WorkflowType {
  const firstVisitDone = localStorage.getItem('tmt.firstVisitDone');
  if (!firstVisitDone) {
    localStorage.setItem('tmt.firstVisitDone', 'true');
    localStorage.setItem('activeWorkflow', 'edit');
    setWorkflowMode('edit');
    return 'edit';
  }

  const saved = localStorage.getItem('activeWorkflow') as WorkflowType | null;
  const workflow: WorkflowType = saved ?? 'edit';
  setWorkflowMode(workflow);
  return workflow;
}

// ============================================================
// Layout / Panel Collapse
// ============================================================

const layoutState: LayoutState = {
  activeWorkflow: 'edit',
  leftCollapsed: localStorage.getItem('leftCollapsed') === 'true',
  rightCollapsed: localStorage.getItem('rightCollapsed') === 'true',
  isFullPreview: localStorage.getItem('isFullPreview') === 'true',
};

/**
 * Apply the current layoutState to the DOM and persist.
 */
export function updateLayoutUI(): void {
  const leftPanel  = document.getElementById('tool-mode-left');
  const rightPanel = document.getElementById('tool-mode-right');
  const leftSash   = document.getElementById('tool-sash-left');
  const rightSash  = document.getElementById('tool-sash-right');
  const toggleBtn  = document.getElementById('toggle-layout-btn');

  const isLeftHide  = layoutState.isFullPreview || layoutState.leftCollapsed;
  const isRightHide = layoutState.isFullPreview || layoutState.rightCollapsed;

  // Left panel — collapse to 48px icon strip
  leftPanel?.classList.toggle('panel-collapsed-left', isLeftHide);

  // Sash: hide when panel is collapsed
  if (leftSash)  leftSash.style.display  = isLeftHide  ? 'none' : '';
  if (rightSash) rightSash.style.display = isRightHide ? 'none' : '';

  // Right panel — collapse to 0
  rightPanel?.classList.toggle('panel-collapsed-right', isRightHide);

  // Toggle UI Mode button visual state
  toggleBtn?.classList.toggle('is-active', layoutState.isFullPreview);

  // Persist
  localStorage.setItem('leftCollapsed',  String(layoutState.leftCollapsed));
  localStorage.setItem('rightCollapsed', String(layoutState.rightCollapsed));
  localStorage.setItem('isFullPreview',  String(layoutState.isFullPreview));
}

/** Bind all panel open/close button events */
export function initLayoutControls(): void {
  // Restore previous collapse state
  updateLayoutUI();

  // Individual collapse buttons
  document.getElementById('collapse-left-btn')?.addEventListener('click', () => {
    layoutState.leftCollapsed = !layoutState.leftCollapsed;
    updateLayoutUI();
  });

  document.getElementById('collapse-right-btn')?.addEventListener('click', () => {
    layoutState.rightCollapsed = !layoutState.rightCollapsed;
    updateLayoutUI();
  });

  // Toggle UI Mode (full preview)
  document.getElementById('toggle-layout-btn')?.addEventListener('click', () => {
    layoutState.isFullPreview = !layoutState.isFullPreview;
    updateLayoutUI();
  });

  // Workflow tab clicks
  document.querySelectorAll<HTMLElement>('[data-workflow]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const wf = tab.dataset.workflow as WorkflowType;
      if (wf) {
        layoutState.activeWorkflow = wf;
        setWorkflowMode(wf);
      }
    });
  });
}
