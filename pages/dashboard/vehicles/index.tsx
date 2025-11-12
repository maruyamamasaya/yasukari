import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminLayout from "../../../components/dashboard/AdminLayout";
import tableStyles from "../../../styles/AdminTable.module.css";

type BikeModel = {
  modelId: number;
  modelName: string;
};

type Vehicle = {
  managementNumber: string;
  modelId: number;
  storeId: string;
  publishStatus: "ON" | "OFF";
  tags: string[];
  policyNumber1?: string;
  policyBranchNumber1?: string;
  policyNumber2?: string;
  policyBranchNumber2?: string;
  inspectionExpiryDate?: string;
  licensePlateNumber?: string;
  previousLicensePlateNumber?: string;
  liabilityInsuranceExpiryDate?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const PAGE_SIZE = 20;

export default function VehicleListPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [models, setModels] = useState<Record<number, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        const [vehicleResponse, modelResponse] = await Promise.all([
          fetch("/api/vehicles"),
          fetch("/api/bike-models"),
        ]);

        if (!vehicleResponse.ok) {
          setMessage("車両一覧の取得に失敗しました。");
          return;
        }

        const vehicleData: Vehicle[] = await vehicleResponse.json();
        vehicleData.sort((a, b) => a.managementNumber.localeCompare(b.managementNumber));
        setVehicles(vehicleData);

        if (modelResponse.ok) {
          const modelData: BikeModel[] = await modelResponse.json();
          const map = modelData.reduce<Record<number, string>>((acc, item) => {
            acc[item.modelId] = item.modelName;
            return acc;
          }, {});
          setModels(map);
        }

        setMessage(null);
      } catch (error) {
        console.error("Failed to load vehicles", error);
        setMessage("車両一覧の取得に失敗しました。");
      }
    };

    void load();
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(vehicles.length / PAGE_SIZE)), [
    vehicles.length,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const start = (page - 1) * PAGE_SIZE;
  const paginated = vehicles.slice(start, start + PAGE_SIZE);

  const formatValue = (value?: string | number) => {
    if (value === undefined || value === null || value === "") {
      return "-";
    }
    return value;
  };

  const formatTags = (tags: string[]) => {
    return tags.length > 0 ? tags.join(", ") : "-";
  };

  return (
    <AdminLayout title="車両一覧">
      {message ? <div className={tableStyles.message}>{message}</div> : null}
      <div className={tableStyles.tableWrapper}>
        <table>
          <thead>
            <tr>
              <th>管理番号</th>
              <th>車種</th>
              <th>店舗ID</th>
              <th>掲載</th>
              <th>タグ</th>
              <th>証券番号1</th>
              <th>枝番1</th>
              <th>証券番号2</th>
              <th>枝番2</th>
              <th>車検満了日</th>
              <th>ナンバー</th>
              <th>旧ナンバー</th>
              <th>自賠責満了日</th>
              <th>動画URL</th>
              <th>メモ</th>
              <th>作成日時</th>
              <th>更新日時</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((item) => (
              <tr key={item.managementNumber}>
                <td>{item.managementNumber}</td>
                <td>{models[item.modelId] ?? item.modelId}</td>
                <td>{item.storeId}</td>
                <td>
                  <span
                    className={`${tableStyles.status} ${
                      item.publishStatus === "ON" ? tableStyles.statusOn : tableStyles.statusOff
                    }`}
                  >
                    {item.publishStatus}
                  </span>
                </td>
                <td>{formatTags(item.tags)}</td>
                <td>{formatValue(item.policyNumber1)}</td>
                <td>{formatValue(item.policyBranchNumber1)}</td>
                <td>{formatValue(item.policyNumber2)}</td>
                <td>{formatValue(item.policyBranchNumber2)}</td>
                <td>{formatValue(item.inspectionExpiryDate)}</td>
                <td>{formatValue(item.licensePlateNumber)}</td>
                <td>{formatValue(item.previousLicensePlateNumber)}</td>
                <td>{formatValue(item.liabilityInsuranceExpiryDate)}</td>
                <td>{formatValue(item.videoUrl)}</td>
                <td>{formatValue(item.notes)}</td>
                <td>{item.createdAt}</td>
                <td>{item.updatedAt}</td>
              </tr>
            ))}
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={17}>データがありません。</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className={tableStyles.pagination}>
        <div>
          {vehicles.length} 件中 {paginated.length > 0 ? `${start + 1}-${start + paginated.length}` : 0} 件を表示
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
        <Link href="/dashboard/vehicles/new" className={tableStyles.createLink}>
          ＋ 新規登録
        </Link>
      </div>
    </AdminLayout>
  );
}
