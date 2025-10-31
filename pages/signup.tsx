import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import AuthHeader from '../components/auth/AuthHeader';

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

  const isLoading = status === 'loading';

  return (
    <>
      <Head>
        <title>新規会員登録 | 激安・便利なレンタルバイクのヤスカリ。</title>
        <meta
          name="description"
          content="中古バイク専門店が運営するレンタルバイク屋です。メールアドレスを入力して簡単に会員登録が行えます。"
        />
      </Head>

      <div className="min-h-screen bg-white text-gray-900">
        <AuthHeader
          highlightHref="/signup"
          highlightLabel="会員登録"
          mobileCtaHref="/login"
          mobileCtaLabel="ログイン"
        />

        <main className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
          <nav aria-label="breadcrumb" className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="text-blue-600 hover:underline">
                  ホーム
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-gray-600">会員登録</li>
            </ol>
          </nav>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">Trial plan</p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">最短1分で仮登録。バイク生活をもっと自由に。</h1>
              <p className="mt-4 text-sm leading-relaxed text-gray-600">
                メールアドレスをご登録いただくだけで、ヤスカリ。のレンタルサービスをご利用いただく準備が整います。
                後日届くメールから本登録を完了すると、車両の予約やレンタル状況の確認がマイページで可能になります。
              </p>
              <ul className="mt-6 space-y-3 text-sm text-gray-700">
                {[{ text: '全国主要都市での豊富なラインナップから最適なバイクを選択' },
                  { text: 'Web だけで延長・返却日時の変更がいつでも可能' },
                  { text: 'メンテナンス済みの安心車両を保険付きでご提供' }].map((item) => (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                <p className="font-semibold">ご利用前のお願い</p>
                <p className="mt-1 leading-relaxed">
                  会員規約とプライバシーポリシーをご確認のうえ、ご同意いただける場合にのみお申し込みください。
                  本登録の際には本人確認書類（免許証など）のご提出が必要です。
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 space-y-2 text-center">
                <h2 className="text-xl font-semibold text-gray-900">メールアドレスで仮登録</h2>
                <p className="text-xs text-gray-500">
                  入力いただいたメールアドレス宛に確認コードをお送りします。受信したメールから手続きを完了してください。
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {feedback && (
                  <p
                    className={`rounded-lg border px-3 py-2 text-sm ${
                      status === 'success'
                        ? 'border-green-200 bg-green-50 text-green-700'
                        : 'border-red-200 bg-red-50 text-red-600'
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    {feedback}
                  </p>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700" htmlFor="email">
                    メールアドレス
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                    placeholder="example@company.jp"
                    autoComplete="email"
                    disabled={isLoading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-80"
                  disabled={isLoading}
                >
                  {isLoading ? '送信中…' : '認証コードを送信する'}
                </button>
              </form>
              <p className="mt-6 text-center text-xs text-gray-500">
                既にアカウントをお持ちの方は
                <Link href="/login" className="ml-1 font-semibold text-red-600 underline underline-offset-2">
                  ログイン
                </Link>
                へ
              </p>
              <p className="mt-4 text-center text-[11px] leading-relaxed text-gray-400">
                ボタンを押すことで
                <Link href="/terms" className="mx-1 underline">
                  利用規約
                </Link>
                と
                <Link href="/privacy" className="ml-1 underline">
                  プライバシーポリシー
                </Link>
                に同意したとみなされます。
              </p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
