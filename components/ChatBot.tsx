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
  const [height, setHeight] = useState(448);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loopCount, setLoopCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [faqCategories, setFaqCategories] = useState<Category[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [faqError, setFaqError] = useState<string | null>(null);

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

  function handleResizeStart(e: React.MouseEvent) {
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    window.addEventListener("mousemove", handleResizing);
    window.addEventListener("mouseup", handleResizeEnd);
    e.preventDefault();
  }

  function handleResizing(e: MouseEvent) {
    const newHeight = startHeightRef.current - (e.clientY - startYRef.current);
    setHeight(Math.max(200, Math.min(newHeight, window.innerHeight * 1.5)));
  }

  function handleResizeEnd() {
    window.removeEventListener("mousemove", handleResizing);
    window.removeEventListener("mouseup", handleResizeEnd);
  }

  const containerWidth = fullScreen ? "w-full" : "w-[22rem] sm:w-[26rem]";

  return (
    <div
      className={`relative ${containerWidth} flex flex-col ${fullScreen ? "pt-12 p-4" : "p-4 sm:p-5"} bg-gradient-to-b from-white via-red-50/60 to-white border border-red-100/60 rounded-3xl shadow-xl max-h-[150vh] overflow-hidden ${className}`}
      style={fullScreen ? { height: "100vh" } : { height }}
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
      {!fullScreen && (
        <div
          onMouseDown={handleResizeStart}
          className="absolute top-0 left-0 w-3 h-3 bg-gray-300 cursor-nwse-resize z-10 rounded-br"
        />
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
            {m.from === "bot" ? (
              <FaRobot className="text-red-600 w-5 h-5" />
            ) : (
              <FaUser className="text-red-600 w-5 h-5" />
            )}
            <div
              className={`max-w-[78%] px-3 py-2 rounded-3xl shadow-sm border animate-fade ${
                m.from === "bot"
                  ? "bg-gray-50 border-gray-200"
                  : "bg-red-500 text-white border-red-400"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-line">{m.text}</p>
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
        <div className="space-y-3">
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
            faqCategories.map((cat) => (
              <button
                key={cat.id}
                className="w-full text-left p-2 sm:p-3 border border-gray-200 rounded-2xl hover:bg-red-50 transition shadow-sm"
                onClick={() => handleCategory(cat)}
              >
                {cat.title}
              </button>
            ))}
        </div>
      )}

      {step === "survey" && selectedCategory && (
        <div className="space-y-3">
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
          {selectedCategory.faqs.map((faq, idx) => (
            <button
              key={idx}
              className="w-full text-left p-2 sm:p-3 border border-gray-200 rounded-2xl hover:bg-red-50 transition shadow-sm"
              onClick={() => handleQuestion(faq)}
            >
              {faq.q}
            </button>
          ))}
          {loopCount >= 2 && (
            <button
              className="w-full text-left p-2 sm:p-3 border rounded-2xl bg-gray-100 hover:bg-gray-200 transition"
              onClick={handleFreeStart}
            >
              その他の質問を入力する
            </button>
          )}
        </div>
      )}

      {step === "free" && (
        <div className="space-y-3">
          <button
            onClick={handleBack}
            className="text-sm text-red-700 hover:underline"
          >
            &larr; カテゴリ選択に戻る
          </button>
          <form onSubmit={handleFreeSubmit} className="flex gap-2 items-center bg-white/90 border border-gray-200 rounded-full px-2 py-1 shadow-sm">
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
