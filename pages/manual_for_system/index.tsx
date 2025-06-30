import fs from 'fs';
import path from 'path';
import Link from 'next/link';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
};

export async function getStaticProps() {
  const dir = path.join(process.cwd(), 'manual_for_system');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const md = fs.readFileSync(path.join(dir, file), 'utf8');
    const lines = md.split(/\r?\n/);
    const heading = lines.find((l) => l.startsWith('# '));
    const title = heading ? heading.replace(/^#\s*/, '') : slug;
    const dateMatch = slug.match(/^\d{4}-\d{2}-\d{2}/);
    const date = dateMatch ? dateMatch[0] : '';
    const excerptLine = lines.find((l) => l.trim() && !l.startsWith('#')) || '';
    const excerpt = excerptLine.replace(/\*/g, '').slice(0, 80);
    return { slug, title, date, excerpt };
  });

  posts.sort((a, b) => b.date.localeCompare(a.date));

  return { props: { posts } };
}

type Props = {
  posts: PostMeta[];
};

export default function ManualIndex({ posts }: Props) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">サイト更新ブログ</h1>
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/manual_for_system/${post.slug}`}
            className="block p-4 bg-white rounded shadow-md hover:bg-gray-50 transition"
          >
            <h2 className="text-lg font-semibold">{post.title}</h2>
            {post.date && <p className="text-sm text-gray-500 mb-1">{post.date}</p>}
            {post.excerpt && <p className="text-gray-700 text-sm">{post.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  );
}
