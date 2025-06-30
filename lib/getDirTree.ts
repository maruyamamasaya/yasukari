import fs from 'fs';
import path from 'path';

export interface DirNode {
  name: string;
  children?: DirNode[];
}

export function getDirTree(dir: string, depth = 1): DirNode[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory())
    .map((e) => {
      const children = depth > 1 ? getDirTree(path.join(dir, e.name), depth - 1) : [];
      return children.length > 0 ? { name: e.name, children } : { name: e.name };
    });
}
