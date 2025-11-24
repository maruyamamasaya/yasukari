import { promises as fs } from "fs";
import path from "path";

import { ChatbotFaqCategory, ChatbotFaqData, ChatbotFaqItem } from "../../types/chatbotFaq";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "chatbot-faq.json");
const LEGACY_FILE_PATH = path.join(process.cwd(), "data", "faq.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
    return;
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });

  let seedData: ChatbotFaqData = { categories: [] };

  try {
    const legacyRaw = await fs.readFile(LEGACY_FILE_PATH, "utf-8");
    const parsedLegacy = JSON.parse(legacyRaw) as Partial<ChatbotFaqData>;
    if (Array.isArray(parsedLegacy.categories)) {
      seedData = {
        categories: parsedLegacy.categories,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (legacyError) {
    if ((legacyError as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn("Failed to read legacy FAQ data", legacyError);
    }
  }

  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(seedData, null, 2)}\n`, "utf-8");
}

function sanitizeFaqItem(item: ChatbotFaqItem): ChatbotFaqItem | null {
  if (!item) return null;

  const q = typeof item.q === "string" ? item.q.trim() : "";
  const a = typeof item.a === "string" ? item.a.trim() : "";

  if (!q || !a) {
    return null;
  }

  return { q, a };
}

function sanitizeCategory(category: ChatbotFaqCategory): ChatbotFaqCategory | null {
  if (!category || typeof category !== "object") {
    return null;
  }

  const id = typeof category.id === "string" ? category.id.trim() : "";
  const title = typeof category.title === "string" ? category.title.trim() : "";
  const faqs = Array.isArray(category.faqs)
    ? category.faqs
        .map((faq) => sanitizeFaqItem(faq))
        .filter((faq): faq is ChatbotFaqItem => Boolean(faq))
    : [];

  if (!id || !title || faqs.length === 0) {
    return null;
  }

  return { id, title, faqs };
}

function normalizeData(data: Partial<ChatbotFaqData>): ChatbotFaqData {
  const categories = Array.isArray(data.categories)
    ? data.categories
        .map((category) => sanitizeCategory(category as ChatbotFaqCategory))
        .filter((category): category is ChatbotFaqCategory => Boolean(category))
    : [];

  return {
    categories,
    updatedAt: typeof data.updatedAt === "string" ? data.updatedAt : undefined,
  };
}

export async function readChatbotFaq(): Promise<ChatbotFaqData> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");

  try {
    return normalizeData(JSON.parse(raw) as Partial<ChatbotFaqData>);
  } catch (error) {
    console.error("Failed to parse chatbot FAQ data", error);
    return { categories: [] };
  }
}

export async function writeChatbotFaq(data: ChatbotFaqData): Promise<ChatbotFaqData> {
  await ensureDataFile();
  const sanitized = normalizeData(data);
  const payload: ChatbotFaqData = {
    ...sanitized,
    updatedAt: new Date().toISOString(),
  };

  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
  return payload;
}
