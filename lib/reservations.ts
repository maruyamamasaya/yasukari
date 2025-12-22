import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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
  rentalDurationHours: number | null;
  rentalCompletedAt: string;
  reservationCompletedFlag: boolean;
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
  rental_duration_hours?: number;
  rentalDurationHours?: number;
  rental_completed_at?: string | number;
  rentalCompletedAt?: string | number;
  reservation_completed_flag?: boolean;
  reservationCompletedFlag?: boolean;
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

const numberFrom = (record: ReservationRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  return null;
};

const booleanFrom = (record: ReservationRecord, keys: string[], fallback = false): boolean => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
    if (value === "1" || value === 1) return true;
    if (value === "0" || value === 0) return false;
  }

  return fallback;
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
    rentalDurationHours: numberFrom(record, ["rental_duration_hours", "rentalDurationHours"]),
    rentalCompletedAt: datetimeFrom(record, ["rental_completed_at", "rentalCompletedAt", "completedAt"]),
    reservationCompletedFlag: booleanFrom(
      record,
      ["reservation_completed_flag", "reservationCompletedFlag"],
      false
    ),
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

export async function fetchReservationsByMember(memberId: string): Promise<Reservation[]> {
  const items = await scanAllItems<ReservationRecord>({ TableName: RESERVATIONS_TABLE });

  return items
    .map(normalizeReservation)
    .filter((reservation) => reservation.memberId === memberId)
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

type CreateReservationInput = {
  storeName: string;
  vehicleModel: string;
  vehicleCode: string;
  vehiclePlate: string;
  pickupAt: string;
  returnAt: string;
  status?: ReservationStatus;
  paymentAmount: number;
  paymentId: string;
  paymentDate?: string;
  rentalDurationHours?: number | null;
  rentalCompletedAt?: string;
  reservationCompletedFlag?: boolean;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberPhone?: string;
  couponCode?: string;
  couponDiscount?: number;
  options?: {
    vehicleCoverage?: string;
    theftCoverage?: string;
  };
  notes?: string;
};

const toIsoStringIfPossible = (value: string | number | undefined): string | undefined => {
  if (typeof value === "number") return new Date(value).toISOString();
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
};

export async function createReservation(
  input: CreateReservationInput
): Promise<Reservation> {
  const client = getDocumentClient();

  const reservationId = input.paymentId || `rs_${Date.now()}`;
  const paymentDate = toIsoStringIfPossible(input.paymentDate) ?? new Date().toISOString();
  const reservationRecord: ReservationRecord = {
    reservation_id: reservationId,
    store_name: input.storeName,
    vehicle_model: input.vehicleModel,
    vehicle_code: input.vehicleCode,
    vehicle_plate: input.vehiclePlate,
    pickup_at: toIsoStringIfPossible(input.pickupAt) ?? input.pickupAt,
    return_at: toIsoStringIfPossible(input.returnAt) ?? input.returnAt,
    status: input.status ?? "予約受付完了",
    payment_amount: input.paymentAmount,
    payment_id: input.paymentId,
    payment_date: paymentDate,
    rental_duration_hours: input.rentalDurationHours ?? null,
    rental_completed_at: toIsoStringIfPossible(input.rentalCompletedAt),
    reservation_completed_flag: input.reservationCompletedFlag ?? false,
    member_id: input.memberId,
    member_name: input.memberName,
    member_email: input.memberEmail,
    member_phone: input.memberPhone ?? "",
    coupon_code: input.couponCode ?? "",
    coupon_discount: input.couponDiscount ?? 0,
    options_vehicle_coverage: input.options?.vehicleCoverage ?? "",
    options_theft_coverage: input.options?.theftCoverage ?? "",
    notes: input.notes ?? "",
  };

  await client.send(
    new PutCommand({
      TableName: RESERVATIONS_TABLE,
      Item: reservationRecord,
    })
  );

  return normalizeReservation(reservationRecord);
}

export type { ReservationRecord };
