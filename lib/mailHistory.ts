import { randomUUID } from "crypto";

export type MailHistoryStatus = "sent" | "failed" | "skipped";

export type MailHistoryCategory = "仮登録" | "本登録" | "予約完了" | "その他";

export type MailHistoryEntry = {
  id: string;
  category: MailHistoryCategory;
  to: string;
  subject: string;
  status: MailHistoryStatus;
  errorMessage?: string;
  createdAt: string;
};

const MAX_HISTORY_LENGTH = 500;
const history: MailHistoryEntry[] = [];

const toCategory = (value?: string): MailHistoryCategory => {
  if (value === "仮登録" || value === "本登録" || value === "予約完了") {
    return value;
  }

  return "その他";
};

export function addMailHistory(
  entry: Omit<MailHistoryEntry, "id" | "createdAt"> & { createdAt?: string }
): MailHistoryEntry {
  const record: MailHistoryEntry = {
    ...entry,
    id: randomUUID(),
    category: toCategory(entry.category),
    createdAt: entry.createdAt || new Date().toISOString(),
  };

  history.unshift(record);

  if (history.length > MAX_HISTORY_LENGTH) {
    history.length = MAX_HISTORY_LENGTH;
  }

  return record;
}

export function getMailHistory(limit = 200): MailHistoryEntry[] {
  const effectiveLimit = Math.max(1, Math.min(limit, MAX_HISTORY_LENGTH));
  return history.slice(0, effectiveLimit);
}
