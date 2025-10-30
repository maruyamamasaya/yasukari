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
                に同意したとみなされます。
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
