import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  COGNITO_ACCESS_TOKEN_COOKIE,
  COGNITO_ID_TOKEN_COOKIE,
  COGNITO_OAUTH_STATE_KEY,
} from '../../lib/cognitoHostedUi';

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${value}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export default function CognitoCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    const params = new URLSearchParams(hash);

    const urlError = params.get('error');
    if (urlError) {
      setError(params.get('error_description') ?? urlError);
      return;
    }

    const returnedState = params.get('state');
    const expectedState = sessionStorage.getItem(COGNITO_OAUTH_STATE_KEY);

    if (!returnedState || !expectedState || returnedState !== expectedState) {
      sessionStorage.removeItem(COGNITO_OAUTH_STATE_KEY);
      setError('認証状態を確認できませんでした。もう一度ログインからお試しください。');
      return;
    }

    sessionStorage.removeItem(COGNITO_OAUTH_STATE_KEY);

    const idToken = params.get('id_token');
    const accessToken = params.get('access_token');
    const expiresIn = Number(params.get('expires_in') ?? '3600');

    if (!idToken) {
      setError('IDトークンを取得できませんでした。再度お試しください。');
      return;
    }

    setCookie(COGNITO_ID_TOKEN_COOKIE, idToken, expiresIn);
    if (accessToken) {
      setCookie(COGNITO_ACCESS_TOKEN_COOKIE, accessToken, expiresIn);
    }

    void router.replace('/mypage');
  }, [router]);

  return (
    <>
      <Head>
        <title>認証処理中…</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-lg font-semibold text-gray-900">サインインを完了しています…</h1>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          ) : (
            <p className="mt-3 text-sm text-gray-600">少々お待ちください。</p>
          )}
        </div>
      </div>
    </>
  );
}
