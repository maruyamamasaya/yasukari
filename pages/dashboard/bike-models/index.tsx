import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import tableStyles from "../../../styles/AdminTable.module.css";

type BikeClass = {
  classId: number;
  className: string;
};

type BikeModel = {
  modelId: number;
  classId: number;
  modelName: string;
  publishStatus: "ON" | "OFF";
  displacementCc?: number;
  requiredLicense?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  seatHeightMm?: number;
  seatCapacity?: number;
  vehicleWeightKg?: number;
  fuelTankCapacityL?: number;
  fuelType?: string;
  maxPower?: string;
  maxTorque?: string;
  mainImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 20;

export default function BikeModelListPage() {
  const [models, setModels] = useState<BikeModel[]>([]);
  const [classes, setClasses] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [modelResponse, classResponse] = await Promise.all([
          fetch("/api/bike-models"),
          fetch("/api/bike-classes"),
        ]);

        if (!modelResponse.ok) {
          setMessage("車種一覧の取得に失敗しました。");
          return;
        }

        const modelData: BikeModel[] = await modelResponse.json();
        modelData.sort((a, b) => a.modelId - b.modelId);
        setModels(modelData);

        if (classResponse.ok) {
          const classData: BikeClass[] = await classResponse.json();
          const map = classData.reduce<Record<number, string>>((acc, item) => {
            acc[item.classId] = item.className;
            return acc;
          }, {});
          setClasses(map);
        }

        setMessage(null);
      } catch (error) {
        console.error("Failed to load bike models", error);
        setMessage("車種一覧の取得に失敗しました。");
      }
    };

    void load();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(models.length / PAGE_SIZE)), [
    models.length,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const paginated = models.slice(start, start + PAGE_SIZE);

  const formatValue = (value?: string | number) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }
    return value;
  };

  return (
    <AdminLayout title="車種一覧">
      {message ? <div className={tableStyles.message}>{message}</div> : null}
      <div className={tableStyles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>クラス</th>
              <th>車種名</th>
              <th>掲載</th>
              <th>排気量</th>
              <th>必要免許</th>
              <th>全長</th>
              <th>全幅</th>
              <th>全高</th>
              <th>シート高</th>
              <th>定員</th>
              <th>車両重量</th>
              <th>タンク容量</th>
              <th>燃料</th>
              <th>最高出力</th>
              <th>最大トルク</th>
              <th>画像URL</th>
              <th>作成日時</th>
              <th>更新日時</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={item.modelId}>
                <td>{item.modelId}</td>
                <td>{classes[item.classId] ?? item.classId}</td>
                <td>{item.modelName}</td>
                <td>
                  <span
                    className={`${tableStyles.status} ${
                      item.publishStatus === "ON" ? tableStyles.statusOn : tableStyles.statusOff
                    }`}
                  >
                    {item.publishStatus}
                  </span>
                </td>
                <td>{formatValue(item.displacementCc)}</td>
                <td>{formatValue(item.requiredLicense)}</td>
                <td>{formatValue(item.lengthMm)}</td>
                <td>{formatValue(item.widthMm)}</td>
                <td>{formatValue(item.heightMm)}</td>
                <td>{formatValue(item.seatHeightMm)}</td>
                <td>{formatValue(item.seatCapacity)}</td>
                <td>{formatValue(item.vehicleWeightKg)}</td>
                <td>{formatValue(item.fuelTankCapacityL)}</td>
                <td>{formatValue(item.fuelType)}</td>
                <td>{formatValue(item.maxPower)}</td>
                <td>{formatValue(item.maxTorque)}</td>
                <td>{formatValue(item.mainImageUrl)}</td>
                <td>{item.createdAt}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={19}>データがありません。</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className={tableStyles.pagination}>
        <div>
          {models.length} 件中 {paginated.length > 0 ? `${start + 1}-${start + paginated.length}` : 0} 件を表示
        </div>
        <div className={tableStyles.pageButtons}>
          <button
            type="button"
            className={tableStyles.pageButton}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            前へ
          </button>
          <button
            type="button"
            className={tableStyles.pageButton}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages}
          >
            次へ
          </button>
        </div>
      </div>
      <div className={tableStyles.pagination}>
        <Link href="/dashboard/bike-models/new" className={tableStyles.createLink}>
          ＋ 新規登録
        </Link>
      </div>
    </AdminLayout>
  );
}
