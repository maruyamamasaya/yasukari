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
      <main className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white shadow-xl rounded-2xl p-8 sm:p-10 w-full">
            <div className="mb-8 text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">ログイン</h2>
              <p className="text-sm text-slate-500">ご登録のメールアドレスとパスワードを入力してください（メールアドレスのみで登録された場合はパスワード入力は不要です）</p>
            </div>
            <div className="space-y-3">
              <button type="button" className="btn-primary w-full py-3 text-base">Google でログイン</button>
              <button type="button" className="btn-primary w-full py-3 text-base">Apple でログイン</button>
            </div>
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-slate-400">または</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">メールアドレス</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="example@company.jp"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">パスワード</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="パスワードを入力（メール登録のみの場合は空欄でOK）"
                />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-base font-semibold">
                メールアドレスでログイン
              </button>
            </form>
            <p className="mt-8 text-center text-sm text-slate-500">
              アカウントをお持ちでない方は{' '}
              <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
                新規登録
              </Link>
              へ
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
