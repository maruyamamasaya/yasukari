import { useEffect, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

import ThanksCard from '../../components/ThanksCard';
import {
  consumeSessionFlag,
  pushDataLayerEvent,
  SIGNUP_COMPLETE_KEY,
} from '../../lib/conversionTracking';
import { buildRegistrationDetailsPath } from '../../lib/provisionalRegistrationRedirect';

export default function ProvisionalRegistrationThanksPage() {
  const router = useRouter();
  const registrationDetailsPath = useMemo(
    () => buildRegistrationDetailsPath(router.query),
    [router.query],
  );

  useEffect(() => {
    if (consumeSessionFlag(SIGNUP_COMPLETE_KEY)) {
      pushDataLayerEvent({ event: 'sign_up_complete' });
    }
  }, []);

  return (
    <>
      <Head>
        <title>仮登録が完了しました｜ヤスカリ</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <ThanksCard
        title="仮登録が完了しました！"
        lead={<>ご登録ありがとうございます。<br />続いて基本情報を入力し、本登録を完了してください。</>}
        actionLabel="本登録に進む"
        actionHref={registrationDetailsPath}
      />
    </>
  );
}
