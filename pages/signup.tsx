import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import type { FormEvent } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse = {
  message?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setFeedback('メールアドレスを入力してください');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setFeedback('');

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data: ApiResponse = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStatus('error');
        setFeedback(data.message ?? '会員登録に失敗しました。時間をおいて再度お試しください。');
        return;
      }

      setStatus('success');
      setFeedback(
        data.message ??
          '入力いただいたメールアドレス宛に認証コードを送信しました。届いたメールから本登録を進めてください。',
      );
      const redirectEmail = email.trim().toLowerCase();
      setEmail('');
      void router.push(`/register/auth?email=${encodeURIComponent(redirectEmail)}`);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setFeedback('通信エラーが発生しました。ネットワーク環境をご確認のうえ、再度お試しください。');
    }
  };

  return (
    <>
      <Head>
        <title>新規会員登録 | 激安・便利なレンタルバイクのヤスカリ。</title>
        <meta
          name="description"
          content="中古バイク専門店が運営するレンタルバイク屋です。メールアドレスを入力して簡単に会員登録が行えます。"
        />
      </Head>

      <section className="flex w-full flex-col gap-8">
        <nav aria-label="breadcrumb" className="mt-2">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="text-blue-600 transition hover:text-blue-700 hover:underline">
                ホーム
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-slate-600">会員登録</li>
          </ol>
        </nav>

        <div className="space-y-2 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900">会員登録</h1>
          <p className="text-sm text-slate-600">
            激安・便利なレンタルバイクのヤスカリで会員登録を行い、各種サービスを便利にご利用ください。
          </p>
        </div>

        <div className="grid gap-6 rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl backdrop-blur-sm md:grid-cols-[minmax(0,340px),minmax(0,1fr)] md:p-10">
          <div className="flex flex-col justify-center rounded-2xl bg-emerald-50/80 p-6 text-center shadow-inner">
            <p className="text-sm text-emerald-900">アカウントをお持ちの方はこちら</p>
            <Link
              href="/login"
              className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-emerald-600 bg-white py-3 text-lg font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              ログイン
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold text-gray-900">新規会員登録</h2>
            <p className="mt-2 text-sm text-gray-600">メールアドレスを入力して簡単に登録できます。</p>
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              {feedback && (
                <div
                  className={
                    status === 'success'
                      ? 'rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
                      : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600'
                  }
                >
                  {feedback}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  maxLength={50}
                  placeholder="メールアドレスを入力してください"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex w-full items-center justify-center rounded-full bg-red-600 py-3 text-lg font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                {status === 'loading' ? '登録処理中...' : '新規会員登録'}
              </button>
              <p className="text-xs text-gray-500">
                新規登録すると、
                <Link href="/terms" className="text-blue-600 underline underline-offset-2">
                  利用規約
                </Link>
                及び
                <Link href="/privacy" className="text-blue-600 underline underline-offset-2">
                  プライバシーポリシー
                </Link>
                に同意したとみなされます。
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
