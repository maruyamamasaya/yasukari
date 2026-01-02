import { promises as fs } from "fs";
import path from "path";

const DATA_FILE_PATH = path.join(process.cwd(), "data", "maintenance.json");

type MaintenanceStatus = {
  enabled: boolean;
};

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(DATA_FILE_PATH, `${JSON.stringify({ enabled: false }, null, 2)}\n`, "utf-8");
    } else {
      throw error;
    }
  }
}

export async function readMaintenanceStatus(): Promise<MaintenanceStatus> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");
  try {
    const parsed = JSON.parse(raw) as Partial<MaintenanceStatus>;
    return { enabled: Boolean(parsed.enabled) };
  } catch (error) {
    console.error("Failed to parse maintenance status", error);
    return { enabled: false };
  }
}

export async function setMaintenanceStatus(enabled: boolean): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(
    DATA_FILE_PATH,
    `${JSON.stringify({ enabled }, null, 2)}\n`,
    "utf-8"
  );
}
