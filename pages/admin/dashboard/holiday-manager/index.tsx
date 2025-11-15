import Head from "next/head";
import type { MouseEvent as ReactMouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import {
  Holiday,
  deleteHoliday,
  fetchMonthlyHolidays,
  setHoliday,
} from "../../../../lib/dashboard/holidayManager";
import styles from "../../../../styles/HolidayManager.module.css";

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAY_TOGGLE_LABELS = ["月", "火", "水", "木", "金", "土", "日"];

const formatDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatMonthParam = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatMonthLabel = (date: Date): string => {
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
};

type CalendarCell = {
  date: Date;
  key: string;
  isCurrentMonth: boolean;
};

type ContextMenuState = {
  date: string;
  x: number;
  y: number;
};

type NoteEditorState = {
  date: string;
  note: string;
};

const buildCalendar = (reference: Date): CalendarCell[][] => {
  const firstDay = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const weeks: CalendarCell[][] = [];
  const current = new Date(startDate);

  for (let weekIndex = 0; weekIndex < 6; weekIndex += 1) {
    const days: CalendarCell[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const cellDate = new Date(current);
      days.push({
        date: cellDate,
        key: formatDateKey(cellDate),
        isCurrentMonth: cellDate.getMonth() === reference.getMonth(),
      });
      current.setDate(current.getDate() + 1);
    }
    weeks.push(days);

    if (
      current.getMonth() !== reference.getMonth() &&
      current.getDay() === 0 &&
      weeks.length >= 5
    ) {
      break;
    }
  }

  return weeks;
};

export default function HolidayManagerPage() {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [holidays, setHolidays] = useState<Record<string, Holiday>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [noteEditor, setNoteEditor] = useState<NoteEditorState | null>(null);
  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);

  const todayKey = useMemo(() => formatDateKey(new Date()), []);
  const calendar = useMemo(() => buildCalendar(currentMonth), [currentMonth]);
  const holidaySet = useMemo(
    () => new Set(Object.keys(holidays)),
    [holidays]
  );

  const currentMonthParam = useMemo(
    () => formatMonthParam(currentMonth),
    [currentMonth]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchMonthlyHolidays(currentMonthParam);
        const map = result.reduce<Record<string, Holiday>>((acc, holiday) => {
          acc[holiday.date] = holiday;
          return acc;
        }, {});
        setHolidays(map);
      } catch (fetchError) {
        console.error(fetchError);
        setError("祭日情報の取得に失敗しました。時間をおいて再度お試しください。");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [currentMonthParam]);

  useEffect(() => {
    const closeMenu = () => {
      setContextMenu(null);
    };

    document.addEventListener("click", closeMenu);
    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, []);

  const refreshMonth = async () => {
    try {
      const result = await fetchMonthlyHolidays(currentMonthParam);
      const map = result.reduce<Record<string, Holiday>>((acc, holiday) => {
        acc[holiday.date] = holiday;
        return acc;
      }, {});
      setHolidays(map);
      setError(null);
    } catch (refreshError) {
      console.error(refreshError);
      setError("祭日情報の更新に失敗しました。");
    }
  };

  const handleMonthChange = (offset: number) => {
    setContextMenu(null);
    setError(null);
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return new Date(next.getFullYear(), next.getMonth(), 1);
    });
  };

  const handleCellClick = (
    cell: CalendarCell,
    event: ReactMouseEvent<HTMLTableCellElement>
  ) => {
    event.stopPropagation();
    if (!calendarWrapperRef.current) {
      setContextMenu({ date: cell.key, x: event.clientX, y: event.clientY });
      return;
    }

    const containerRect =
      calendarWrapperRef.current.getBoundingClientRect();
    const targetRect = event.currentTarget.getBoundingClientRect();
    const x = targetRect.left - containerRect.left + targetRect.width / 2;
    const y = targetRect.top - containerRect.top + targetRect.height;
    setContextMenu({ date: cell.key, x, y });
  };

  const handleSetHoliday = async (date: string) => {
    setError(null);
    setActionBusy(true);
    setContextMenu(null);
    try {
      const note = holidays[date]?.note ?? "";
      await setHoliday(date, note ?? "");
      await refreshMonth();
    } catch (setError) {
      console.error(setError);
      setError("休日の設定に失敗しました。");
    } finally {
      setActionBusy(false);
    }
  };

  const handleRemoveHoliday = async (date: string) => {
    setError(null);
    setActionBusy(true);
    setContextMenu(null);
    try {
      await deleteHoliday(date);
      await refreshMonth();
    } catch (removeError) {
      console.error(removeError);
      setError("休日の解除に失敗しました。");
    } finally {
      setActionBusy(false);
    }
  };

  const openNoteEditor = (date: string) => {
    setContextMenu(null);
    setNoteEditor({ date, note: holidays[date]?.note ?? "" });
  };

  const handleSaveNote = async () => {
    if (!noteEditor) {
      return;
    }

    setError(null);
    setActionBusy(true);
    try {
      await setHoliday(noteEditor.date, noteEditor.note.trim());
      await refreshMonth();
      setNoteEditor(null);
    } catch (noteError) {
      console.error(noteError);
      setError("備考の保存に失敗しました。");
    } finally {
      setActionBusy(false);
    }
  };

  const monthDays = useMemo(() => {
    const result: CalendarCell[] = [];
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      result.push({
        date: new Date(date),
        key: formatDateKey(date),
        isCurrentMonth: true,
      });
      date.setDate(date.getDate() + 1);
    }
    return result;
  }, [currentMonth]);

  const weekdayHolidayStatus = useMemo(() => {
    const grouped: Record<number, string[]> = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
    };
    monthDays.forEach((day) => {
      grouped[day.date.getDay()].push(day.key);
    });
    const map = new Map<
      number,
      { allHoliday: boolean; holidays: string[]; workingDays: string[] }
    >();
    Object.entries(grouped).forEach(([weekday, dates]) => {
      const holidayDates = dates.filter((dateKey) => holidaySet.has(dateKey));
      const workingDates = dates.filter((dateKey) => !holidaySet.has(dateKey));
      map.set(Number(weekday), {
        allHoliday: dates.length > 0 && holidayDates.length === dates.length,
        holidays: holidayDates,
        workingDays: workingDates,
      });
    });
    return map;
  }, [holidaySet, monthDays]);

  const handleWeekdayToggle = async (weekday: number, nextState: boolean) => {
    if (actionBusy) {
      return;
    }
    const status = weekdayHolidayStatus.get(weekday);
    if (!status) {
      return;
    }

    setError(null);
    setActionBusy(true);
    setContextMenu(null);
    try {
      if (nextState) {
        for (const date of status.workingDays) {
          await setHoliday(date, holidays[date]?.note ?? "");
        }
      } else {
        for (const date of status.holidays) {
          await deleteHoliday(date);
        }
      }
      await refreshMonth();
    } catch (toggleError) {
      console.error(toggleError);
      setError("曜日の一括更新に失敗しました。");
    } finally {
      setActionBusy(false);
    }
  };

  const menuHoliday = contextMenu ? holidaySet.has(contextMenu.date) : false;

  return (
    <>
      <Head>
        <title>祭日管理</title>
      </Head>
      <DashboardLayout
        title="祭日管理"
        description="標準カレンダーUIで営業日と休日を切り替えて管理します。"
      >
        <main className={styles.managerRoot}>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <section className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <div className={styles.monthLabel}>{formatMonthLabel(currentMonth)}</div>
              <div className={styles.monthControls}>
                <button
                  type="button"
                  className={styles.monthButton}
                  onClick={() => handleMonthChange(-1)}
                  disabled={actionBusy || loading}
                >
                  前月
                </button>
                <button
                  type="button"
                  className={styles.monthButton}
                  onClick={() => handleMonthChange(1)}
                  disabled={actionBusy || loading}
                >
                  翌月
                </button>
              </div>
            </div>
            <div className={styles.calendarWrapper} ref={calendarWrapperRef}>
              {loading ? (
                <p className={styles.loadingMessage}>カレンダーを読み込み中です…</p>
              ) : (
                <table className={styles.calendarGrid}>
                  <thead>
                    <tr>
                      {WEEKDAY_LABELS.map((label) => (
                        <th key={label}>{label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {calendar.map((week, weekIndex) => (
                      <tr key={weekIndex}>
                        {week.map((cell) => {
                          const isHoliday = holidaySet.has(cell.key);
                          const note = holidays[cell.key]?.note;
                          return (
                            <td
                              key={cell.key}
                              onClick={(event) => handleCellClick(cell, event)}
                              className={`${styles.dayCell} ${
                                cell.isCurrentMonth ? "" : styles.outsideMonth
                              } ${isHoliday ? styles.holiday : ""} ${
                                cell.key === todayKey ? styles.today : ""
                              }`.trim()}
                            >
                              <div className={styles.dayNumber}>{cell.date.getDate()}</div>
                              {note && <div className={styles.noteText}>{note}</div>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {contextMenu && (
                <div
                  className={styles.contextMenu}
                  style={{ left: contextMenu.x, top: contextMenu.y }}
                  onClick={(event) => event.stopPropagation()}
                >
                  {menuHoliday ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(contextMenu.date)}
                        disabled={actionBusy}
                      >
                        休日を解除する
                      </button>
                      <div className={styles.contextMenuDivider} aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => openNoteEditor(contextMenu.date)}
                        disabled={actionBusy}
                      >
                        備考を編集する
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetHoliday(contextMenu.date)}
                      disabled={actionBusy}
                    >
                      休日に設定する
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className={styles.weekdayPanel}>
            <h2 className={styles.calendarStatus}>曜日一括設定</h2>
            <div className={styles.weekdayButtons}>
              {WEEKDAY_TOGGLE_LABELS.map((label, index) => {
                const weekday = (index + 1) % 7;
                const status = weekdayHolidayStatus.get(weekday);
                const isPressed = status?.allHoliday ?? false;
                return (
                  <button
                    key={label}
                    type="button"
                    className={styles.weekdayButton}
                    aria-pressed={isPressed}
                    onClick={() => handleWeekdayToggle(weekday, !isPressed)}
                    disabled={actionBusy || loading || !status}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        </main>
        {noteEditor && (
          <div
            className={styles.noteModalOverlay}
            onClick={() => {
              if (!actionBusy) {
                setNoteEditor(null);
              }
            }}
          >
            <div
              className={styles.noteModal}
              onClick={(event) => event.stopPropagation()}
            >
              <h3>{`${noteEditor.date} の備考`}</h3>
              <textarea
                value={noteEditor.note}
                onChange={(event) =>
                  setNoteEditor((current) =>
                    current ? { ...current, note: event.target.value } : current
                  )
                }
                placeholder="備考を入力してください（任意）"
              />
              <div className={styles.noteModalActions}>
                <button
                  type="button"
                  className={styles.noteModalCancel}
                  onClick={() => setNoteEditor(null)}
                  disabled={actionBusy}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  className={styles.noteModalSave}
                  onClick={handleSaveNote}
                  disabled={actionBusy}
                >
                  保存する
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
}
