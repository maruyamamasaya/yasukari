import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
          <h1 className="text-xl font-bold mb-4 text-center">ログイン</h1>
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
      </main>
    </>
  );
}
