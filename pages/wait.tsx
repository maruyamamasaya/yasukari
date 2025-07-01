import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface Pos { top: number; left: number; }

export default function WaitPage() {
  const router = useRouter();
  const [positions, setPositions] = useState<Pos[]>([]);
  const [releaseIdx, setReleaseIdx] = useState(0);

  useEffect(() => {
    const pos = Array.from({ length: 3 }).map(() => ({
      top: Math.floor(Math.random() * 80) + 10,
      left: Math.floor(Math.random() * 80) + 10,
    }));
    setPositions(pos);
    setReleaseIdx(Math.floor(Math.random() * 3));
  }, []);

  const handleRelease = async () => {
    await fetch('/api/unblock', { method: 'POST' });
    router.push('/');
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-6 bg-gray-50 text-center text-sm relative">
      <Head>
        <title>しばらくお待ちください</title>
      </Head>
      <div>
        <h1 className="text-xl font-bold mb-4">アクセス制限中です</h1>
        <p className="mb-4">短時間に多数のアクセスが検出されたため、一時的に閲覧を制限しています。1分ほど待ってから再度お試しください。</p>
        <p>お問い合わせ: <a href="mailto:info@rebikele.com" className="text-red-600 underline">info@rebikele.com</a></p>
      </div>
      {positions.map((p, idx) => (
        <button
          key={idx}
          onClick={idx === releaseIdx ? handleRelease : undefined}
          style={{ position: 'absolute', top: `${p.top}%`, left: `${p.left}%` }}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          {idx === releaseIdx ? '解除' : ''}
        </button>
      ))}
    </main>
  );
}
