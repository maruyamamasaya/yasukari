import type { AppProps } from 'next/app';

import '../styles/global.css';
import ChatBotWidget from '../components/ChatBotWidget';
import MobileNav from '../components/MobileNav';


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatBotWidget />
      <MobileNav />
    </>
  );
}
