import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import CalendarWidget from '../../components/CalendarWidget';
import DirectoryTree, { DirNode } from '../../components/DirectoryTree';
import { getDirTree } from '../../lib/getDirTree';

function renderMarkdown(md: string): string {
  const lines = md.split(/\r?\n/);
  return lines
    .map((line) => {
      if (line.startsWith('### ')) {
        return `<h3>${line.slice(4)}</h3>`;
      } else if (line.startsWith('## ')) {
        return `<h2>${line.slice(3)}</h2>`;
      } else if (line.startsWith('# ')) {
        return `<h1>${line.slice(2)}</h1>`;
      } else if (line.trim() === '') {
        return '';
      } else {
        return `<p>${line}</p>`;
      }
    })
    .join('\n');
}

type Props = { html: string; tree: DirNode[] };

export default function ManualPost({ html, tree }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <article
        className="prose flex-1"
        style={{ marginLeft: "1rem" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="w-64 space-y-4">
        <CalendarWidget />
        <DirectoryTree tree={tree} />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const dir = path.join(process.cwd(), 'manual_for_system');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const paths = files.map((file) => ({ params: { slug: file.replace(/\.md$/, '') } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params!.slug as string;
  const filePath = path.join(process.cwd(), 'manual_for_system', `${slug}.md`);
  const md = fs.readFileSync(filePath, 'utf8');
  const html = renderMarkdown(md);
  const tree: DirNode[] = getDirTree(process.cwd(), 2);
  return { props: { html, tree } };
};
