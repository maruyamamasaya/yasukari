export type Holiday = {
  date: string;
  isHoliday: boolean;
  store: string;
  note?: string;
};

export async function fetchMonthlyHolidays(
  month: string,
  store: string
): Promise<Holiday[]> {
  const response = await fetch(`/api/calendar?month=${month}&store=${store}`);
  if (!response.ok) {
    throw new Error("Failed to fetch holiday calendar");
  }
  const data = (await response.json()) as { holidays: Holiday[] };
  return data.holidays;
}

export async function setHoliday(
  date: string,
  store: string,
  isHoliday: boolean,
  note = ""
): Promise<void> {
  const response = await fetch(`/api/calendar/${date}?store=${store}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_holiday: isHoliday, note }),
  });

  if (!response.ok) {
    throw new Error("Failed to set holiday");
  }
}

export async function deleteHoliday(date: string, store: string): Promise<void> {
  const response = await fetch(`/api/calendar/${date}?store=${store}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete holiday");
  }
}
