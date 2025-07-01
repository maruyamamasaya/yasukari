import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { useRouter } from 'next/router';
import CalendarWidget from '../../components/CalendarWidget';
import DirectoryTree, { DirNode } from '../../components/DirectoryTree';
import { getDirTree } from '../../lib/getDirTree';

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

  const tree: DirNode[] = getDirTree(process.cwd(), 2);

  return { props: { posts, tree } };
}

type Props = {
  posts: PostMeta[];
  tree: DirNode[];
};

export default function ManualIndex({ posts, tree }: Props) {
  const router = useRouter();
  const page = parseInt((router.query.page as string) || '1');
  const perPage = 10;
  const total = Math.ceil(posts.length / perPage);
  const start = (page - 1) * perPage;
  const pagePosts = posts.slice(start, start + perPage);

  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-row flex-wrap gap-6">
      <div className="w-[70%]">
        <h1 className="text-2xl font-bold mb-6">サイト更新ブログ（システム開発専用）</h1>
        <div className="space-y-4">
          {pagePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/manual_for_system/${post.slug}`}
              className="block p-4 bg-white rounded shadow-md hover:bg-gray-50 transition"
            >
              <h2 className="text-lg font-semibold line-clamp-2">{post.title}</h2>
              {post.date && <p className="text-sm text-gray-500 mb-1">{post.date}</p>}
              {post.excerpt && <p className="text-gray-700 text-sm">{post.excerpt}</p>}
            </Link>
          ))}
        </div>
        {total > 1 && (
          <nav className="mt-4 flex gap-2 justify-center text-sm">
            {Array.from({ length: total }).map((_, i) => (
              <Link
                key={i}
                href={`/manual_for_system?page=${i + 1}`}
                className={
                  i + 1 === page
                    ? 'font-bold underline'
                    : 'text-teal-700 hover:underline'
                }
              >
                {i + 1}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <div className="w-[30%] space-y-4">
        <CalendarWidget posts={posts} />
        <DirectoryTree tree={tree} />
      </div>
    </div>
  );
}
