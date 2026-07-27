import { useEffect } from 'react';
import Head from 'next/head';

import ThanksCard from '../../components/ThanksCard';
import { consumeSessionFlag, pushDataLayerEvent, SIGNUP_COMPLETE_KEY } from '../../lib/conversionTracking';

export default function AccountThanksPage() {
  useEffect(() => {
    if (consumeSessionFlag(SIGNUP_COMPLETE_KEY)) {
      pushDataLayerEvent({ event: 'sign_up_complete' });
    }
  }, []);

  return (
    <>
      <Head><title>会員登録が完了しました｜ヤスカリ</title></Head>
      <ThanksCard
        title="会員登録が完了しました！"
        lead={<>ようこそ、ヤスカリへ。<br />さっそく乗りたいバイクの空き状況を見てみましょう。</>}
        actionLabel="バイクを探す"
        actionHref="/"
      />
    </>
  );
}
