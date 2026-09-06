import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

import type { FormEvent } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ResendConfirmationPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setStatus('error');
      setMessage('メールアドレスを入力してください。');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setStatus('error');
        setMessage(
          data.message ?? '確認コードを再送できませんでした。時間をおいて再度お試しください。',
        );
        return;
      }

      setStatus('success');
      setMessage('確認コードを再送しました。メールをご確認ください。');
    } catch {
      setStatus('error');
      setMessage('通信エラーが発生しました。時間をおいて再度お試しください。');
    }
  };

  const isLoading = status === 'loading';

  return (
    <>
      <Head>
        <title>確認メールを再送 | ヤスカリ。</title>
      </Head>
      <div className="min-h-screen bg-white text-gray-900">
        <main className="mx-auto w-full max-w-lg px-4 py-12 md:py-20">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h1 className="text-center text-2xl font-bold">確認メールを再送</h1>
            <p className="mt-4 text-sm leading-relaxed text-gray-600">
              登録時に使用したメールアドレスを入力してください。
              <br />
              新しい確認コードを送信します。
            </p>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
              {message ? (
                <p
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    status === 'success'
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-600'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  {message}
                </p>
              ) : null}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Eメールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:bg-gray-100"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="inline-flex w-full items-center justify-center rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? '送信中…' : '確認コードを再送'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              すでに確認済みの方 →{' '}
              <Link href="/login" className="font-semibold text-red-600 underline underline-offset-2">
                サインイン
              </Link>
            </p>
          </section>
        </main>
      </div>
    </>
  );
}
