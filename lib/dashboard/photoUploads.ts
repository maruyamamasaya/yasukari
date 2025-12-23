export type PhotoUpload = {
  id: string;
  fileName: string;
  uploaderName: string;
  uploadedAt: string;
  status: "未確認" | "確認済み";
  imageUrl: string;
  notes: string;
};

export const PHOTO_UPLOADS: PhotoUpload[] = [
  {
    id: "upload-001",
    fileName: "bike-class-126-250.jpg",
    uploaderName: "山田 花子",
    uploadedAt: "2024-09-12 14:30",
    status: "未確認",
    imageUrl: "/image/category/126〜250cc.png",
    notes: "新しい車種のサンプル写真",
  },
  {
    id: "upload-002",
    fileName: "bike-class-251-400.jpg",
    uploaderName: "佐藤 健",
    uploadedAt: "2024-09-12 13:05",
    status: "確認済み",
    imageUrl: "/image/category/251〜400cc.png",
    notes: "店舗向けギャラリー用",
  },
  {
    id: "upload-003",
    fileName: "bike-class-400-plus.jpg",
    uploaderName: "鈴木 玲奈",
    uploadedAt: "2024-09-11 18:42",
    status: "未確認",
    imageUrl: "/image/category/400cc超.png",
    notes: "限定車両の追加写真",
  },
  {
    id: "upload-004",
    fileName: "scooter-basic.jpg",
    uploaderName: "高橋 亮",
    uploadedAt: "2024-09-11 16:12",
    status: "未確認",
    imageUrl: "/image/category/原付スクーター.png",
    notes: "初心者向けモデル",
  },
  {
    id: "upload-005",
    fileName: "scooter-125.jpg",
    uploaderName: "中村 麻衣",
    uploadedAt: "2024-09-10 12:27",
    status: "確認済み",
    imageUrl: "/image/category/原付二種スクーター.png",
    notes: "予約導線のバナー候補",
  },
  {
    id: "upload-006",
    fileName: "manual-bike.jpg",
    uploaderName: "加藤 悠斗",
    uploadedAt: "2024-09-10 09:45",
    status: "未確認",
    imageUrl: "/image/category/原付ミッション.png",
    notes: "新規追加のマニュアル車",
  },
  {
    id: "upload-007",
    fileName: "gyro-canopy-mini.jpg",
    uploaderName: "石井 直子",
    uploadedAt: "2024-09-09 19:00",
    status: "確認済み",
    imageUrl: "/image/category/ジャイロキャノビーミニカー.png",
    notes: "配送用モデルの更新",
  },
  {
    id: "upload-008",
    fileName: "gyro-canopy-50.jpg",
    uploaderName: "渡辺 翔",
    uploadedAt: "2024-09-09 16:10",
    status: "未確認",
    imageUrl: "/image/category/ジャイロキャノビー原付.png",
    notes: "車両一覧用の再撮影",
  },
];

export const findPhotoUpload = (uploadId?: string) => {
  if (!uploadId) {
    return null;
  }

  return PHOTO_UPLOADS.find((upload) => upload.id === uploadId) ?? null;
};
