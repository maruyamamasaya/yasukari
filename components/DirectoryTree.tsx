import React from 'react';

export type DirNode = {
  name: string;
  children?: DirNode[];
};

function renderNodes(nodes: DirNode[]) {
  return (
    <ul className="ml-4 list-disc">
      {nodes.map((n) => (
        <li key={n.name}>
          {n.name}
          {n.children && renderNodes(n.children)}
        </li>
      ))}
    </ul>
  );
}

export default function DirectoryTree({ tree }: { tree: DirNode[] }) {
  return (
    <div className="border rounded p-2 bg-white shadow text-sm">
      <h3 className="font-bold mb-2">ディレクトリ構成</h3>
      {renderNodes(tree)}
    </div>
  );
}
