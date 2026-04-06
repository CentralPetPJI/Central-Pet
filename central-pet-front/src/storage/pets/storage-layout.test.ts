import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { userStorageKey } from '@/storage/auth';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const currentTestFile = fileURLToPath(import.meta.url);
const scanRoots = [path.join(repoRoot, 'central-pet-front/src'), path.join(repoRoot, 'tests/e2e')];

const ignoredDirectories = new Set(['node_modules', 'dist', '.git']);
const forbiddenPatterns = [
  'central-pet:mock-user-id',
  'src/lib/auth/user-storage',
  '@/Mocks/PetsStorage',
  '@/Mocks/PetRegisterFormMock',
  '@/Mocks/PetPersonalityOptions',
];

function collectFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry)) {
      continue;
    }

    const absolutePath = path.join(directory, entry);
    const stats = statSync(absolutePath);

    if (stats.isDirectory()) {
      files.push(...collectFiles(absolutePath));
      continue;
    }

    if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      files.push(absolutePath);
    }
  }

  return files;
}

describe('storage layout audit', () => {
  it('does not reference the deprecated storage layout or mock user id', () => {
    const files = scanRoots.flatMap((root) => collectFiles(root));
    const matches = files
      .filter((filePath) => filePath !== currentTestFile)
      .flatMap((filePath) => {
        const content = readFileSync(filePath, 'utf8');

        return forbiddenPatterns
          .filter((pattern) => content.includes(pattern))
          .map((pattern) => ({
            filePath,
            pattern,
          }));
      });

    expect(matches).toEqual([]);
  });

  it('seeds playwright from the canonical auth storage key', () => {
    const e2eSpec = readFileSync(
      path.join(repoRoot, 'tests/e2e/pet-ownership-workflow.spec.ts'),
      'utf8',
    );

    expect(userStorageKey).toBe('central-pet:user-id');
    expect(e2eSpec).not.toContain('central-pet:mock-user-id');
  });
});
