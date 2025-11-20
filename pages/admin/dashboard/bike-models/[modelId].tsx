import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import DashboardLayout from "../../../../components/dashboard/DashboardLayout";
import formStyles from "../../../../styles/AdminForm.module.css";
import styles from "../../../../styles/Dashboard.module.css";
import { BikeClass, BikeModel, PublishStatus } from "../../../../lib/dashboard/types";
import { REQUIRED_LICENSE_OPTIONS } from "../../../../lib/dashboard/licenseOptions";
import { toNumber } from "../../../../lib/dashboard/utils";

export default function BikeModelDetailPage() {
  const router = useRouter();
  const modelIdParam = router.query.modelId;
  const modelId = useMemo(() => {
    const modelIdValue = Array.isArray(modelIdParam) ? modelIdParam[0] : modelIdParam;

    if (typeof modelIdValue !== "string") {
      return undefined;
    }

    return toNumber(modelIdValue);
  }, [modelIdParam]);

  const [bikeClasses, setBikeClasses] = useState<BikeClass[]>([]);
  const [model, setModel] = useState<BikeModel | null>(null);
  const [classError, setClassError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);
  const [detailForm, setDetailForm] = useState<ModelFormState | null>(null);
  const [isDetailEditing, setIsDetailEditing] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailSuccess, setDetailSuccess] = useState<string | null>(null);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  useEffect(() => {
    if (modelId == null) {
      return;
    }

    const loadData = async () => {
      try {
        const [classesResponse, modelsResponse] = await Promise.all([
          fetch("/api/bike-classes"),
          fetch("/api/bike-models"),
        ]);

        if (classesResponse.ok) {
          const classData: BikeClass[] = await classesResponse.json();
          setBikeClasses(classData.sort((a, b) => a.classId - b.classId));
          setClassError(null);
        } else {
          setClassError("クラス一覧の取得に失敗しました。");
        }

        if (modelsResponse.ok) {
          const modelData: BikeModel[] = await modelsResponse.json();
          const foundModel = modelData.find((item) => item.modelId === modelId) ?? null;

          if (!foundModel) {
            setModelError("指定の車種が見つかりませんでした。");
            setModel(null);
            return;
          }

          setModel(foundModel);
          setModelError(null);
        } else {
          setModelError("車種の取得に失敗しました。");
        }
      } catch (loadError) {
        console.error("Failed to load bike model detail", loadError);
        setClassError((prev) => prev ?? "クラス一覧の取得に失敗しました。");
        setModelError((prev) => prev ?? "車種の取得に失敗しました。");
      }
    };

    void loadData();
  }, [modelId]);

  useEffect(() => {
    if (!model) {
      setDetailForm(null);
      setIsDetailEditing(false);
      setDetailError(null);
      setDetailSuccess(null);
      return;
    }

    setDetailForm({
      classId: String(model.classId ?? ""),
      modelName: model.modelName ?? "",
      publishStatus: model.publishStatus ?? "ON",
      displacementCc: model.displacementCc?.toString() ?? "",
      requiredLicense: model.requiredLicense ?? "",
      lengthMm: model.lengthMm?.toString() ?? "",
      widthMm: model.widthMm?.toString() ?? "",
      heightMm: model.heightMm?.toString() ?? "",
      seatHeightMm: model.seatHeightMm?.toString() ?? "",
      seatCapacity: model.seatCapacity?.toString() ?? "",
      vehicleWeightKg: model.vehicleWeightKg?.toString() ?? "",
      fuelTankCapacityL: model.fuelTankCapacityL?.toString() ?? "",
      fuelType: model.fuelType ?? "",
      maxPower: model.maxPower ?? "",
      maxTorque: model.maxTorque ?? "",
      mainImageUrl: model.mainImageUrl ?? "",
    });
    setIsDetailEditing(false);
    setDetailError(null);
    setDetailSuccess(null);
  }, [model]);

  const classNameMap = useMemo(
    () =>
      bikeClasses.reduce<Record<number, string>>((acc, bikeClass) => {
        acc[bikeClass.classId] = bikeClass.className;
        return acc;
      }, {}),
    [bikeClasses]
  );

  const handleDetailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!model || !detailForm) {
      return;
    }

    if (!detailForm.modelName.trim()) {
      setDetailError("車種名を入力してください。");
      return;
    }

    if (!detailForm.classId) {
      setDetailError("クラスを選択してください。");
      return;
    }

    const updated: BikeModel = {
      ...model,
      classId: Number(detailForm.classId),
      modelName: detailForm.modelName.trim(),
      publishStatus: detailForm.publishStatus,
      displacementCc: toNumber(detailForm.displacementCc),
      requiredLicense: detailForm.requiredLicense,
      lengthMm: toNumber(detailForm.lengthMm),
      widthMm: toNumber(detailForm.widthMm),
      heightMm: toNumber(detailForm.heightMm),
      seatHeightMm: toNumber(detailForm.seatHeightMm),
      seatCapacity: toNumber(detailForm.seatCapacity),
      vehicleWeightKg: toNumber(detailForm.vehicleWeightKg),
      fuelTankCapacityL: toNumber(detailForm.fuelTankCapacityL),
      fuelType: detailForm.fuelType,
      maxPower: detailForm.maxPower,
      maxTorque: detailForm.maxTorque,
      mainImageUrl: detailForm.mainImageUrl,
    };

    setIsSavingDetail(true);
    setDetailError(null);
    setDetailSuccess(null);

    try {
      const response = await fetch(`/api/bike-models/${model.modelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!response.ok) {
        setDetailError("車種の更新に失敗しました。");
        return;
      }

      const updatedModel: BikeModel = await response.json();
      setModel(updatedModel);
      setDetailSuccess("車種情報を更新しました。");
      setIsDetailEditing(false);
    } catch (saveError) {
      console.error("Failed to update bike model", saveError);
      setDetailError("車種の更新に失敗しました。");
    } finally {
      setIsSavingDetail(false);
    }
  };

  const handleBack = () => {
    if (router.asPath !== "/admin/dashboard/bike-models") {
      void router.push("/admin/dashboard/bike-models");
      return;
    }

    router.back();
  };

  if (modelId == null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>車種詳細</title>
      </Head>
      <DashboardLayout
        title="車種詳細"
        actions={[{ label: "車種一覧へ戻る", href: "/admin/dashboard/bike-models" }]}
      >
        <div className={styles.detailHeader}>
          <h1 className={styles.detailTitle}>車種詳細</h1>
          <button type="button" className={styles.tableToolbarButton} onClick={handleBack}>
            戻る
          </button>
        </div>
        {classError && <p className={formStyles.error}>{classError}</p>}
        {modelError && <p className={formStyles.error}>{modelError}</p>}
        {model && (
          <form onSubmit={handleDetailSubmit}>
            <dl className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <dt>車種ID</dt>
                <dd>{model.modelId}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>車種名</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.modelName ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, modelName: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : (
                    model.modelName || "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>クラス</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <select
                        value={detailForm?.classId ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, classId: event.target.value } : prev
                          )
                        }
                      >
                        <option value="">クラスを選択</option>
                        {bikeClasses.map((item) => (
                          <option key={item.classId} value={item.classId}>
                            {item.className}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    classNameMap[model.classId] ?? "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>掲載状態</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <select
                        value={detailForm?.publishStatus ?? "ON"}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  publishStatus: event.target.value as PublishStatus,
                                }
                              : prev
                          )
                        }
                      >
                        <option value="ON">公開 (ON)</option>
                        <option value="OFF">非公開 (OFF)</option>
                      </select>
                    </div>
                  ) : (
                    model.publishStatus
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>排気量 (cc)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.displacementCc ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, displacementCc: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.displacementCc ? (
                    model.displacementCc.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>必要免許</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <select
                        value={detailForm?.requiredLicense ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, requiredLicense: event.target.value } : prev
                          )
                        }
                      >
                        <option value="">免許を選択</option>
                        {REQUIRED_LICENSE_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : model.requiredLicense ? (
                    model.requiredLicense
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>全長 (mm)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.lengthMm ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, lengthMm: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.lengthMm ? (
                    model.lengthMm.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>全幅 (mm)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.widthMm ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, widthMm: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.widthMm ? (
                    model.widthMm.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>全高 (mm)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.heightMm ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, heightMm: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.heightMm ? (
                    model.heightMm.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>シート高 (mm)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.seatHeightMm ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, seatHeightMm: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.seatHeightMm ? (
                    model.seatHeightMm.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>定員</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.seatCapacity ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, seatCapacity: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.seatCapacity ? (
                    model.seatCapacity.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>車両重量 (kg)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.vehicleWeightKg ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, vehicleWeightKg: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.vehicleWeightKg ? (
                    model.vehicleWeightKg.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>タンク容量 (L)</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.fuelTankCapacityL ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, fuelTankCapacityL: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.fuelTankCapacityL ? (
                    model.fuelTankCapacityL.toLocaleString()
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>燃料</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.fuelType ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, fuelType: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.fuelType ? (
                    model.fuelType
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>最高出力</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.maxPower ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, maxPower: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.maxPower ? (
                    model.maxPower
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>最大トルク</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.maxTorque ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, maxTorque: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.maxTorque ? (
                    model.maxTorque
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>メイン画像URL</dt>
                <dd>
                  {isDetailEditing ? (
                    <div className={formStyles.field}>
                      <input
                        value={detailForm?.mainImageUrl ?? ""}
                        onChange={(event) =>
                          setDetailForm((prev) =>
                            prev ? { ...prev, mainImageUrl: event.target.value } : prev
                          )
                        }
                      />
                    </div>
                  ) : model.mainImageUrl ? (
                    model.mainImageUrl
                  ) : (
                    "-"
                  )}
                </dd>
              </div>
              <div className={styles.detailItem}>
                <dt>作成日時</dt>
                <dd>{model.createdAt ?? "-"}</dd>
              </div>
              <div className={styles.detailItem}>
                <dt>更新日時</dt>
                <dd>{model.updatedAt ?? "-"}</dd>
              </div>
            </dl>
            <div className={styles.detailHeader}>
              <button
                type="button"
                className={styles.detailEditButton}
                onClick={() => setIsDetailEditing((current) => !current)}
                disabled={isSavingDetail || !detailForm}
                aria-pressed={isDetailEditing}
              >
                {isDetailEditing ? "閲覧に戻る" : "編集に切り替え"}
              </button>
            </div>
            {detailError && <p className={formStyles.error}>{detailError}</p>}
            {detailSuccess && <p className={formStyles.hint}>{detailSuccess}</p>}
            {isDetailEditing && (
              <div className={formStyles.actions}>
                <button
                  type="button"
                  className={styles.tableToolbarButton}
                  onClick={() => {
                    if (!model) {
                      return;
                    }
                    setDetailForm({
                      classId: String(model.classId ?? ""),
                      modelName: model.modelName ?? "",
                      publishStatus: model.publishStatus ?? "ON",
                      displacementCc: model.displacementCc?.toString() ?? "",
                      requiredLicense: model.requiredLicense ?? "",
                      lengthMm: model.lengthMm?.toString() ?? "",
                      widthMm: model.widthMm?.toString() ?? "",
                      heightMm: model.heightMm?.toString() ?? "",
                      seatHeightMm: model.seatHeightMm?.toString() ?? "",
                      seatCapacity: model.seatCapacity?.toString() ?? "",
                      vehicleWeightKg: model.vehicleWeightKg?.toString() ?? "",
                      fuelTankCapacityL: model.fuelTankCapacityL?.toString() ?? "",
                      fuelType: model.fuelType ?? "",
                      maxPower: model.maxPower ?? "",
                      maxTorque: model.maxTorque ?? "",
                      mainImageUrl: model.mainImageUrl ?? "",
                    });
                    setDetailError(null);
                    setDetailSuccess(null);
                    setIsDetailEditing(false);
                  }}
                >
                  変更を破棄
                </button>
                <button
                  type="submit"
                  className={formStyles.primaryButton}
                  disabled={isSavingDetail}
                >
                  {isSavingDetail ? "保存中..." : "変更を保存"}
                </button>
              </div>
            )}
          </form>
        )}
      </DashboardLayout>
    </>
  );
}

type ModelFormState = {
  classId: string;
  modelName: string;
  publishStatus: PublishStatus;
  displacementCc: string;
  requiredLicense: string;
  lengthMm: string;
  widthMm: string;
  heightMm: string;
  seatHeightMm: string;
  seatCapacity: string;
  vehicleWeightKg: string;
  fuelTankCapacityL: string;
  fuelType: string;
  maxPower: string;
  maxTorque: string;
  mainImageUrl: string;
};
