import fs from 'fs';
import path from 'path';
import Link from 'next/link';

export async function getStaticProps() {
  const dir = path.join(process.cwd(), 'manual_for_system');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  const posts = files.map((file) => ({
    slug: file.replace(/\.md$/, ''),
    title: file.replace(/\.md$/, ''),
  }));
  return { props: { posts } };
}

type Props = {
  posts: { slug: string; title: string }[];
};

export default function ManualIndex({ posts }: Props) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">サイト更新ブログ</h1>
      <ul className="list-disc pl-5 space-y-1">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/manual_for_system/${post.slug}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
