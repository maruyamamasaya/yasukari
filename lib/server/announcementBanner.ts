import { promises as fs } from "fs";
import path from "path";
import { AnnouncementBannerSettings } from "../../types/announcement";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "announcement-banner.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      const initialData: AnnouncementBannerSettings = {
        text: "",
        linkType: "none",
      };
      await fs.writeFile(
        DATA_FILE_PATH,
        `${JSON.stringify(initialData, null, 2)}\n`,
        "utf-8"
      );
    } else {
      throw error;
    }
  }
}

export async function readAnnouncementBanner(): Promise<AnnouncementBannerSettings> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");

  try {
    const parsed = JSON.parse(raw) as Partial<AnnouncementBannerSettings>;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      linkType: parsed.linkType ?? "none",
      blogSlug: typeof parsed.blogSlug === "string" ? parsed.blogSlug : undefined,
      externalUrl:
        typeof parsed.externalUrl === "string" ? parsed.externalUrl : undefined,
    } satisfies AnnouncementBannerSettings;
  } catch (error) {
    console.error("Failed to parse announcement banner data", error);
    return { text: "", linkType: "none" };
  }
}

export async function writeAnnouncementBanner(
  settings: AnnouncementBannerSettings
): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(
    DATA_FILE_PATH,
    `${JSON.stringify(settings, null, 2)}\n`,
    "utf-8"
  );
}
