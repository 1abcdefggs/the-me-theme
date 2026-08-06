# vscode-color-pipeline

Utility suite for generating and validating the VS Code colour database used by **TheMe‑theme**.

## Directory structure
```
/vscode-color-pipeline
├─ generator/   # extracts colour definitions from a VS Code source checkout
│   └─ extractColors.ts
└─ validation/  # validates that every colour is mapped to a UI component
    └─ validate_mapping.cjs
```

## Usage
### 1. Install dependencies (run at the repository root)
```bash
npm install
```
The workspace will install dependencies for the main project and the pipeline package.

### 2. Generate the colour database
```bash
node vscode-color-pipeline/generator/extractColors.ts
```
This scans the VS Code source tree (default `c:\vscode\src\vs`) and writes `src/vscode-colors-db.json`.

### 3. Validate the mapping
```bash
node vscode-color-pipeline/validation/validate_mapping.cjs
```
The script checks that every colour defined in `vscode-colors-db.json` is referenced in the UI component tree (`src/theme-engine/mapping/grouped_by_component.json`).

### 4. One‑step pipeline
```bash
npm run pipeline   # defined in the workspace package.json
```
Runs the generator followed by the validation.

## Scripts (workspace package)
```json
{
  "name": "vscode-color-pipeline",
  "version": "1.0.0",
  "main": "generator/extractColors.ts",
  "scripts": {
    "generate": "ts-node generator/extractColors.ts",
    "validate": "node validation/validate_mapping.cjs",
    "pipeline": "npm run generate && npm run validate"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "ts-node": "^10.9.0"
  }
}
```

---
*This README is intended for developers working on TheMe‑theme and for future independent publishing of the pipeline package.*
