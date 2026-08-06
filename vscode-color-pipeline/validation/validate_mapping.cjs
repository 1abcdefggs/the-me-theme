const fs = require('fs');
const path = require('path');

// 1. Load VS Code color master database
const colorDbPath = path.join(__dirname, '../../src/assets/vscode-colors-db.json');
const colorDb = JSON.parse(fs.readFileSync(colorDbPath, 'utf8'));

// 2. Load component mapping definitions
const componentTreePath = path.join(__dirname, '../../src/theme-engine/mapping/grouped_by_component.json');
const componentTree = JSON.parse(fs.readFileSync(componentTreePath, 'utf8'));

const allColorIds = new Set(colorDb.map(c => c.id));
const mappedColorIds = new Set();

// Recursively traverse tree to extract mapped color IDs
function extractMappedIds(items) {
    for (const item of items) {
        if (item.colorIds) {
            item.colorIds.forEach(id => mappedColorIds.add(id));
        }
        if (item.children) {
            extractMappedIds(item.children);
        }
    }
}

componentTree.forEach(category => extractMappedIds(category.children || []));

// Identify unmapped colors
const unmappedIds = [...allColorIds].filter(id => !mappedColorIds.has(id));

console.log('====================================================');
console.log('📊 TheMeTheme Component Completeness Validation');
console.log('====================================================');
console.log(`🔹 Total VS Code Colors in DB : ${allColorIds.size}`);
console.log(`🔗 Mapped Colors in UI Tree  : ${mappedColorIds.size}`);
console.log(`⚠️ Unmapped Colors (Orphans)  : ${unmappedIds.length}`);

if (unmappedIds.length > 0) {
    console.log('\n--- Sample Unmapped Colors (First 10) ---');
    unmappedIds.slice(0, 10).forEach(id => console.log(` - ${id}`));
    console.log(`...and ${unmappedIds.length - 10} more unmapped colors.`);
} else {
    console.log('\n✅ Component Completeness Verified! All colors are mapped to UI components.');
}
