import React, { useState } from "react";
import faqData from "../data/faq.json";

interface Message {
  from: "bot" | "user";
  text: string;
}

interface Category {
  id: string;
  title: string;
  faqs: { q: string; a: string }[];
}

const categories: Category[] = (faqData as any).categories;

export default function ChatBot({ className = "" }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<"survey" | "free">("survey");
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);

  function addMessage(from: "bot" | "user", text: string) {
    setMessages((prev) => [...prev, { from, text }]);
  }

  function handleCategory(cat: Category) {
    setSelectedCategory(cat);
    addMessage("bot", `${cat.title}から質問をお選びください。`);
  }

  function handleQuestion(faq: { q: string; a: string }) {
    addMessage("user", faq.q);
    addMessage("bot", faq.a);
  }

  function handleFreeStart() {
    setStep("free");
    addMessage(
      "bot",
      "ご自由にお問い合わせ内容を入力してください。該当するFAQがない場合はスタッフが回答いたします。"
    );
  }

  function handleFreeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("free") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";
    // ここでは OpenAI 連携の代わりにプレースホルダー応答を返す
    addMessage("bot", "ただいま確認中です。後ほどご回答いたします。");
  }

  return (
    <div className={`w-72 sm:w-96 h-96 flex flex-col p-4 border rounded-lg shadow-lg bg-white ${className}`}>
      <div className="flex-1 overflow-y-auto space-y-2 mb-2 pr-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={m.from === "bot" ? "text-left" : "text-right"}
          >
            <div
              className={
                m.from === "bot"
                  ? "inline-block bg-gray-100 p-2 rounded"
                  : "inline-block bg-blue-500 text-white p-2 rounded"
              }
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {step === "survey" && !selectedCategory && (
        <div className="space-y-2">
          <p className="text-sm">カテゴリを選択してください。</p>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className="w-full text-left p-2 border rounded hover:bg-gray-50"
              onClick={() => handleCategory(cat)}
            >
              {cat.title}
            </button>
          ))}
        </div>
      )}

      {step === "survey" && selectedCategory && (
        <div className="space-y-2">
          {selectedCategory.faqs.map((faq, idx) => (
            <button
              key={idx}
              className="w-full text-left p-2 border rounded hover:bg-gray-50"
              onClick={() => handleQuestion(faq)}
            >
              {faq.q}
            </button>
          ))}
          <button
            className="w-full text-left p-2 border rounded bg-gray-200 hover:bg-gray-300"
            onClick={handleFreeStart}
          >
            その他の質問を入力する
          </button>
        </div>
      )}

      {step === "free" && (
        <form onSubmit={handleFreeSubmit} className="mt-2 flex gap-2">
          <input
            type="text"
            name="free"
            className="flex-1 border rounded-full p-2 px-3"
            placeholder="質問を入力してください"
          />
          <button type="submit" className="btn-primary rounded-full px-4">
            送信
          </button>
        </form>
      )}
    </div>
  );
}
