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
        {isOpen ? (
          <ChatBot
            className="w-[92vw] max-w-[560px] min-w-[320px] h-[720px]"
            onClose={() => setIsOpen(false)}
          />
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
