import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      router.push('/');
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
          <div className="flex mb-4">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-center ${mode === 'login' ? 'font-bold border-b-2 border-red-600' : 'text-gray-500'}`}
            >
              既に会員登録済みの方
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-center ${mode === 'signup' ? 'font-bold border-b-2 border-red-600' : 'text-gray-500'}`}
            >
              初めてご利用される方
            </button>
          </div>
          {mode === 'login' ? (
            <form onSubmit={handleSubmit}>
              {error && <p className="text-red-500 mb-2">{error}</p>}
              <div className="mb-4">
                <label className="block mb-1">ユーザー名</label>
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
                ログイン
              </button>
            </form>
          ) : (
            <div className="p-4 text-center">
              <p>会員登録機能は準備中です。</p>
              <p className="text-sm text-gray-500">AWS サービスと連携予定です。</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
