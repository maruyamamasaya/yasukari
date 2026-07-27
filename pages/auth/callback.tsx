import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { COGNITO_OAUTH_STATE_KEY } from '../../lib/cognitoHostedUi';
import { SIGNUP_COMPLETE_KEY, SIGNUP_INTENT_KEY } from '../../lib/conversionTracking';

export default function CognitoCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      // 1. ハッシュを取得
      const rawHash = window.location.hash.replace(/^#/, '');

      // 🔸ハッシュが空 = Hosted UI から戻ってきたわけではなく、
      //   ユーザーが直接 /auth/callback を開いた or リロードした可能性が高い
      if (!rawHash) {
        await router.replace('/login');
        return;
      }

      const params = new URLSearchParams(rawHash);

      // 認証に関係するパラメータが1つも無い場合も、素直に /login に戻す
      const hasAnyAuthParam =
        params.has('id_token') ||
        params.has('access_token') ||
        params.has('error') ||
        params.has('state');

      if (!hasAnyAuthParam) {
        await router.replace('/login');
        return;
      }

      // 2. Cognito からの error があればそれを表示して終了
      const urlError = params.get('error');
      if (urlError) {
        sessionStorage.removeItem(SIGNUP_INTENT_KEY);
        setError(params.get('error_description') ?? urlError);
        return;
      }

      // 3. state チェック
      const returnedState = params.get('state');
      const expectedState = sessionStorage.getItem(COGNITO_OAUTH_STATE_KEY);

      if (!returnedState || !expectedState || returnedState !== expectedState) {
        sessionStorage.removeItem(COGNITO_OAUTH_STATE_KEY);
        sessionStorage.removeItem(SIGNUP_INTENT_KEY);
        setError('認証状態を確認できませんでした。もう一度ログインからお試しください。');
        return;
      }

      // state が一致したので、もう不要なため削除
      sessionStorage.removeItem(COGNITO_OAUTH_STATE_KEY);

      // 4. トークン取得
      const idToken = params.get('id_token');
      const accessToken = params.get('access_token');
      const expiresIn = Number(params.get('expires_in') ?? '3600');

      if (!idToken) {
        setError('認証情報を取得できませんでした。お手数ですが、もう一度ログインからお試しください。');
        return;
      }

      // 5. クッキー保存（HttpOnly かつサーバー側設定でデプロイ後も保持）
      try {
        const response = await fetch('/api/auth/store-tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ idToken, accessToken, expiresIn }),
        });

        if (!response.ok) {
          throw new Error(`Failed to persist tokens: ${response.status}`);
        }
      } catch (err) {
        console.error(err);
        setError('ログイン情報を保持できませんでした。時間をおいて再度お試しください。');
        return;
      }

      // 6. 新規登録導線だけサンクスページへ（intent はここで必ず消費する）
      const isSignup = sessionStorage.getItem(SIGNUP_INTENT_KEY) === '1';
      sessionStorage.removeItem(SIGNUP_INTENT_KEY);
      if (isSignup) sessionStorage.setItem(SIGNUP_COMPLETE_KEY, '1');
      await router.replace(isSignup ? '/account/thanks' : '/mypage/profile-setup?fromLogin=1');
      window.location.reload();
    };

    void processCallback();
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
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : (
            <p className="mt-3 text-sm text-gray-600">少々お待ちください。</p>
          )}
        </div>
      </div>
    </>
  );
}
