export type ReservationStatus = "予約受付完了" | "入金待ち" | "キャンセル";

export type Reservation = {
  id: string;
  storeName: string;
  vehicleModel: string;
  vehicleCode: string;
  vehiclePlate: string;
  pickupAt: string;
  returnAt: string;
  status: ReservationStatus;
  paymentAmount: string;
  paymentId: string;
  paymentDate: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone: string;
  couponCode: string;
  couponDiscount: string;
  options: {
    vehicleCoverage: string;
    theftCoverage: string;
  };
  notes: string;
};

export const reservations: Reservation[] = [
  {
    id: "d4dankr1qb7c2b0um1j0",
    storeName: "三ノ輪店",
    vehicleModel: "CT125ハンターカブ",
    vehicleCode: "JA55-1014173",
    vehiclePlate: "台東区 み 9907",
    pickupAt: "2025-11-19T17:00:00+09:00",
    returnAt: "2025-11-23T17:00:00+09:00",
    status: "予約受付完了",
    paymentAmount: "12,800円",
    paymentId: "ch_0f5741bd411ca524f91ee9a281901",
    paymentDate: "2025/11/17 14:00",
    memberId: "cmvn9pb1qb7c2oe4l8e0",
    memberName: "テストテスト",
    memberEmail: "test@zm.commufa.jp",
    memberPhone: "",
    couponCode: "",
    couponDiscount: "0円",
    options: {
      vehicleCoverage: "なし",
      theftCoverage: "なし",
    },
    notes: "備考を編集",
  },
  {
    id: "d52nb8j1qb7c2b0um3lg",
    storeName: "足立小台店",
    vehicleModel: "CBR250RR-2",
    vehicleCode: "MC51-1001918",
    vehiclePlate: "1 足立 わ 802",
    pickupAt: "2026-01-11T10:00:00+09:00",
    returnAt: "2026-01-13T10:00:00+09:00",
    status: "予約受付完了",
    paymentAmount: "18,880円",
    paymentId: "ch_a2f4c178a8aec05ecbf2931b56100",
    paymentDate: "2025/12/20 00:56",
    memberId: "cfu1dir1qb7eqe1gr2o0",
    memberName: "",
    memberEmail: "k-hoj@ab.auone-net.jp",
    memberPhone: "",
    couponCode: "",
    couponDiscount: "0円",
    options: {
      vehicleCoverage: "あり",
      theftCoverage: "あり",
    },
    notes: "備考を編集",
  },
];
