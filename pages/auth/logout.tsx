import { useEffect } from 'react';
import Head from 'next/head';
import { buildLogoutUrl, COGNITO_ACCESS_TOKEN_COOKIE, COGNITO_ID_TOKEN_COOKIE } from '../../lib/cognitoHostedUi';

function clearCookie(name: string) {
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

export default function LogoutPage() {
  useEffect(() => {
    clearCookie(COGNITO_ID_TOKEN_COOKIE);
    clearCookie(COGNITO_ACCESS_TOKEN_COOKIE);
    window.location.href = buildLogoutUrl();
  }, []);

  return (
    <>
      <Head>
        <title>ログアウトしています…</title>
      </Head>
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow">
          <h1 className="text-lg font-semibold text-gray-900">ログアウト処理中です</h1>
          <p className="mt-3 text-sm text-gray-600">しばらくお待ちください。</p>
        </div>
      </div>
    </>
  );
}
