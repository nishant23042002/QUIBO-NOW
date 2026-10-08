// Removes build output and caches from the repo and from every app and package.
// It never touches node_modules, .env or the git hooks, so the next command runs without a reinstall.
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const GENERATED = ['.turbo', '.expo', 'dist', 'coverage'];

const root = fileURLToPath(new URL('..', import.meta.url));
const workspaces = ['apps', 'packages'].flatMap((group) =>
  readdirSync(join(root, group), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(root, group, entry.name)),
);

let removed = 0;
for (const folder of [root, ...workspaces]) {
  for (const name of GENERATED) {
    const target = join(folder, name);
    if (!existsSync(target)) continue;
    try {
      rmSync(target, { recursive: true, force: true });
    } catch (error) {
      console.error(`Could not remove ${relative(root, target)}: ${error.message}`);
      console.error('Is a dev server still running? Stop it and try again.');
      process.exit(1);
    }
    process.stdout.write(`removed ${relative(root, target)}\n`);
    removed += 1;
  }
}

const folders = removed === 1 ? 'folder' : 'folders';
process.stdout.write(removed === 0 ? 'Nothing to clean.\n' : `Cleaned ${removed} ${folders}.\n`);
