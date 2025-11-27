import React, { useState, useRef, useEffect } from "react";
import { ChatbotFaqCategory } from "../types/chatbotFaq";
import {
  FaUser,
  FaRobot,
  FaArrowDown,
  FaArrowUp,
  FaArrowLeft,
  FaTimes,
} from "react-icons/fa";

interface Message {
  from: "bot" | "user";
  text: string;
  time: string;
  feedback?: boolean;
}

type Category = ChatbotFaqCategory;

export default function ChatBot({
  className = "",
  onClose,
  fullScreen = false,
}: {
  className?: string;
  onClose?: () => void;
  fullScreen?: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [step, setStep] = useState<"survey" | "free">("survey");
  const [selectedCategory, setSelectedCategory] =
    useState<Category | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqCategories, setFaqCategories] = useState<Category[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedClientId = localStorage.getItem("chatbot_client_id");
    if (storedClientId) {
      setClientId(storedClientId);
    } else {
      const generatedId = crypto.randomUUID?.() ?? `client-${Date.now()}`;
      setClientId(generatedId);
      localStorage.setItem("chatbot_client_id", generatedId);
    }

    const storedSessionId = localStorage.getItem("chatbot_session_id");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch(() => {
        setUserId(null);
      });
  }, []);

  useEffect(() => {
    const fetchFaqs = async () => {
      setFaqLoading(true);
      setFaqError(null);

      try {
        const response = await fetch("/api/chatbot/faq");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            typeof data?.message === "string" ? data.message : "FAQデータの取得に失敗しました。"
          );
        }

        setFaqCategories(Array.isArray(data?.categories) ? data.categories : []);
      } catch (faqError) {
        console.error(faqError);
        setFaqCategories([]);
        setFaqError("FAQデータの取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setFaqLoading(false);
      }
    };

    void fetchFaqs();
  }, []);

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
    const d = new Date();
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(
      d.getMinutes()
    ).padStart(2, "0")}`;
    setMessages((prev) => [
      ...prev,
      { from: "bot", text: "解決しましたか？", time, feedback: true },
    ]);
    setShowFeedback(true);
  }

  function handleFreeStart() {
    setStep("free");
    addMessage(
      "bot",
      "ご自由にお問い合わせ内容を入力してください。該当するFAQがない場合はスタッフが回答いたします。"
    );
  }

  async function handleFreeSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = form.elements.namedItem("free") as HTMLInputElement;
    const text = input.value.trim();
    if (!text) return;
    addMessage("user", text);
    input.value = "";

    const ensuredClientId = clientId ?? crypto.randomUUID?.() ?? `client-${Date.now()}`;
    if (!clientId) {
      setClientId(ensuredClientId);
      if (typeof window !== "undefined") {
        localStorage.setItem("chatbot_client_id", ensuredClientId);
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chatbot/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          clientId: ensuredClientId,
          sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save chat message");
      }

      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        if (typeof window !== "undefined") {
          localStorage.setItem("chatbot_session_id", data.sessionId);
        }
      }
      addMessage(
        "bot",
        data.assistantMessage?.content ??
          "ただいま確認中です。後ほどご回答いたします。"
      );
    } catch (error) {
      addMessage(
        "bot",
        "メッセージの送信中にエラーが発生しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleYes() {
    onClose?.();
    setShowFeedback(false);
  }

  function handleNo() {
    const newCount = loopCount + 1;
    setLoopCount(newCount);
    setShowFeedback(false);
    setSelectedCategory(null);
    setStep("survey");
    if (newCount >= 4) {
      handleFreeStart();
    }
  }

  function handleBack() {
    setSelectedCategory(null);
    setStep("survey");
  }

  function handleBackButton() {
    if (selectedCategory || step === "free") {
      handleBack();
    } else {
      onClose?.();
    }
  }
  const baseSizeClasses = fullScreen
    ? "h-screen w-full"
    : "h-screen w-full sm:h-[1200px] sm:w-[300px] md:w-[360px]";
  const avatarWrapperClasses =
    "flex items-center justify-center w-10 h-10 rounded-[20px] border";
  const bubbleBaseClasses =
    "max-w-[88%] px-3 py-2 rounded-[18px] shadow-sm border animate-fade";
  const optionContainerClasses =
    "w-full max-w-[420px] min-w-[240px] sm:min-w-[280px] md:min-w-[320px] text-left rounded-[18px] shadow-sm";
  const visibleCategories = showAllCategories
    ? faqCategories
    : faqCategories.slice(0, 3);

  return (
    <div
      className={`relative flex flex-col ${baseSizeClasses} ${fullScreen ? "pt-12 p-4" : "p-4 sm:p-5"} bg-gradient-to-b from-white via-red-50/60 to-white border border-red-100/60 rounded-[20px] shadow-xl overflow-hidden ${className}`}
    >
      {fullScreen && (
        <div className="absolute top-3 left-3 flex items-center gap-2 z-20">
          <button onClick={handleBackButton} className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition">
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <button onClick={onClose} className="bg-white rounded-full p-2 shadow-md hover:shadow-lg transition">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
      )}

      <div className="pb-3 mb-3 border-b border-red-100/70 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">チャットでご相談</p>
          <p className="text-xs text-gray-500">LINEのような使い心地でスタッフがお手伝いします</p>
        </div>
        <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 font-semibold shadow-sm">
          Online
        </span>
      </div>

      <div
        className="relative flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-2 sm:mb-3 pr-4 rounded-2xl bg-white/80 border border-gray-100 shadow-inner"
        ref={scrollRef}
      >
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-end gap-2 px-2 ${m.from === "bot" ? "" : "flex-row-reverse"}`}
          >
            <div
              className={`${avatarWrapperClasses} ${
                m.from === "bot"
                  ? "bg-red-50/80 border-red-100 text-red-600"
                  : "bg-red-500/10 border-red-200 text-red-600"
              }`}
            >
              {m.from === "bot" ? (
                <FaRobot className="w-5 h-5" />
              ) : (
                <FaUser className="w-5 h-5" />
              )}
            </div>
            <div
              className={`${bubbleBaseClasses} ${
                m.from === "bot"
                  ? "bg-gray-50 border-gray-200"
                  : "bg-red-500 text-white border-red-400"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line break-words">
                {m.text}
              </p>
              <span className={`block text-[10px] mt-1 opacity-70 ${m.from === "bot" ? "text-gray-600" : "text-white"}`}>
                {m.time}
              </span>
            </div>
          </div>
        ))}
        <button
          onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
          className="absolute top-2 right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md"
        >
          <FaArrowUp className="w-4 h-4 text-gray-500" />
        </button>
        <button
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          className="absolute bottom-2 right-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:shadow-md"
        >
          <FaArrowDown className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {showFeedback && (
        <div className="flex justify-center gap-4 my-2">
          <button className="btn-primary px-4" onClick={handleYes}>
            はい👍
          </button>
          <button className="btn-secondary px-4" onClick={handleNo}>
            いいえ
          </button>
        </div>
      )}

      {step === "survey" && !selectedCategory && (
        <div className="space-y-3 flex flex-col items-center">
          <p className="text-sm font-medium text-gray-800">カテゴリを選択してください。</p>
          {faqLoading && (
            <p className="text-sm text-gray-600">FAQを読み込み中です…</p>
          )}
          {faqError && !faqLoading && (
            <p className="text-sm text-red-600">{faqError}</p>
          )}
          {!faqLoading && !faqError && faqCategories.length === 0 && (
            <p className="text-sm text-gray-600">表示できるカテゴリがありません。</p>
          )}
          {!faqLoading &&
            !faqError &&
            visibleCategories.map((cat) => (
              <button
                key={cat.id}
                className={`${optionContainerClasses} p-3 sm:p-3.5 border border-gray-200 hover:bg-red-50 transition`}
                onClick={() => handleCategory(cat)}
              >
                <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">{cat.title}</span>
              </button>
            ))}
          {!faqLoading &&
            !faqError &&
            faqCategories.length > 3 && (
              <button
                className="text-sm text-red-700 hover:underline"
                onClick={() => setShowAllCategories((prev) => !prev)}
              >
                {showAllCategories ? "カテゴリを閉じる" : "さらに表示"}
              </button>
            )}
        </div>
      )}

      {step === "survey" && selectedCategory && (
        <div className="space-y-3 flex flex-col items-center">
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
          {selectedCategory.faqs.map((faq, idx) => (
            <button
              key={idx}
              className={`${optionContainerClasses} p-3 sm:p-3.5 border border-gray-200 hover:bg-red-50 transition`}
              onClick={() => handleQuestion(faq)}
            >
              <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">{faq.q}</span>
            </button>
          ))}
          {loopCount >= 2 && (
            <button
              className={`${optionContainerClasses} p-3 sm:p-3.5 border bg-gray-100 hover:bg-gray-200 transition`}
              onClick={handleFreeStart}
            >
              <span className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                その他の質問を入力する
              </span>
            </button>
          )}
        </div>
      )}

      {step === "free" && (
        <div className="space-y-3 flex flex-col items-center">
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
            <form
              onSubmit={handleFreeSubmit}
              className="flex gap-2 items-center bg-white/90 border border-gray-200 rounded-full px-2 py-1 shadow-sm w-full max-w-[420px] min-w-[240px] sm:min-w-[280px] md:min-w-[320px]"
            >
            <input
              type="text"
              name="free"
              className="flex-1 rounded-full p-2 sm:p-3 px-3 sm:px-4 focus:outline-none text-sm"
              placeholder="質問を入力してください"
            />
            <button
              type="submit"
              className="btn-primary rounded-full px-4 py-2 text-sm shadow"
              disabled={isSubmitting}
            >
              送信
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
