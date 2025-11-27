import Head from "next/head";
import ChatBot from "../components/ChatBot";

export default function ChatPage() {
  return (
    <>
      <Head>
        <title>チャットサポート | yasukari</title>
      </Head>
      <main className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
        <h1 className="text-center text-xl font-bold mb-4">チャットサポート</h1>
        <ChatBot className="w-full sm:max-w-xl" />
      </main>
    </>
  );
}
