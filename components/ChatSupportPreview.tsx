import React from "react";
import { FaRobot } from "react-icons/fa";
import styles from "../styles/ChatSupport.module.css";

type PreviewVariant = "mobile" | "desktop";
type PreviewState = "guest" | "loggedIn" | "chips" | "loading" | "error";

type PreviewProps = {
  variant: PreviewVariant;
  state: PreviewState;
  title: string;
};

type Message = {
  from: "bot" | "user";
  text: string;
  time: string;
};

const baseMessages: Message[] = [
  {
    from: "bot",
    text: "こんにちは。FAQから探すか、予約サポートについてご相談いただけます。",
    time: "09:30",
  },
  {
    from: "user",
    text: "予約の変更をしたいです",
    time: "09:31",
  },
  {
    from: "bot",
    text: "承知しました。予約番号と変更希望日を教えてください。",
    time: "09:31",
  },
];

const chipOptions = [
  "予約変更",
  "キャンセル",
  "支払いについて",
  "保険",
  "営業時間",
  "車両について",
];

export default function ChatSupportPreview({ variant, state, title }: PreviewProps) {
  const variantClass = variant === "desktop" ? styles.desktopVariant : styles.mobileVariant;
  const messages = state === "guest" ? baseMessages.slice(0, 1) : baseMessages;
  const showCard = state === "loggedIn";
  const showChips = state === "chips" || state === "guest";
  const showLoading = state === "loading";
  const showErrorCard = state === "error";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <div className={variant === "desktop" ? styles.frameDesktop : styles.frameMobile}>
        <div
          className={
            variant === "desktop" ? styles.desktopContainer : styles.safeAreaMobile
          }
        >
          <div className={`${styles.chatShell} ${variantClass}`}>
            <div className={styles.safeArea}>
              <header className={styles.header}>
                <div className={styles.headerLeft}>
                  <div>
                    <p className={styles.headerTitle}>チャットサポート</p>
                    <p className={styles.headerSubtitle}>FAQ＋予約サポート</p>
                  </div>
                </div>
              </header>

              <div className={styles.chatArea}>
                {messages.map((message, index) => (
                  <div key={`${message.time}-${index}`} className={styles.messageGroup}>
                    <div
                      className={`${styles.messageRow} ${
                        message.from === "user" ? styles.messageRowUser : ""
                      }`}
                    >
                      {message.from === "bot" && (
                        <div className={styles.avatar}>
                          <FaRobot />
                        </div>
                      )}
                      <div
                        className={`${styles.bubble} ${
                          message.from === "user" ? styles.bubbleUser : ""
                        }`}
                      >
                        {message.text}
                        <div className={styles.timestamp}>{message.time}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {showCard && (
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>予約情報をご案内します</div>
                    <div className={styles.cardBody}>
                      ログイン済みのため、予約内容の確認と変更をスムーズに進められます。
                    </div>
                    <button className={styles.cardAction}>予約を確認する</button>
                  </div>
                )}

                {showErrorCard && (
                  <div className={styles.card}>
                    <div className={styles.cardTitle}>ログインが必要です</div>
                    <div className={styles.cardBody}>
                      401エラーが発生しました。予約の確認にはログインが必要です。
                    </div>
                    <button className={styles.cardAction}>ログインする</button>
                  </div>
                )}

                {showChips && (
                  <div className={styles.chipRow}>
                    {chipOptions.map((chip, index) => (
                      <button
                        key={chip}
                        className={`${styles.chip} ${
                          state === "chips" && index === 0 ? styles.chipActive : ""
                        }`}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}

                {showLoading && (
                  <div className={styles.messageGroup}>
                    <div className={styles.messageRow}>
                      <div className={styles.avatar}>
                        <FaRobot />
                      </div>
                      <div className={styles.bubble}>
                        <div className={styles.typing}>
                          <span className={styles.typingDot} />
                          <span className={styles.typingDot} />
                          <span className={styles.typingDot} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.composer}>
                <input
                  className={styles.input}
                  placeholder="質問を入力してください"
                  disabled={state === "guest"}
                />
                <button
                  className={`${styles.composerButton} ${styles.sendButton}`}
                  aria-label="送信する"
                >
                  ↑
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
