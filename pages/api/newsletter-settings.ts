import type { NextApiRequest, NextApiResponse } from "next";

import { readNewsletterSettings, writeNewsletterSettings } from "../../lib/server/newsletterSettings";
import { NewsletterSettings } from "../../types/newsletter";

type ValidationResult =
  | { valid: true; data: NewsletterSettings }
  | { valid: false; message: string };

function validatePayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body" };
  }

  const { subject, previewText, htmlContent } = body as Record<string, unknown>;

  if (typeof subject !== "string" || subject.trim().length === 0) {
    return { valid: false, message: "件名を入力してください。" };
  }

  if (typeof htmlContent !== "string" || htmlContent.trim().length === 0) {
    return { valid: false, message: "HTML本文を入力してください。" };
  }

  const sanitized: NewsletterSettings = {
    subject: subject.trim(),
    previewText:
      typeof previewText === "string" && previewText.trim().length > 0
        ? previewText.trim()
        : undefined,
    htmlContent,
    updatedAt: new Date().toISOString(),
  };

  return { valid: true, data: sanitized };
}

function isInvalidResult(
  result: ValidationResult
): result is { valid: false; message: string } {
  return result.valid === false;
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<NewsletterSettings | { message: string }>
) {
  if (request.method === "GET") {
    try {
      const settings = await readNewsletterSettings();
      response.status(200).json(settings);
    } catch (error) {
      console.error("Failed to read newsletter settings", error);
      response
        .status(500)
        .json({ message: "メルマガ設定の取得に失敗しました。時間をおいて再度お試しください。" });
    }
    return;
  }

  if (request.method === "POST") {
    const result = validatePayload(request.body);
    if (isInvalidResult(result)) {
      response.status(400).json({ message: result.message });
      return;
    }

    try {
      await writeNewsletterSettings(result.data);
      response.status(200).json(result.data);
    } catch (error) {
      console.error("Failed to update newsletter settings", error);
      response
        .status(500)
        .json({ message: "メルマガ設定の保存に失敗しました。時間をおいて再度お試しください。" });
    }
    return;
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ message: "Method Not Allowed" });
}
