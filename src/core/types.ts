/**
 * src/core/types.ts
 * Shared type definitions for TheMeTheme
 * NO DOM dependencies — pure data types only
 */

// ============================================================
// UI Component Tree
// ============================================================

/** A node in the VS Code UI component tree */
export interface UIComponentNode {
  /** Unique ID (e.g. 'activityBar', 'activityBar.badge') */
  id: string;
  /** Display label in the left panel */
  label: string;
  /** Associated VS Code color keys */
  colorKeys: string[];
  /** Optional child nodes */
  children?: UIComponentNode[];
}

// ============================================================
// Highlight / Selection State
// ============================================================

/** Shared hover/selection state for bidirectional highlight */
export interface HighlightState {
  hoveredComponentId: string | null;
  selectedComponentId: string | null;
  /** Inspect mode: clicking ObjectBody selects components */
  isInspectMode: boolean;
}

// ============================================================
// Layout State
// ============================================================

export type WorkflowType = 'setup' | 'edit' | 'export';

export interface LayoutState {
  activeWorkflow: WorkflowType;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  isFullPreview: boolean;
}

// ============================================================
// Syntax Highlighting
// ============================================================

export type TextMateScope = string | string[];

export interface TokenColorRule {
  name?: string;
  scope: TextMateScope;
  settings: {
    foreground?: string;
    /** 'italic', 'bold', 'underline', or space-joined combinations */
    fontStyle?: string;
  };
}

export interface SyntaxGroupState {
  id: string;
  label: string;
  scopes: string[];
  foreground: string;
  fontStyle: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
}

// ============================================================
// Theme Data
// ============================================================

export interface VSCodeThemeData {
  name: string;
  type: 'dark' | 'light' | 'hc';
  colors: Record<string, string>;
  tokenColors: TokenColorRule[];
}

// ============================================================
// Export
// ============================================================

export type ExportFormat = 'customizations' | 'themeFile' | 'rawJson';

export interface ThemeMetadata {
  name: string;
  type: 'dark' | 'light' | 'hc';
}

// ============================================================
// Panel Resize
// ============================================================

export interface PanelSizeState {
  leftWidth: number;
  rightWidth: number;
}

export const PANEL_LIMITS = {
  left:  { min: 200, max: 480 },
  right: { min: 240, max: 520 },
  centerMin: 400,
} as const;
