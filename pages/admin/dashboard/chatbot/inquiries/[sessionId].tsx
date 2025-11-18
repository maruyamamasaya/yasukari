import { FormEvent, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import { ChatMessage, ChatbotInquiry, chatbotInquiries } from "../../../../../lib/chatbot/inquiries";
import styles from "../../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";

const statusClassName = (status: ChatbotInquiry["status"]): string => {
  if (status === "対応済み") {
    return `${tableStyles.badge} ${tableStyles.badgeOn}`;
  }

  if (status === "未対応") {
    return `${tableStyles.badge} ${tableStyles.badgeOff}`;
  }

  return tableStyles.badge;
};

export default function ChatbotInquiryDetailPage() {
  const router = useRouter();
  const sessionId = typeof router.query.sessionId === "string" ? router.query.sessionId : "";

  const [chatInquiries, setChatInquiries] = useState<ChatbotInquiry[]>(chatbotInquiries);
  const [replyText, setReplyText] = useState<string>("");

  const selectedInquiry = useMemo(
    () => chatInquiries.find((inquiry) => inquiry.sessionId === sessionId),
    [chatInquiries, sessionId],
  );

  const formatDatetime = (value: string) =>
    new Date(value).toLocaleString("ja-JP", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleReplySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedInquiry || replyText.trim() === "") {
      return;
    }

    setChatInquiries((prev) =>
      prev.map((inquiry) => {
        if (inquiry.sessionId !== selectedInquiry.sessionId) {
          return inquiry;
        }

        const now = new Date().toISOString();
        const nextIndex = inquiry.messages.length + 1;
        const assistantMessage: ChatMessage = {
          messageId: `reply-${now}`,
          role: "assistant",
          content: replyText.trim(),
          userId: inquiry.userId,
          clientId: inquiry.clientId,
          createdAt: now,
          messageIndex: nextIndex,
        };

        return {
          ...inquiry,
          messages: [...inquiry.messages, assistantMessage],
          lastActivityAt: now,
          status: inquiry.status === "未対応" ? "対応中" : inquiry.status,
        };
      }),
    );

    setReplyText("");
  };

  const sortedMessages = useMemo(() => {
    if (!selectedInquiry) {
      return [];
    }

    return [...selectedInquiry.messages].sort((a, b) => a.messageIndex - b.messageIndex);
  }, [selectedInquiry]);

  return (
    <>
      <Head>
        <title>チャットボット問い合わせ詳細 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="チャットボット問い合わせ詳細"
        description="チャットボット経由で届いたお問い合わせの履歴と返信内容を確認できます。"
      >
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.breadcrumb}>
                <Link href="/admin/dashboard/chatbot/inquiries">チャットボット問い合わせ一覧</Link>
                <span aria-hidden> / </span>
                <span>{sessionId || "詳細"}</span>
              </p>
              <h2 className={styles.sectionTitle}>問い合わせ詳細</h2>
              <p className={styles.sectionDescription}>
                DynamoDB に保存された session_id / user_id / client_id をキーに会話履歴を参照し、問い合わせごとに返信できます。
              </p>
            </div>
            <button className={styles.outlineButton} onClick={() => router.back()} type="button">
              一覧に戻る
            </button>
          </div>

          {!selectedInquiry ? (
            <div className={styles.placeholderCard}>
              <p>指定されたセッション ID の問い合わせが見つかりませんでした。</p>
              <Link className={styles.link} href="/admin/dashboard/chatbot/inquiries">
                一覧に戻る
              </Link>
            </div>
          ) : (
            <div className={styles.detailStack}>
              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <div>
                    <p className={styles.tagline}>Session: {selectedInquiry.sessionId}</p>
                    <h3 className={styles.detailTitle}>{selectedInquiry.topic}</h3>
                    <p className={styles.sectionDescription}>{selectedInquiry.summary}</p>
                  </div>
                  <span className={statusClassName(selectedInquiry.status)}>{selectedInquiry.status}</span>
                </div>

                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>ログイン状態</dt>
                    <dd>{selectedInquiry.isLoggedIn ? "ログイン済み" : "未ログイン (client_id で紐付け)"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>user_id</dt>
                    <dd className={styles.monospace}>{selectedInquiry.userId ?? "(null)"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>client_id</dt>
                    <dd className={styles.monospace}>{selectedInquiry.clientId}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>チケットID</dt>
                    <dd className={styles.monospace}>{selectedInquiry.ticketId}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>作成日時</dt>
                    <dd>{formatDatetime(selectedInquiry.createdAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>最終アクティビティ</dt>
                    <dd>{formatDatetime(selectedInquiry.lastActivityAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>連絡先</dt>
                    <dd>{selectedInquiry.contact}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>メッセージ数</dt>
                    <dd>{selectedInquiry.messages.length} 件</dd>
                  </div>
                </dl>
              </div>

              <div className={styles.detailPanel}>
                <div className={styles.detailHeader}>
                  <h3 className={styles.detailTitle}>会話履歴</h3>
                  <p className={styles.sectionDescription}>
                    DynamoDB の ChatMessages テーブルに保存されるメッセージ順に表示しています。
                  </p>
                </div>

                <ol className={styles.conversationList}>
                  {sortedMessages.map((message) => (
                    <li key={message.messageId} className={styles.conversationItem}>
                      <div className={styles.conversationMeta}>
                        <div className={styles.conversationMetaLeft}>
                          <span
                            className={`${tableStyles.badge} ${message.role === "assistant" ? tableStyles.badgeOn : tableStyles.badgeOff}`}
                          >
                            {message.role === "assistant" ? "ボット" : "ユーザー"}
                          </span>
                          <span className={styles.monospace}># {message.messageIndex}</span>
                        </div>
                        <div className={styles.conversationMetaRight}>
                          <span className={styles.monospace}>{message.userId ?? "(null)"}</span>
                          <span className={styles.monospace}>{message.clientId}</span>
                          <span>{formatDatetime(message.createdAt)}</span>
                        </div>
                      </div>
                      <p className={styles.conversationContent}>{message.content}</p>
                    </li>
                  ))}
                </ol>

                <form className={styles.replyForm} onSubmit={handleReplySubmit}>
                  <label className={styles.replyLabel} htmlFor="chatbot-reply">
                    返信内容
                  </label>
                  <textarea
                    id="chatbot-reply"
                    className={styles.replyTextarea}
                    placeholder="ここに管理者からの返信を入力し、ChatMessages に assistant ロールとして保存します。"
                    rows={4}
                    value={replyText}
                    onChange={(event) => setReplyText(event.target.value)}
                  />
                  <div className={styles.replyActions}>
                    <button type="submit" className={`${styles.iconButton} ${styles.iconButtonAccent}`} disabled={!replyText.trim()}>
                      返信を追加
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </section>
      </DashboardLayout>
    </>
  );
}
