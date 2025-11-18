import Head from "next/head";
import { Fragment, KeyboardEvent, useState } from "react";

import DashboardLayout from "../../../components/dashboard/DashboardLayout";
import { Member, members } from "../../../lib/members";
import styles from "../../../styles/Dashboard.module.css";
import tableStyles from "../../../styles/AdminTable.module.css";
import memberStyles from "../../../styles/AdminMember.module.css";

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
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(
    members[0]?.id ?? null
  );

  const [noteEdits, setNoteEdits] = useState<Record<string, string>>(() =>
    members.reduce<Record<string, string>>((acc, member) => {
      acc[member.id] = member.notes;
      return acc;
    }, {})
  );

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    memberId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDetail(memberId);
    }
  };

  const toggleDetail = (memberId: string) => {
    setExpandedMemberId((prev) => (prev === memberId ? null : memberId));
  };

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
              行をクリックすると詳細が開きます。リストはダミーデータで構成されています。
            </p>
          </div>

          <div className={`${tableStyles.wrapper} ${tableStyles.tableWrapper}`}>
            <table className={`${tableStyles.table} ${tableStyles.dataTable}`}>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">メールアドレス</th>
                  <th scope="col">会員名</th>
                  <th scope="col">権限</th>
                  <th scope="col">海外ユーザー</th>
                  <th scope="col">状態</th>
                  <th scope="col">最終更新</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <Fragment key={member.id}>
                    <tr
                      className={`${tableStyles.clickableRow} ${
                        expandedMemberId === member.id ? tableStyles.selectedRow : ""
                      }`}
                      onClick={() => toggleDetail(member.id)}
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
                    {expandedMemberId === member.id && (
                      <tr>
                        <td colSpan={7}>
                          <div className={memberStyles.detailCard}>
                            <div className={memberStyles.detailHeader}>
                              <div>
                                <div className={memberStyles.detailTitle}>会員詳細</div>
                                <div className={memberStyles.metaRow}>
                                  <span>会員番号: {member.memberNumber}</span>
                                  <span>登録日時: {member.registeredAt}</span>
                                </div>
                              </div>
                              <span className={statusBadgeClassName(member.status)}>
                                {member.status}
                              </span>
                            </div>

                            <div className={memberStyles.fieldGrid}>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>会員名</div>
                                <div className={memberStyles.fieldValue}>
                                  {member.name} ({member.nameKana})
                                </div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>権限</div>
                                <div className={memberStyles.fieldValue}>{member.role}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>メールアドレス</div>
                                <div className={memberStyles.fieldValue}>{member.email}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>状態</div>
                                <div className={memberStyles.fieldValue}>{member.status}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>携帯電話</div>
                                <div className={memberStyles.fieldValue}>{member.mobilePhone}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>電話番号</div>
                                <div className={memberStyles.fieldValue}>{member.phoneNumber}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>生年月日</div>
                                <div className={memberStyles.fieldValue}>{member.birthDate}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>郵便番号</div>
                                <div className={memberStyles.fieldValue}>{member.postalCode}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>住所</div>
                                <div className={memberStyles.fieldValue}>{member.address}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>免許番号</div>
                                <div className={memberStyles.fieldValue}>{member.licenseNumber}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>通勤先名</div>
                                <div className={memberStyles.fieldValue}>{member.workplaceName}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>通勤先住所</div>
                                <div className={memberStyles.fieldValue}>{member.workplaceAddress}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>通勤先電話番号</div>
                                <div className={memberStyles.fieldValue}>{member.workplacePhone}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>その他連絡先名</div>
                                <div className={memberStyles.fieldValue}>{member.otherContactName}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>その他連絡先住所</div>
                                <div className={memberStyles.fieldValue}>{member.otherContactAddress}</div>
                              </div>
                              <div className={memberStyles.fieldBlock}>
                                <div className={memberStyles.fieldLabel}>その他連絡先電話番号</div>
                                <div className={memberStyles.fieldValue}>{member.otherContactPhone}</div>
                              </div>
                            </div>

                            <div className={memberStyles.noteArea}>
                              <div className={memberStyles.sectionTitle}>備考</div>
                              <textarea
                                className={memberStyles.noteTextarea}
                                value={noteEdits[member.id]}
                                onChange={(event) =>
                                  setNoteEdits((prev) => ({
                                    ...prev,
                                    [member.id]: event.target.value,
                                  }))
                                }
                                aria-label={`${member.name} の備考`}
                                placeholder="備考を編集"
                              />
                              <p className={memberStyles.sectionHelper}>
                                ここは編集できる感じのダミーUIです。保存の挙動はまだありません。
                              </p>
                            </div>

                            <div className={memberStyles.divider} />

                            <div>
                              <div className={memberStyles.sectionTitle}>予約一覧</div>
                              <p className={memberStyles.sectionHelper}>まだ予約はありません</p>
                            </div>

                            <div className={memberStyles.buttonRow}>
                              <button
                                type="button"
                                className={memberStyles.backButton}
                                onClick={() => setExpandedMemberId(null)}
                              >
                                一覧へ戻る
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardLayout>
    </>
  );
}
