import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import CalendarWidget, { CalendarPost } from '../../components/CalendarWidget';
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

type Props = { html: string; tree: DirNode[]; posts: CalendarPost[] };

export default function ManualPost({ html, tree, posts }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-col md:flex-row gap-6">
      <article
        className="prose w-full md:w-[70%]"
        style={{ marginLeft: "1rem" }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="w-full md:w-[30%] space-y-4">
        <CalendarWidget posts={posts} />
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
  const dir = path.join(process.cwd(), 'manual_for_system');
  const filePath = path.join(dir, `${slug}.md`);
  const md = fs.readFileSync(filePath, 'utf8');
  const html = renderMarkdown(md);
  const tree: DirNode[] = getDirTree(process.cwd(), 2);

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts: CalendarPost[] = files.map((file) => {
    const s = file.replace(/\.md$/, '');
    const lines = fs.readFileSync(path.join(dir, file), 'utf8').split(/\r?\n/);
    const heading = lines.find((l) => l.startsWith('# '));
    const title = heading ? heading.replace(/^#\s*/, '') : s;
    const dateMatch = s.match(/^\d{4}-\d{2}-\d{2}/);
    const date = dateMatch ? dateMatch[0] : '';
    return { slug: s, title, date };
  });

  return { props: { html, tree, posts } };
};
