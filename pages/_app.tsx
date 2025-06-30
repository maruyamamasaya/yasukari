import type { AppProps } from 'next/app';

import '../styles/global.css';
import ChatBotWidget from '../components/ChatBotWidget';

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatBotWidget />
    </>
  );
}
