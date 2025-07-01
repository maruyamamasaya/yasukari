import fs from 'fs';
import path from 'path';
import { GetStaticPaths, GetStaticProps } from 'next';
import CalendarWidget from '../../components/CalendarWidget';
import DirectoryTree, { DirNode } from '../../components/DirectoryTree';
import { getDirTree, getAllFiles } from '../../lib/getDirTree';

interface Props {
  filePath: string;
  content: string;
  tree: DirNode[];
}

export default function SourcePage({ filePath, content, tree }: Props) {
  return (
    <div className="max-w-6xl mx-auto p-4 flex flex-row flex-wrap gap-6">
      <div className="flex-1">
        <h1 className="text-lg font-bold mb-4">{filePath}</h1>
        <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm whitespace-pre-wrap">
          {content}
        </pre>
      </div>
      <div className="w-64 space-y-4">
        <CalendarWidget />
        <DirectoryTree tree={tree} />
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = () => {
  const files = getAllFiles(process.cwd(), 2);
  const paths = files.map((f) => ({ params: { path: f.split(path.sep) } }));
  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps = ({ params }) => {
  const segments = params!.path as string[];
  const relPath = segments.join(path.sep);
  const absPath = path.join(process.cwd(), relPath);
  const content = fs.readFileSync(absPath, 'utf8');
  const tree = getDirTree(process.cwd(), 2);
  return { props: { filePath: relPath, content, tree } };
};
