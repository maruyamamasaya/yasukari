import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';

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

type Props = { html: string };

export default function ManualPost({ html }: Props) {
  return (
    <div className="prose mx-auto" dangerouslySetInnerHTML={{ __html: html }} />
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
  return { props: { html } };
};
