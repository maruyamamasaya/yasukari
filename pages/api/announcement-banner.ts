import type { NextApiRequest, NextApiResponse } from "next";
import { isValidSlug } from "../../lib/dashboard/customerBlog";
import {
  readAnnouncementBanner,
  writeAnnouncementBanner,
} from "../../lib/server/announcementBanner";
import { AnnouncementBannerSettings } from "../../types/announcement";

type ValidationResult =
  | { valid: true; data: AnnouncementBannerSettings }
  | { valid: false; message: string };

function validatePayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return { valid: false, message: "Invalid request body" };
  }

  const { text, linkType, blogSlug, externalUrl } = body as Record<string, unknown>;

  if (typeof text !== "string" || text.trim().length === 0) {
    return { valid: false, message: "テキストを入力してください。" };
  }

  if (linkType !== "blog" && linkType !== "external" && linkType !== "none") {
    return { valid: false, message: "リンク種別の指定が正しくありません。" };
  }

  if (linkType === "blog") {
    if (typeof blogSlug !== "string" || !isValidSlug(blogSlug)) {
      return { valid: false, message: "ブログ記事を正しく選択してください。" };
    }
  }

  if (linkType === "external") {
    if (typeof externalUrl !== "string" || externalUrl.trim().length === 0) {
      return { valid: false, message: "リンク先URLを入力してください。" };
    }
    try {
      const parsed = new URL(externalUrl);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("Invalid protocol");
      }
    } catch (error) {
      return { valid: false, message: "URLの形式が正しくありません。" };
    }
  }

  const sanitized: AnnouncementBannerSettings = {
    text: text.trim(),
    linkType,
    blogSlug: linkType === "blog" && typeof blogSlug === "string" ? blogSlug : undefined,
    externalUrl:
      linkType === "external" && typeof externalUrl === "string"
        ? externalUrl.trim()
        : undefined,
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
  response: NextApiResponse<AnnouncementBannerSettings | { message: string }>
) {
  if (request.method === "GET") {
    try {
      const settings = await readAnnouncementBanner();
      response.status(200).json(settings);
    } catch (error) {
      console.error("Failed to read announcement banner", error);
      response
        .status(500)
        .json({ message: "お知らせの取得に失敗しました。時間をおいて再度お試しください。" });
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
      await writeAnnouncementBanner(result.data);
      response.status(200).json(result.data);
    } catch (error) {
      console.error("Failed to update announcement banner", error);
      response
        .status(500)
        .json({ message: "お知らせの更新に失敗しました。時間をおいて再度お試しください。" });
    }
    return;
  }

  response.setHeader("Allow", "GET, POST");
  response.status(405).json({ message: "Method Not Allowed" });
}
