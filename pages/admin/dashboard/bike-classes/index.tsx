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
            String(item.classId).includes(keyword)
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
        actions={
          <Link href="/admin/dashboard/bike-classes/register" className={styles.iconButton}>
            <span aria-hidden>＋</span>
            バイククラス登録
          </Link>
        }
      >
        <section className={styles.section}>
          {error && <p className={formStyles.error}>{error}</p>}
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
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.length === 0 ? (
                    <tr>
                      <td colSpan={2}>登録済みのクラスはまだありません。</td>
                    </tr>
                  ) : (
                    filteredClasses.map((item) => (
                      <tr key={item.classId}>
                        <td>{item.classId}</td>
                        <td>{item.className}</td>
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
