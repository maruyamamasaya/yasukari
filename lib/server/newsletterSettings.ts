import { promises as fs } from "fs";
import path from "path";

import { NewsletterSettings } from "../../types/newsletter";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "newsletter-settings.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      const initialData: NewsletterSettings = {
        subject: "",
        htmlContent: "",
      };
      await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(initialData, null, 2)}\n`, "utf-8");
    } else {
      throw error;
    }
  }
}

export async function readNewsletterSettings(): Promise<NewsletterSettings> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<NewsletterSettings>;
    return {
      subject: typeof parsed.subject === "string" ? parsed.subject : "",
      previewText:
        typeof parsed.previewText === "string" && parsed.previewText.trim().length > 0
          ? parsed.previewText
          : undefined,
      htmlContent: typeof parsed.htmlContent === "string" ? parsed.htmlContent : "",
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : undefined,
    } satisfies NewsletterSettings;
  } catch (error) {
    console.error("Failed to parse newsletter settings", error);
    return {
      subject: "",
      htmlContent: "",
    };
  }
}

export async function writeNewsletterSettings(settings: NewsletterSettings): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
}
