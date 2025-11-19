import { FormEvent, useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../../components/dashboard/DashboardLayout";
import { ChatbotInquiryDetail } from "../../../../../lib/chatbot/inquiries";
import styles from "../../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../../styles/AdminTable.module.css";

type InquiryStatus = "未対応" | "対応中" | "対応済み";

const statusClassName = (status: InquiryStatus): string => {
  if (status === "対応済み") {
    return `${tableStyles.badge} ${tableStyles.badgeOn}`;
  }

  if (status === "未対応") {
    return `${tableStyles.badge} ${tableStyles.badgeOff}`;
  }

  return `${tableStyles.badge} ${tableStyles.badgeNeutral}`;
};

export default function ChatbotInquiryDetailPage() {
  const router = useRouter();
  const sessionId = typeof router.query.sessionId === "string" ? router.query.sessionId : "";

  const [inquiry, setInquiry] = useState<ChatbotInquiryDetail | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !sessionId) {
      return;
    }

    const fetchInquiry = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/chatbot/inquiries/${sessionId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch inquiry: ${response.status}`);
        }

        const data = (await response.json()) as { inquiry?: ChatbotInquiryDetail };
        if (data.inquiry) {
          setInquiry({
            ...data.inquiry,
            messages: [...data.inquiry.messages].sort((a, b) => a.messageIndex - b.messageIndex),
          });
        } else {
          setInquiry(null);
        }
      } catch (fetchError) {
        const message = fetchError instanceof Error ? fetchError.message : "不明なエラーが発生しました";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInquiry();
  }, [router.isReady, sessionId]);

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

    if (!inquiry || replyText.trim() === "") {
      return;
    }

    const postReply = async () => {
      try {
        setIsSubmitting(true);
        const response = await fetch(`/api/chatbot/inquiries/${inquiry.sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: replyText.trim() }),
        });

        if (!response.ok) {
          throw new Error(`Failed to save reply: ${response.status}`);
        }

        const data = (await response.json()) as { inquiry?: ChatbotInquiryDetail };
        if (data.inquiry?.messages) {
          setInquiry((previous) => {
            if (!previous) {
              return null;
            }

            const nextMessages = [...previous.messages, ...data.inquiry.messages];

            return {
              ...previous,
              lastActivityAt: data.inquiry.lastActivityAt ?? previous.lastActivityAt,
              messages: nextMessages.sort((a, b) => a.messageIndex - b.messageIndex),
            };
          });
        }

        setReplyText("");
      } catch (submitError) {
        const message = submitError instanceof Error ? submitError.message : "返信の保存に失敗しました";
        setError(message);
      } finally {
        setIsSubmitting(false);
      }
    };

    void postReply();
  };

  const sortedMessages = useMemo(() => {
    if (!inquiry) {
      return [];
    }

    return [...inquiry.messages].sort((a, b) => a.messageIndex - b.messageIndex);
  }, [inquiry]);

  const userMessages = useMemo(
    () => sortedMessages.filter((message) => message.role === "user"),
    [sortedMessages],
  );

  const deriveStatus = (): InquiryStatus => {
    if (!sortedMessages.length || userMessages.length === 0) {
      return "未対応";
    }

    const lastMessage = sortedMessages[sortedMessages.length - 1];
    if (lastMessage.role === "assistant") {
      return "対応済み";
    }

    return "対応中";
  };

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

          {isLoading ? (
            <div className={styles.placeholderCard}>
              <p>問い合わせの履歴を読み込み中です…</p>
            </div>
          ) : error ? (
            <div className={styles.placeholderCard}>
              <p>問い合わせの取得に失敗しました。</p>
              <p className={styles.sectionDescription}>{error}</p>
              <Link className={styles.link} href="/admin/dashboard/chatbot/inquiries">
                一覧に戻る
              </Link>
            </div>
          ) : !inquiry ? (
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
                    <p className={styles.tagline}>Session: {inquiry.sessionId}</p>
                    <h3 className={styles.detailTitle}>チャットボット問い合わせ</h3>
                    <p className={styles.sectionDescription}>
                      DynamoDB に保存された session_id / user_id / client_id をキーに会話履歴を参照し、問い合わせごとに返信できます。
                    </p>
                  </div>
                  <span className={statusClassName(deriveStatus())}>{deriveStatus()}</span>
                </div>

                <dl className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <dt>ログイン状態</dt>
                    <dd>{inquiry.isLoggedIn ? "ログイン済み" : "未ログイン (client_id で紐付け)"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>user_id</dt>
                    <dd className={styles.monospace}>{inquiry.userId ?? "(null)"}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>client_id</dt>
                    <dd className={styles.monospace}>{inquiry.clientId}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>作成日時</dt>
                    <dd>{formatDatetime(inquiry.createdAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>最終アクティビティ</dt>
                    <dd>{formatDatetime(inquiry.lastActivityAt)}</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>メッセージ総数</dt>
                    <dd>{sortedMessages.length} 件</dd>
                  </div>
                  <div className={styles.detailItem}>
                    <dt>ユーザーメッセージ数</dt>
                    <dd>{userMessages.length} 件</dd>
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
                    <button
                      type="submit"
                      className={`${styles.iconButton} ${styles.iconButtonAccent}`}
                      disabled={!replyText.trim() || isSubmitting}
                    >
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
