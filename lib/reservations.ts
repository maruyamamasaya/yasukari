import { GetCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient, scanAllItems } from "./dynamodb";

export type ReservationStatus =
  | "予約受付完了"
  | "入金待ち"
  | "キャンセル"
  | (string & {});

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

type ReservationRecord = {
  reservation_id: string;
  store_name?: string;
  store?: string;
  storeName?: string;
  vehicle_model?: string;
  vehicleModel?: string;
  vehicle_code?: string;
  vehicleCode?: string;
  vehicle_plate?: string;
  vehiclePlate?: string;
  pickup_at?: string | number;
  pickupAt?: string | number;
  return_at?: string | number;
  returnAt?: string | number;
  status?: string;
  payment_amount?: string | number;
  paymentAmount?: string | number;
  payment_id?: string;
  paymentId?: string;
  payment_date?: string | number;
  paymentDate?: string | number;
  member_id?: string;
  memberId?: string;
  member_name?: string;
  memberName?: string;
  member_email?: string;
  memberEmail?: string;
  member_phone?: string;
  memberPhone?: string;
  coupon_code?: string;
  couponCode?: string;
  coupon_discount?: string | number;
  couponDiscount?: string | number;
  options_vehicle_coverage?: string;
  vehicleCoverage?: string;
  options_theft_coverage?: string;
  theftCoverage?: string;
  notes?: string;
  [key: string]: unknown;
};

const RESERVATIONS_TABLE = process.env.RESERVATIONS_TABLE ?? "yoyakuKanri";

const stringFrom = (record: ReservationRecord, keys: string[], fallback = ""): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toLocaleString("ja-JP");
  }

  return fallback;
};

const datetimeFrom = (record: ReservationRecord, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return new Date(value).toISOString();
    if (value instanceof Date) return value.toISOString();
  }

  return "";
};

const normalizeReservation = (record: ReservationRecord): Reservation => {
  return {
    id: stringFrom(record, ["reservation_id", "reservationId", "id"], "(不明なID)"),
    storeName: stringFrom(record, ["store_name", "storeName", "store"], "未設定"),
    vehicleModel: stringFrom(record, ["vehicle_model", "vehicleModel"], "-"),
    vehicleCode: stringFrom(record, ["vehicle_code", "vehicleCode"], "-"),
    vehiclePlate: stringFrom(record, ["vehicle_plate", "vehiclePlate"], "-"),
    pickupAt: datetimeFrom(record, ["pickup_at", "pickupAt", "pickup_datetime"]),
    returnAt: datetimeFrom(record, ["return_at", "returnAt", "return_datetime"]),
    status: stringFrom(record, ["status"], "ステータス未設定"),
    paymentAmount: stringFrom(record, ["payment_amount", "paymentAmount"], "-"),
    paymentId: stringFrom(record, ["payment_id", "paymentId"], "-"),
    paymentDate: datetimeFrom(record, ["payment_date", "paymentDate"]),
    memberId: stringFrom(record, ["member_id", "memberId"], "-"),
    memberName: stringFrom(record, ["member_name", "memberName"], "-"),
    memberEmail: stringFrom(record, ["member_email", "memberEmail"], "-"),
    memberPhone: stringFrom(record, ["member_phone", "memberPhone"], ""),
    couponCode: stringFrom(record, ["coupon_code", "couponCode"], ""),
    couponDiscount: stringFrom(record, ["coupon_discount", "couponDiscount"], ""),
    options: {
      vehicleCoverage: stringFrom(
        record,
        ["options_vehicle_coverage", "vehicleCoverage"],
        "-"
      ),
      theftCoverage: stringFrom(record, ["options_theft_coverage", "theftCoverage"], "-"),
    },
    notes: stringFrom(record, ["notes"], ""),
  };
};

export async function fetchAllReservations(): Promise<Reservation[]> {
  const items = await scanAllItems<ReservationRecord>({ TableName: RESERVATIONS_TABLE });
  return items
    .map(normalizeReservation)
    .sort((a, b) => (a.pickupAt || "") > (b.pickupAt || "") ? -1 : 1);
}

export async function fetchReservationById(reservationId: string): Promise<Reservation | null> {
  const client = getDocumentClient();
  const response = await client.send(
    new GetCommand({
      TableName: RESERVATIONS_TABLE,
      Key: { reservation_id: reservationId },
    })
  );

  const record = response.Item as ReservationRecord | undefined;
  if (!record) {
    return null;
  }

  return normalizeReservation(record);
}

export type { ReservationRecord };
