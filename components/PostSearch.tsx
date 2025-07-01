import React, { useState } from 'react';
import Link from 'next/link';

type SearchPost = {
  slug: string;
  title: string;
  excerpt?: string;
};

export default function PostSearch({ posts }: { posts: SearchPost[] }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchPost[] | null>(null);

  const handleSearch = () => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults(null);
      return;
    }
    setResults(
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt && p.excerpt.toLowerCase().includes(q))
      )
    );
  };

  return (
    <div className="border rounded p-2 bg-white shadow text-sm animate-fade">
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="キーワード検索"
          className="border rounded px-2 py-1 flex-grow"
        />
        <button
          onClick={handleSearch}
          className="bg-red-600 text-white px-2 py-1 rounded"
        >
          検索
        </button>
      </div>
      {results && (
        <div>
          {results.length > 0 ? (
            <ul className="ml-2 list-disc">
              {results.map((p) => (
                <li key={p.slug} className="mt-1">
                  <Link
                    href={`/manual_for_system/${p.slug}`}
                    className="hover:underline text-red-700"
                  >
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">該当なし</p>
          )}
        </div>
      )}
    </div>
  );
}
