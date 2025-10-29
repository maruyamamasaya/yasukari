import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';

import type { FormEvent } from 'react';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

type ApiResponse = {
  message?: string;
};

export default function SignupPage() {
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
          '入力いただいたメールアドレス宛に登録のご案内をお送りしました。メールをご確認ください。',
      );
      setEmail('');
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

      <div className="min-h-screen bg-white text-gray-900">
        <header className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/static/images/logo/250x50.png"
                alt="ヤスカリ"
                width={200}
                height={40}
                className="hidden md:block"
              />
              <div className="flex items-center gap-2 md:hidden">
                <img src="/static/images/logo/300x300.jpg" alt="ヤスカリ" width={44} height={44} className="rounded-full" />
                <span className="text-sm font-semibold text-gray-800">レンタルバイクのヤスカリ</span>
              </div>
            </Link>
            <div className="hidden md:flex flex-col text-right text-sm">
              <div className="flex items-center justify-end gap-2 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M1 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6"></path>
                  <path
                    fillRule="evenodd"
                    d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"
                  ></path>
                </svg>
                <Link href="/signup" className="font-semibold text-red-600">
                  会員登録
                </Link>
              </div>
              <span className="mt-1 text-gray-600">激安・便利なレンタルバイクのヤスカリ</span>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-600 hover:text-white md:hidden"
            >
              ログイン
            </Link>
          </div>
          <div className="hidden bg-red-700 text-white md:block">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-8 text-sm">
              {[
                { href: '/guide', label: 'ご利用案内' },
                { href: '/stores', label: '店舗' },
                { href: '/products', label: '車種・料金' },
                { href: '/insurance', label: '保険と補償' },
                { href: '/faq', label: 'よくあるご質問' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex-1 border-b-2 border-transparent py-3 text-center font-medium transition hover:bg-red-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

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

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
              <p className="text-sm text-gray-600">アカウントをお持ちの方はこちら</p>
              <Link
                href="/login"
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 py-3 text-lg font-semibold text-white transition hover:bg-emerald-600"
              >
                ログイン
              </Link>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">新規会員登録</h2>
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
        </main>

        <footer className="border-t border-gray-100 bg-white py-6 text-sm text-gray-500">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 text-center md:flex-row md:flex-wrap md:justify-center md:gap-4">
            <Link href="/faq" className="hover:text-red-600">
              よくあるご質問
            </Link>
            <Link href="/privacy" className="hover:text-red-600">
              プライバシーポリシー
            </Link>
            <Link href="/tokusyouhou" className="hover:text-red-600">
              特定商取引法に基づく表示
            </Link>
            <Link href="/terms" className="hover:text-red-600">
              利用規約・注意事項
            </Link>
            <Link href="/contact" className="hover:text-red-600">
              お問い合わせ
            </Link>
          </div>
          <p className="mt-4 text-center text-xs text-gray-400">Copyright レンタルバイク『ヤスカリ』.</p>
        </footer>
      </div>
    </>
  );
}
