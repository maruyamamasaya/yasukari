import React, { useState } from 'react';
import Link from 'next/link';

const DESCRIPTIONS: Record<string, string> = {
  'README.md': 'プロジェクト概要',
  components: '再利用コンポーネント',
  data: 'サンプルデータ',
  'deploy.sh': 'デプロイスクリプト',
  lib: 'ユーティリティ',
  manual_for_system: '運用マニュアル',
  'next-env.d.ts': 'Next.js型定義',
  'next.config.js': 'Next.js設定',
  'package-lock.json': '依存固定',
  'package.json': 'npm設定',
  pages: 'ページ群',
  styles: 'スタイル',
  'tsconfig.json': 'TypeScript設定',
};

function getDesc(name: string) {
  return DESCRIPTIONS[name] ?? '';
}

export type DirNode = {
  name: string;
  path: string;
  isDir: boolean;
  children?: DirNode[];
};

function Node({ node }: { node: DirNode }) {
  const [open, setOpen] = useState(false);

  if (node.isDir) {
    return (
      <li className="mt-1">
        <button
          onClick={() => setOpen(!open)}
          className="text-left hover:underline flex items-center gap-1"
          title={getDesc(node.name)}
        >
          <span>{open ? '▼' : '▶'}</span>
          {node.name}
        </button>
        {open && node.children && (
          <ul className="ml-4 list-disc">
            {node.children.map((c) => (
              <Node key={c.path} node={c} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <li className="mt-1">
      <Link
        href={`/source/${node.path}`}
        className="hover:underline text-teal-700"
        title={getDesc(node.name)}
      >
        {node.name}
      </Link>
    </li>
  );
}

export default function DirectoryTree({ tree }: { tree: DirNode[] }) {
  return (
    <div className="border rounded p-2 bg-white shadow text-sm">
      <h3 className="font-bold mb-2">ディレクトリ構成</h3>
      <ul className="ml-2 list-disc">
        {tree.map((node) => (
          <Node key={node.path} node={node} />
        ))}
      </ul>
    </div>
  );
}
