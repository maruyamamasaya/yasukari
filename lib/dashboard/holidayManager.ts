export type Holiday = {
  date: string;
  note?: string;
};

export async function fetchMonthlyHolidays(month: string): Promise<Holiday[]> {
  const response = await fetch(`/api/calendar?month=${month}`);
  if (!response.ok) {
    throw new Error("Failed to fetch holiday calendar");
  }
  const data = (await response.json()) as { holidays: Holiday[] };
  return data.holidays;
}

export async function setHoliday(date: string, note = ""): Promise<void> {
  const response = await fetch(`/api/calendar/${date}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ is_holiday: true, note }),
  });

  if (!response.ok) {
    throw new Error("Failed to set holiday");
  }
}

export async function deleteHoliday(date: string): Promise<void> {
  const response = await fetch(`/api/calendar/${date}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete holiday");
  }
}
