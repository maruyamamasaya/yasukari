import { promises as fs } from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'pages');

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(fullPath);
      }
      if (!entry.name.endsWith('.tsx')) {
        return [];
      }
      if (fullPath.includes(`${path.sep}api${path.sep}`)) {
        return [];
      }
      const base = path.basename(fullPath);
      if (base === '_app.tsx' || base === '_document.tsx') {
        return [];
      }
      return [fullPath];
    })
  );
  return files.flat();
}

function toRoute(relPath) {
  let route = relPath.replace(/\\/g, '/').replace(/\.tsx$/, '');
  if (route === 'index') {
    return '/';
  }
  if (route.endsWith('/index')) {
    route = route.replace(/\/index$/, '');
  }
  return '/' + route;
}

function extractTitle(source) {
  const match = source.match(/<title>([\s\S]*?)<\/title>/);
  if (!match) return null;
  const raw = match[1].trim();
  if (!raw || raw.includes('{') || raw.includes('}')) {
    return null;
  }
  return raw.replace(/\s+/g, ' ');
}

function extractDescription(source) {
  const match = source.match(/<meta[^>]*name\s*=\s*"description"[^>]*content\s*=\s*"([^"]*)"/i);
  if (!match) return null;
  const raw = match[1].trim();
  return raw.replace(/\s+/g, ' ');
}

async function main() {
  const files = await walk(pagesDir);
  files.sort();
  const records = [];
  for (const file of files) {
    const rel = path.relative(pagesDir, file);
    const route = toRoute(rel);
    const source = await fs.readFile(file, 'utf8');
    const title = extractTitle(source);
    const description = extractDescription(source);
    const hasBreadcrumb = source.includes('aria-label="breadcrumb"');
    const hasForm = /<form[^>]*>/i.test(source);
    records.push({ file: rel.replace(/\\/g, '/'), route, title, description, hasBreadcrumb, hasForm });
  }
  await fs.writeFile(
    path.join(process.cwd(), 'docs', 'page-meta.json'),
    JSON.stringify(records, null, 2),
    'utf8'
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
