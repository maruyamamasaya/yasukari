import fs from 'fs';
import path from 'path';

export interface DirNode {
  name: string;
  path: string;
  isDir: boolean;
  children?: DirNode[];
}

function listEntries(dir: string) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules' && e.name !== '.git');
}

export function getDirTree(dir: string, depth = 1, baseDir: string = dir): DirNode[] {
  const entries = listEntries(dir);
  return entries.map((e) => {
    const full = path.join(dir, e.name);
    const rel = path.relative(baseDir, full);
    if (e.isDirectory()) {
      const children = depth > 1 ? getDirTree(full, depth - 1, baseDir) : [];
      return { name: e.name, path: rel, isDir: true, children } as DirNode;
    }
    return { name: e.name, path: rel, isDir: false } as DirNode;
  });
}

export function getAllFiles(dir: string, depth = 1, baseDir: string = dir): string[] {
  const entries = listEntries(dir);
  let files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (depth > 0) files = files.concat(getAllFiles(full, depth - 1, baseDir));
    } else {
      files.push(path.relative(baseDir, full));
    }
  }
  return files;
}
