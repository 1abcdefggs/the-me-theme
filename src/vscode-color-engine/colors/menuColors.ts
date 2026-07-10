// @ts-nocheck
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as nls from '../nlsStub.ts';

// Import the effects we need
import { registerColor, transparent } from '../colorRegistryStub.ts';

// Import the colors we need
import { contrastBorder, activeContrastBorder, foreground } from './baseColors.ts';
import { selectForeground, selectBackground } from './inputColors.ts';
import { listActiveSelectionBackground, listActiveSelectionForeground } from './listColors.ts';


export const menuBorder = registerColor('menu.border',
	{ dark: null, light: null, hcDark: contrastBorder, hcLight: contrastBorder },
	nls.localize('menuBorder', "Border color of menus."));

export const menuForeground = registerColor('menu.foreground',
	selectForeground,
	nls.localize('menuForeground', "Foreground color of menu items."));

export const menuBackground = registerColor('menu.background',
	selectBackground,
	nls.localize('menuBackground', "Background color of menu items."));

export const menuSelectionForeground = registerColor('menu.selectionForeground',
	listActiveSelectionForeground,
	nls.localize('menuSelectionForeground', "Foreground color of the selected menu item in menus."));

export const menuSelectionBackground = registerColor('menu.selectionBackground',
	listActiveSelectionBackground,
	nls.localize('menuSelectionBackground', "Background color of the selected menu item in menus."));

export const menuSelectionBorder = registerColor('menu.selectionBorder',
	{ dark: null, light: null, hcDark: activeContrastBorder, hcLight: activeContrastBorder },
	nls.localize('menuSelectionBorder', "Border color of the selected menu item in menus."));

export const menuSeparatorBackground = registerColor('menu.separatorBackground',
	{ dark: transparent(foreground, 0.2), light: transparent(foreground, 0.2), hcDark: contrastBorder, hcLight: contrastBorder },
	nls.localize('menuSeparatorBackground', "Color of a separator menu item in menus."));
