import { useEffect } from 'react';
import Head from 'next/head';

import ThanksCard from '../../../components/ThanksCard';
import { consumeSessionFlag, pushDataLayerEvent, REGISTRATION_COMPLETE_KEY } from '../../../lib/conversionTracking';

export default function RegistrationThanksPage() {
  useEffect(() => {
    if (consumeSessionFlag(REGISTRATION_COMPLETE_KEY)) {
      pushDataLayerEvent({ event: 'complete_registration' });
    }
  }, []);

  return (
    <>
      <Head><title>本登録が完了しました｜ヤスカリ</title></Head>
      <ThanksCard
        title="本登録が完了しました！"
        lead={<>ご登録ありがとうございます。<br />これでご予約に進めます。そのまま予約を続けましょう。</>}
        actionLabel="予約に進む"
        actionHref="/"
      />
    </>
  );
}
