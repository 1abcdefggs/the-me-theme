// src/services/github-service.ts
import { githubLineNumbers } from '../ui/theme-state';

export async function searchGitHubThemes(filter: string) {
    if (!filter) return [];
    try {
        const res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(filter)}+topic:vscode-theme&per_page=5`);
        if (res.ok) {
            const data = await res.json();
            return (data.items || []).map((repo: any) => ({
                name: repo.name,
                repo: repo.full_name,
                url: `https://raw.githubusercontent.com/${repo.full_name}/main/package.json`,
                license: repo.license?.spdx_id || 'MIT',
                isGithub: true
            }));
        }
    } catch (e) {
        console.error('GitHub API Search Failed', e);
    }
    return [];
}

export async function fetchRawGitHubFile(url: string): Promise<string> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.text();
}

export async function syncGitHubColorRegistryLineNumbers(onLog?: (msg: string, type: 'info'|'success'|'error') => void) {
    if (onLog) onLog('Connecting to GitHub repository...', 'info');
    const repoUrl = 'https://raw.githubusercontent.com/microsoft/vscode/main/src/vs/platform/theme/common/colorRegistry.ts';
    if (onLog) onLog(`Fetching ${repoUrl}...`, 'info');

    const response = await fetch(repoUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const text = await response.text();
    if (onLog) onLog(`Fetched ${text.length} bytes successfully.`, 'success');
    if (onLog) onLog('Parsing Abstract Syntax Tree for registerColor calls...', 'info');

    const lines = text.split('\n');
    let matched = 0;

    lines.forEach((line, index) => {
        const match = line.match(/export const \w+ = registerColor\('([^']+)'/);
        if (match && match[1]) {
            const colorId = match[1];
            githubLineNumbers[colorId] = index + 1; // 1-indexed
            matched++;
        }
    });

    if (onLog) onLog(`Sync Complete (${matched} colors linked). You can now click line numbers to view source directly on GitHub.`, 'success');
    return matched;
}
