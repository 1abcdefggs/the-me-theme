/**
 * src/core/syntax-engine.ts
 * TextMate scope parsing and syntax group management
 * NO DOM dependencies
 */
import type { TokenColorRule, SyntaxGroupState } from './types';

// ============================================================
// Syntax Group Definitions (UI category → TextMate scopes)
// ============================================================

export const SYNTAX_GROUP_DEFS: Array<{ id: string; label: string; scopes: string[] }> = [
  {
    id: 'keywords',
    label: 'Keywords',
    scopes: ['keyword', 'keyword.control', 'storage.type', 'storage.modifier'],
  },
  {
    id: 'functions',
    label: 'Functions',
    scopes: ['entity.name.function', 'support.function', 'entity.name.method'],
  },
  {
    id: 'variables',
    label: 'Variables',
    scopes: ['variable', 'variable.other', 'variable.parameter', 'variable.language'],
  },
  {
    id: 'strings',
    label: 'Strings',
    scopes: ['string', 'string.quoted', 'string.template'],
  },
  {
    id: 'numbers',
    label: 'Numbers & Constants',
    scopes: ['constant.numeric', 'constant.language', 'constant.character'],
  },
  {
    id: 'types',
    label: 'Types & Classes',
    scopes: ['entity.name.type', 'entity.name.class', 'support.type'],
  },
  {
    id: 'comments',
    label: 'Comments',
    scopes: ['comment', 'comment.line', 'comment.block'],
  },
];

// ============================================================
// Scope matching with dot-fallback (same as VS Code engine)
// ============================================================

/**
 * Returns true if ruleScope matches groupScope using prefix/dot fallback.
 * e.g. 'keyword.control.conditional.js' matches 'keyword'
 */
function scopeMatches(ruleScope: string, groupScope: string): boolean {
  return ruleScope === groupScope || ruleScope.startsWith(groupScope + '.');
}

// ============================================================
// Parse tokenColors → SyntaxGroupState
// ============================================================

/**
 * Extract the current color/fontStyle for one syntax group
 * from a tokenColors array.
 */
export function extractSyntaxGroupState(
  tokenColors: TokenColorRule[],
  groupDef: { id: string; label: string; scopes: string[] }
): SyntaxGroupState {
  let matchedColor = '#cccccc';
  let matchedFontStyle = '';

  for (const rule of tokenColors) {
    const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];

    const isMatch = ruleScopes.some((rs) =>
      groupDef.scopes.some((gs) => scopeMatches(rs, gs))
    );

    if (isMatch && rule.settings.foreground) {
      matchedColor = rule.settings.foreground;
      matchedFontStyle = rule.settings.fontStyle ?? '';
      break;
    }
  }

  return {
    id: groupDef.id,
    label: groupDef.label,
    scopes: groupDef.scopes,
    foreground: matchedColor,
    fontStyle: {
      bold: matchedFontStyle.includes('bold'),
      italic: matchedFontStyle.includes('italic'),
      underline: matchedFontStyle.includes('underline'),
    },
  };
}

/**
 * Extract all syntax group states from a tokenColors array.
 */
export function extractAllSyntaxGroups(tokenColors: TokenColorRule[]): SyntaxGroupState[] {
  return SYNTAX_GROUP_DEFS.map((def) => extractSyntaxGroupState(tokenColors, def));
}

// ============================================================
// Write UI state back to tokenColors
// ============================================================

/**
 * Merge a SyntaxGroupState update back into a tokenColors array.
 * Updates existing matching rule or appends a new one.
 * Returns a new array (immutable).
 */
export function updateTokenColorRule(
  tokenColors: TokenColorRule[],
  targetGroup: SyntaxGroupState
): TokenColorRule[] {
  const newFontStyle = [
    targetGroup.fontStyle.bold ? 'bold' : '',
    targetGroup.fontStyle.italic ? 'italic' : '',
    targetGroup.fontStyle.underline ? 'underline' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const updatedTokenColors = [...tokenColors];
  const primaryScope = targetGroup.scopes[0];

  const existingIndex = updatedTokenColors.findIndex((rule) => {
    const scopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];
    return scopes.includes(primaryScope);
  });

  if (existingIndex !== -1) {
    updatedTokenColors[existingIndex] = {
      ...updatedTokenColors[existingIndex],
      settings: {
        ...updatedTokenColors[existingIndex].settings,
        foreground: targetGroup.foreground,
        ...(newFontStyle ? { fontStyle: newFontStyle } : {}),
      },
    };
  } else {
    updatedTokenColors.push({
      name: targetGroup.label,
      scope: targetGroup.scopes,
      settings: {
        foreground: targetGroup.foreground,
        ...(newFontStyle ? { fontStyle: newFontStyle } : {}),
      },
    });
  }

  return updatedTokenColors;
}
