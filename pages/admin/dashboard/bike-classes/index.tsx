import Head from "next/head";
import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass } from "../../../../lib/dashboard/types";

export default function BikeClassListPage() {
  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassIds, setSelectedClassIds] = useState<Set<number>>(
    () => new Set()
  );
  const [deleteConfirmationChecked, setDeleteConfirmationChecked] =
    useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortState, setSortState] = useState<{
    key: "classId" | "className";
    direction: "asc" | "desc";
  }>({
    key: "classId",
    direction: "asc",
  });

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const response = await fetch("/api/bike-classes");
        if (!response.ok) {
          setError("クラス一覧の取得に失敗しました。");
          return;
        }
        const data: BikeClass[] = await response.json();
        setBikeClasses(data.sort((a, b) => a.classId - b.classId));
        setDeleteError(null);
      } catch (loadError) {
        console.error("Failed to load bike classes", loadError);
        setError("クラス一覧の取得に失敗しました。");
      }
    };

    void loadClasses();
  }, []);

  const filteredClasses = useMemo(() => {
    const normalizedKeyword = searchTerm.trim().toLowerCase();
    const filtered = normalizedKeyword
      ? bikeClasses.filter((item) => {
          const keyword = normalizedKeyword;
          return (
            item.className.toLowerCase().includes(keyword) ||
            String(item.classId).includes(keyword) ||
            (item.class_id ?? "").toLowerCase().includes(keyword)
          );
        })
      : bikeClasses;

    const sorted = [...filtered].sort((a, b) => {
      const directionMultiplier = sortState.direction === "asc" ? 1 : -1;

      if (sortState.key === "classId") {
        return (a.classId - b.classId) * directionMultiplier;
      }

      return a.className.localeCompare(b.className, "ja") * directionMultiplier;
    });

    return sorted;
  }, [bikeClasses, searchTerm, sortState]);

  const toggleClassSelection = (classId: number) => {
    setSelectedClassIds((current) => {
      const next = new Set(current);
      if (next.has(classId)) {
        next.delete(classId);
      } else {
        next.add(classId);
      }

      if (next.size === 0) {
        setDeleteConfirmationChecked(false);
      }

      return next;
    });
  };

  const handleDeleteSelectedClasses = async () => {
    const classIds = Array.from(selectedClassIds);

    if (classIds.length === 0) {
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const response = await fetch("/api/bike-classes", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ classIds }),
      });

      const responseData: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          responseData &&
          typeof responseData === "object" &&
          responseData !== null &&
          "message" in responseData &&
          typeof (responseData as { message?: unknown }).message === "string"
            ? ((responseData as { message: string }).message ?? "")
            : "クラスの削除に失敗しました。";
        throw new Error(message || "クラスの削除に失敗しました。");
      }

      const deletedIds = Array.isArray(
        (responseData as { deletedIds?: unknown })?.deletedIds
      )
        ? ((responseData as { deletedIds: unknown[] }).deletedIds.filter(
            (value): value is number => typeof value === "number"
          ))
        : classIds;

      setBikeClasses((current) =>
        current.filter((item) => !deletedIds.includes(item.classId))
      );
      setSelectedClassIds(new Set<number>());
      setDeleteConfirmationChecked(false);
    } catch (deleteError) {
      console.error("Failed to delete bike classes", deleteError);
      setDeleteError(
        deleteError instanceof Error
          ? deleteError.message
          : "クラスの削除に失敗しました。"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const selectedClassCount = selectedClassIds.size;
  const isDeleteDisabled =
    selectedClassCount === 0 || !deleteConfirmationChecked || isDeleting;

  const handleSort = (key: "classId" | "className") => {
    setSortState((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const handleSortKeyChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextKey = event.target.value as "classId" | "className";
    setSortState((current) => ({ key: nextKey, direction: current.direction }));
  };

  return (
    <>
      <Head>
        <title>バイククラス一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="バイククラス一覧"
        actions={[
          {
            label: "＋ バイククラス登録",
            href: "/admin/dashboard/bike-classes/register",
          },
        ]}
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
          {deleteError && <p className={formStyles.error}>{deleteError}</p>}
          <div className={formStyles.card}>
            <div className={styles.tableToolbar}>
              <div className={styles.tableToolbarGroup}>
                <input
                  type="search"
                  className={styles.tableSearchInput}
                  placeholder="クラス名やIDで検索"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  aria-label="クラス一覧を検索"
                />
              </div>
              <div className={styles.tableToolbarGroup}>
                <label>
                  <span className={tableStyles.visuallyHidden}>並び替え項目</span>
                  <select
                    className={styles.tableSelect}
                    value={sortState.key}
                    onChange={handleSortKeyChange}
                  >
                    <option value="classId">IDで並び替え</option>
                    <option value="className">クラス名で並び替え</option>
                  </select>
                </label>
                <button
                  type="button"
                  className={styles.tableToolbarButton}
                  onClick={() =>
                    setSortState((current) => ({
                      key: current.key,
                      direction: current.direction === "asc" ? "desc" : "asc",
                    }))
                  }
                >
                  {sortState.direction === "asc" ? "昇順" : "降順"}
                </button>
              </div>
              <div className={styles.tableToolbarGroup}>
                <span className={styles.tableSelectionCount}>
                  選択中: {selectedClassCount}件
                </span>
                <label className={styles.confirmationCheckboxLabel}>
                  <input
                    type="checkbox"
                    className={styles.confirmationCheckbox}
                    checked={deleteConfirmationChecked}
                    disabled={isDeleting || selectedClassCount === 0}
                    onChange={(event) =>
                      setDeleteConfirmationChecked(event.target.checked)
                    }
                  />
                  削除することを確認しました
                </label>
                <button
                  type="button"
                  className={styles.tableDangerButton}
                  disabled={isDeleteDisabled}
                  onClick={handleDeleteSelectedClasses}
                >
                  クラス削除
                </button>
              </div>
            </div>
            <div className={tableStyles.wrapper}>
              <table className={tableStyles.table}>
                <thead>
                  <tr>
                    <th
                      aria-sort={
                        sortState.key === "classId"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("classId")}
                      >
                        <span>ID</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "classId"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                          {sortState.key === "classId"
                            ? sortState.direction === "asc"
                              ? "昇順に並び替え"
                              : "降順に並び替え"
                            : "クリックして並び替え"}
                        </span>
                      </button>
                    </th>
                    <th scope="col">class_id</th>
                    <th
                      aria-sort={
                        sortState.key === "className"
                          ? sortState.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      <button
                        type="button"
                        className={tableStyles.sortableHeaderButton}
                        onClick={() => handleSort("className")}
                      >
                        <span>クラス名</span>
                        <span
                          aria-hidden
                          className={`${tableStyles.sortIcon} ${
                            sortState.key === "className"
                              ? sortState.direction === "asc"
                                ? tableStyles.sortIconAsc
                                : tableStyles.sortIconDesc
                              : ""
                          }`}
                        />
                        <span className={tableStyles.visuallyHidden}>
                      {sortState.key === "className"
                        ? sortState.direction === "asc"
                          ? "昇順に並び替え"
                          : "降順に並び替え"
                        : "クリックして並び替え"}
                      </span>
                    </button>
                  </th>
                  <th scope="col">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4}>登録済みのクラスはまだありません。</td>
                  </tr>
                ) : (
                  filteredClasses.map((item) => (
                    <tr key={item.classId}>
                      <td>
                        <label className={tableStyles.selectionLabel}>
                          <input
                            type="checkbox"
                            className={tableStyles.selectionCheckbox}
                            checked={selectedClassIds.has(item.classId)}
                            disabled={isDeleting}
                            onChange={() => toggleClassSelection(item.classId)}
                            aria-label={`クラスID ${item.classId} を削除対象として選択`}
                          />
                          <span>{item.classId}</span>
                        </label>
                      </td>
                      <td>{item.class_id ?? "-"}</td>
                      <td>{item.className}</td>
                      <td>
                        <Link
                          href={`/admin/dashboard/bike-classes/register?classId=${item.classId}`}
                          className={styles.tableToolbarButton}
                          aria-label={`クラスID ${item.classId} を編集`}
                        >
                          ✎ 編集
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}
