import type { NextApiRequest, NextApiResponse } from "next";

import { readChatbotFaq, writeChatbotFaq } from "../../../lib/server/chatbotFaq";
import { ChatbotFaqCategory, ChatbotFaqData, ChatbotFaqItem } from "../../../types/chatbotFaq";

type ValidationResult =
  | { valid: true; data: ChatbotFaqData }
  | { valid: false; message: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function validateFaqItem(item: unknown): ChatbotFaqItem | null {
  if (!item || typeof item !== "object") {
    return null;
  }

  const { q, a } = item as Partial<ChatbotFaqItem>;

  if (!isNonEmptyString(q) || !isNonEmptyString(a)) {
    return null;
  }

  return { q: q.trim(), a: a.trim() };
}

function validateCategory(category: unknown): ChatbotFaqCategory | null {
  if (!category || typeof category !== "object") {
    return null;
  }

  const { id, title, faqs } = category as Partial<ChatbotFaqCategory>;

  if (!isNonEmptyString(id) || !isNonEmptyString(title) || !Array.isArray(faqs)) {
    return null;
  }

  const sanitizedFaqs = faqs
    .map((faq) => validateFaqItem(faq))
    .filter((faq): faq is ChatbotFaqItem => Boolean(faq));

  if (sanitizedFaqs.length === 0) {
    return null;
  }

  return { id: id.trim(), title: title.trim(), faqs: sanitizedFaqs };
}

function validatePayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object") {
    return { valid: false, message: "Invalid request body" };
  }

  const categoriesInput = (body as Partial<ChatbotFaqData>).categories;

  if (!Array.isArray(categoriesInput) || categoriesInput.length === 0) {
    return { valid: false, message: "カテゴリを1件以上入力してください。" };
  }

  const categories = categoriesInput
    .map((category) => validateCategory(category))
    .filter((category): category is ChatbotFaqCategory => Boolean(category));

  if (categories.length === 0) {
    return { valid: false, message: "カテゴリの形式が正しくありません。" };
  }

  return {
    valid: true,
    data: { categories },
  };
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<ChatbotFaqData | { message: string }>
) {
  if (request.method === "GET") {
    try {
      const data = await readChatbotFaq();
      response.status(200).json(data);
    } catch (error) {
      console.error("Failed to read chatbot FAQ data", error);
      response
        .status(500)
        .json({ message: "チャットボットのQAデータの取得に失敗しました。時間をおいて再度お試しください。" });
    }
    return;
  }

  if (request.method === "POST") {
    const result = validatePayload(request.body);

    if (result.valid === false) {
      response.status(400).json({ message: result.message });
      return;
    }

    try {
      const saved = await writeChatbotFaq(result.data);
      response.status(200).json(saved);
    } catch (error) {
      console.error("Failed to save chatbot FAQ data", error);
      response
        .status(500)
        .json({ message: "チャットボットのQAデータの保存に失敗しました。時間をおいて再度お試しください。" });
    }
    return;
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ message: "Method Not Allowed" });
}
