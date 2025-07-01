import React, { useState, useRef, useEffect } from "react";
import faqData from "../data/faq.json";
import {
  FaUser,
  FaRobot,
  FaArrowDown,
  FaArrowUp,
} from "react-icons/fa";

interface Message {
  from: "bot" | "user";
  text: string;
  time: string;
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  function addMessage(from: "bot" | "user", text: string) {
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
    setMessages((prev) => [...prev, { from, text, time }]);
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

  function handleBack() {
    setSelectedCategory(null);
    setStep("survey");
  }

  return (
    <div
      className={`w-72 sm:w-96 h-96 flex flex-col p-4 border rounded-2xl shadow-lg bg-white resize-y max-h-[150vh] overflow-hidden ${className}`}
    >
      <div className="relative flex-1 overflow-y-auto space-y-2 mb-2 pr-4" ref={scrollRef}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 ${m.from === "bot" ? "" : "flex-row-reverse"}`}
          >
            {m.from === "bot" ? (
              <FaRobot className="text-red-600 w-5 h-5" />
            ) : (
              <FaUser className="text-red-600 w-5 h-5" />
            )}
            <div
              className={`max-w-[70%] p-2 rounded-2xl animate-fade ${
                m.from === "bot" ? "bg-gray-100" : "bg-red-500 text-white"
              }`}
            >
              <p>{m.text}</p>
              <span className="block text-[10px] text-right mt-1 opacity-70">
                {m.time}
              </span>
            </div>
          </div>
        ))}
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute top-1 right-1 bg-white border rounded-full p-1 shadow"
        >
          <FaArrowUp className="w-4 h-4" />
        </button>
        <button
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          className="absolute bottom-1 right-1 bg-white border rounded-full p-1 shadow"
        >
          <FaArrowDown className="w-4 h-4" />
        </button>
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
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
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
        <div className="space-y-2">
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
          <form onSubmit={handleFreeSubmit} className="flex gap-2">
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
        </div>
      )}
    </div>
  );
}
