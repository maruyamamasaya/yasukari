import Head from "next/head";
import { useState } from "react";
import ChatBot from "../components/ChatBot";

export default function ChatPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <>
      <Head>
        <title>チャットサポート | yasukari</title>
      </Head>
      <main className="min-h-screen bg-gray-50 py-8 flex flex-col items-center">
        <h1 className="text-center text-xl font-bold mb-6">チャットサポート</h1>
        {isOpen ? (
          <ChatBot className="w-full sm:max-w-xl" onClose={() => setIsOpen(false)} />
        ) : (
          <button
            className="btn-primary px-5 py-3 rounded-full shadow"
            onClick={() => setIsOpen(true)}
          >
            チャットを再開する
          </button>
        )}
      </main>
    </>
  );
}
