import Head from "next/head";
import { Fragment, KeyboardEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";

import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import type { Member } from "../../../../lib/members";
import styles from "../../../../styles/Dashboard.module.css";
import tableStyles from "../../../../styles/AdminTable.module.css";
import memberStyles from "../../../../styles/AdminMember.module.css";

const statusBadgeClassName = (status: Member["status"]): string => {
  if (status === "認証済") {
    return `${memberStyles.statusBadge} ${memberStyles.statusBadgeOn}`;
  }

  if (status === "未認証") {
    return `${memberStyles.statusBadge} ${memberStyles.statusBadgePending}`;
  }

  return `${memberStyles.statusBadge} ${memberStyles.statusBadgeOff}`;
};

export default function MemberListPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openMemberDetail = (memberId: string) => {
    router.push(`/admin/dashboard/members/${memberId}`);
  };

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    memberId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMemberDetail(memberId);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadMembers = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await fetch("/api/admin/members");
        if (!response.ok) {
          throw new Error("会員情報の取得に失敗しました。");
        }
        const data = (await response.json()) as { members?: Member[] };
        if (isMounted) {
          setMembers(data.members ?? []);
        }
      } catch (error) {
        console.error("Failed to load members", error);
        if (isMounted) {
          setErrorMessage("会員情報の取得に失敗しました。");
          setMembers([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMembers();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <Head>
        <title>会員一覧 | 管理ダッシュボード</title>
      </Head>
      <DashboardLayout
        title="会員管理"
        description="会員情報の確認や状態の把握を行うためのダッシュボードです。"
      >
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>会員一覧</h2>
            <p className={styles.sectionDescription}>
              行をクリックすると別ページで詳細が開きます。Cognito と DynamoDB の会員情報を集約表示します。
            </p>
            {isLoading && (
              <p className={styles.sectionDescription}>会員情報を読み込み中です...</p>
            )}
            {errorMessage && (
              <p className={styles.sectionDescription}>{errorMessage}</p>
            )}
          </div>

          <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th scope="col" aria-label="会員番号"></th>
                  <th scope="col">メールアドレス</th>
                  <th scope="col">会員名</th>
                  <th scope="col">権限</th>
                  <th scope="col">海外ユーザー</th>
                  <th scope="col">状態</th>
                  <th scope="col">最終更新</th>
                </tr>
              </thead>
              <tbody>
                {!isLoading && members.length === 0 ? (
                  <tr>
                    <td colSpan={7}>該当する会員が見つかりませんでした。</td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <Fragment key={member.id}>
                      <tr
                        className={tableStyles.clickableRow}
                        onClick={() => openMemberDetail(member.id)}
                        onKeyDown={(event) => handleRowKeyDown(event, member.id)}
                        tabIndex={0}
                        aria-label={`${member.name} の詳細を開く`}
                      >
                        <td className={tableStyles.monospace}>{member.memberNumber}</td>
                        <td>{member.email}</td>
                        <td>{member.name}</td>
                        <td>{member.role}</td>
                        <td>{member.isInternational ? "海外利用あり" : "国内のみ"}</td>
                        <td>
                          <span className={statusBadgeClassName(member.status)}>
                            {member.status}
                          </span>
                        </td>
                        <td>{member.updatedAt}</td>
                      </tr>
                    </Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}
