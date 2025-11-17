import type { AppProps } from 'next/app';

import '../styles/global.css';
import '../styles/desktop.css';
import '../styles/mobile.css';
import ChatBotWidget from '../components/ChatBotWidget';
import MobileNav from '../components/MobileNav';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeaderEn from '../components/HeaderEn';
import FooterEn from '../components/FooterEn';
import Layout from '../components/Layout';
import { useRouter } from 'next/router';


export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isEn = router.pathname.startsWith('/en');
  const isAdminRoute = router.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <Component {...pageProps} />;
  }

  return (
    <>
      {isEn ? <HeaderEn /> : <Header />}
      <Layout>
        <Component {...pageProps} />
      </Layout>
      {isEn ? <FooterEn /> : <Footer />}
      <ChatBotWidget />
      <MobileNav />
    </>
  );
}
