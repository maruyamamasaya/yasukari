import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient } from "../../../lib/dynamodb";
import { formatDateKey } from "../../../lib/dashboard/utils";
import type {
  RentalAvailabilityMap,
  RentalAvailabilityStatus,
} from "../../../lib/dashboard/types";
import {
  fetchReservationById,
  Reservation,
  updateReservation,
} from "../../../lib/reservations";

type VehicleRecord = {
  managementNumber: string;
  rentalAvailability?: RentalAvailabilityMap;
  updatedAt?: string;
  [key: string]: unknown;
};

type ReservationDetailResponse = {
  reservation: Reservation;
};

const VEHICLES_TABLE = process.env.VEHICLES_TABLE ?? "Vehicles";

const isValidRentalStatus = (value: unknown): value is RentalAvailabilityStatus =>
  value === "AVAILABLE" ||
  value === "UNAVAILABLE" ||
  value === "MAINTENANCE" ||
  value === "RENTED" ||
  value === "RENTAL_COMPLETED";

const normalizeRentalAvailability = (value: unknown): RentalAvailabilityMap => {
  if (typeof value !== "object" || value === null) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<RentalAvailabilityMap>(
    (acc, [date, raw]) => {
      if (typeof date !== "string") {
        return acc;
      }

      if (typeof raw !== "object" || raw === null) {
        return acc;
      }

      const { status, note } = raw as Record<string, unknown>;
      if (!isValidRentalStatus(status)) {
        return acc;
      }

      acc[date] = {
        status,
        ...(typeof note === "string" && note.trim().length > 0 ? { note: note.trim() } : {}),
      };

      return acc;
    },
    {}
  );
};

const buildDateKeysInRange = (start: string, end: string): string[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return [];
  }

  const keys: string[] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    keys.push(formatDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
};

const buildAdminChangeNote = (renterName: string) => {
  const parts = [renterName.trim() || "名前未登録", "管理者により変更"];
  return Array.from(new Set(parts)).join(" / ");
};

const updateVehicleAvailability = async (
  managementNumber: string,
  updateMap: (current: RentalAvailabilityMap) => RentalAvailabilityMap
) => {
  const client = getDocumentClient();
  const response = await client.send(
    new GetCommand({
      TableName: VEHICLES_TABLE,
      Key: { managementNumber },
    })
  );

  if (!response.Item) {
    throw new Error(`Vehicle ${managementNumber} not found`);
  }

  const vehicle = response.Item as VehicleRecord;
  const currentAvailability = normalizeRentalAvailability(vehicle.rentalAvailability);
  const updatedAvailability = updateMap(currentAvailability);

  await client.send(
    new PutCommand({
      TableName: VEHICLES_TABLE,
      Item: {
        ...vehicle,
        rentalAvailability: updatedAvailability,
        updatedAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_exists(managementNumber)",
    })
  );
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ReservationDetailResponse | { error: string }>
) {
  const reservationId = req.query.reservationId;
  if (typeof reservationId !== "string") {
    return res.status(400).json({ error: "reservationId is required" });
  }

  if (req.method === "GET") {
    try {
      const reservation = await fetchReservationById(reservationId);
      if (!reservation) {
        return res.status(404).json({ error: "予約が見つかりませんでした" });
      }

      return res.status(200).json({ reservation });
    } catch (error) {
      console.error(`Failed to load reservation ${reservationId}`, error);
      return res.status(500).json({ error: "予約データの取得に失敗しました。" });
    }
  }

  if (req.method === "PATCH") {
    try {
      const existingReservation = await fetchReservationById(reservationId);
      if (!existingReservation) {
        return res.status(404).json({ error: "予約が見つかりませんでした" });
      }

      const body = req.body as Partial<Reservation> & { vehicleModel?: string };
      const updates: Partial<Reservation> = {};

      if (typeof body.vehicleCode === "string") {
        updates.vehicleCode = body.vehicleCode;
      }

      if (typeof body.vehiclePlate === "string") {
        updates.vehiclePlate = body.vehiclePlate;
      }

      if (body.vehicleCode || body.vehiclePlate) {
        if (body.vehicleModel && body.vehicleModel !== existingReservation.vehicleModel) {
          return res.status(400).json({ error: "同一車種の車両のみ選択できます" });
        }

        updates.vehicleChangedAt = body.vehicleChangedAt ?? new Date().toISOString();
        updates.vehicleChangeNotified = body.vehicleChangeNotified ?? false;
      }

      if (typeof body.status === "string") {
        updates.status = body.status;
      }

      if (typeof body.refundNote === "string") {
        updates.refundNote = body.refundNote;
      }

      if (typeof body.memberPhone === "string") {
        updates.memberPhone = body.memberPhone;
      }

      if (typeof body.memberCountryCode === "string") {
        updates.memberCountryCode = body.memberCountryCode;
      }

      if (typeof body.reservationCompletedFlag === "boolean") {
        updates.reservationCompletedFlag = body.reservationCompletedFlag;
      }

      if (typeof body.vehicleChangeNotified === "boolean" && !updates.vehicleChangedAt) {
        updates.vehicleChangeNotified = body.vehicleChangeNotified;
      }

      const reservation = await updateReservation(reservationId, updates);

      if (
        typeof updates.vehicleCode === "string" &&
        updates.vehicleCode !== existingReservation.vehicleCode
      ) {
        const dateKeys = buildDateKeysInRange(
          existingReservation.pickupAt,
          existingReservation.returnAt
        );
        if (dateKeys.length > 0) {
          const renterNote = buildAdminChangeNote(existingReservation.memberName);
          await updateVehicleAvailability(existingReservation.vehicleCode, (current) => {
            const next = { ...current };
            dateKeys.forEach((key) => {
              const entry = next[key];
              if (entry?.status === "RENTED" || entry?.status === "RENTAL_COMPLETED") {
                delete next[key];
              }
            });
            return next;
          });

          await updateVehicleAvailability(updates.vehicleCode, (current) => {
            const next = { ...current };
            dateKeys.forEach((key) => {
              next[key] = { status: "RENTED", note: renterNote };
            });
            return next;
          });
        }
      }

      return res.status(200).json({ reservation });
    } catch (error) {
      console.error(`Failed to update reservation ${reservationId}`, error);
      return res.status(500).json({ error: "予約データの更新に失敗しました。" });
    }
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
}
