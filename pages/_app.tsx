import type { AppProps } from 'next/app';

import '../styles/global.css';
import '../styles/desktop.css';
import '../styles/mobile.css';
import ChatBotWidget from '../components/ChatBotWidget';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Layout from '../components/Layout';


export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Footer />
      <ChatBotWidget />
      <MobileNav />
    </>
  );
}
