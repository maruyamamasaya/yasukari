import { useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push('/mypage');
    } else {
      const data = await res.json();
      setError(data.message || 'Login failed');
    }
  };

    return (
      <>
        <Head>
          <title>ログイン</title>
        </Head>
        <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h1 className="text-xl font-bold mb-4 text-center">ログイン</h1>
            <div className="bg-blue-50 border border-blue-100 text-sm text-blue-900 rounded p-3 mb-4">
              <p className="font-semibold">デモアカウント情報</p>
              <ul className="mt-1 space-y-1">
                <li>
                  <span className="font-semibold">ID:</span> adminuser
                </li>
                <li>
                  <span className="font-semibold">パスワード:</span> adminuser
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <button type="button" className="btn-primary w-full">Google でログイン</button>
              <button type="button" className="btn-primary w-full">Apple でログイン</button>
            </div>
            <hr className="my-4" />
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <div className="mb-4">
                <label className="block mb-1">メールアドレス</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                メールアドレスでログイン
              </button>
            </form>
            <p className="text-sm text-center mt-4">
              <Link href="/signup">新規登録はこちら</Link>
            </p>
          </div>
        </main>
      </>
    );
}
