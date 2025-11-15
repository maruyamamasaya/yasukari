import { promises as fs } from "fs";
import path from "path";

export type HolidayRecord = {
  date: string;
  note?: string;
};

const DATA_FILE_PATH = path.join(process.cwd(), "data", "holiday-calendar.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(DATA_FILE_PATH);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
      await fs.writeFile(DATA_FILE_PATH, "[]", "utf-8");
    } else {
      throw error;
    }
  }
}

export async function readHolidayRecords(): Promise<HolidayRecord[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE_PATH, "utf-8");

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (typeof item !== "object" || item === null) {
          return null;
        }
        const { date, note } = item as { date?: unknown; note?: unknown };
        if (typeof date !== "string") {
          return null;
        }
        return {
          date,
          note: typeof note === "string" ? note : undefined,
        } satisfies HolidayRecord;
      })
      .filter((item): item is HolidayRecord => item !== null);
  } catch (error) {
    console.error("Failed to parse holiday calendar data", error);
    return [];
  }
}

export async function writeHolidayRecords(records: HolidayRecord[]): Promise<void> {
  await ensureDataFile();
  await fs.writeFile(
    DATA_FILE_PATH,
    `${JSON.stringify(records, null, 2)}\n`,
    "utf-8"
  );
}

export async function upsertHolidayRecord(record: HolidayRecord): Promise<void> {
  const records = await readHolidayRecords();
  const nextRecords = [...records];
  const index = nextRecords.findIndex((item) => item.date === record.date);

  if (index >= 0) {
    nextRecords[index] = { ...record };
  } else {
    nextRecords.push({ ...record });
  }

  nextRecords.sort((a, b) => a.date.localeCompare(b.date));

  await writeHolidayRecords(nextRecords);
}

export async function removeHolidayRecord(date: string): Promise<void> {
  const records = await readHolidayRecords();
  const nextRecords = records.filter((record) => record.date !== date);
  await writeHolidayRecords(nextRecords);
}
