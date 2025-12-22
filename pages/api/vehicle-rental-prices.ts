import type { NextApiRequest, NextApiResponse } from "next";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { getDocumentClient } from "../../lib/dynamodb";

const TABLE_NAME =
  process.env.VEHICLE_RENTAL_PRICE_TABLE ||
  process.env.VEHICLE_RENTAL_PRICES_TABLE ||
  "vehicle_rental_prices";

type VehicleRentalPrice = {
  vehicle_type_id: string;
  days: number;
  price: number;
  createdAt?: string;
  updatedAt?: string;
};

const parseVehicleTypeId = (value: unknown): string | null => {
  if (Array.isArray(value)) {
    return parseVehicleTypeId(value[0]);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return null;
};

const parsePositiveInteger = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : Number(String(value));
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
};

const parsePrice = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : Number(String(value));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
};

async function handleGet(
  request: NextApiRequest,
  response: NextApiResponse<VehicleRentalPrice[] | { message: string }>
) {
  const vehicleTypeId = parseVehicleTypeId(request.query.vehicle_type_id);

  if (!vehicleTypeId) {
    response
      .status(400)
      .json({ message: "車種IDを正しく指定してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const result = await client.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "#vehicle_type_id = :vehicle_type_id",
        ExpressionAttributeNames: { "#vehicle_type_id": "vehicle_type_id" },
        ExpressionAttributeValues: { ":vehicle_type_id": vehicleTypeId },
      })
    );

    const items = ((result.Items ?? []) as VehicleRentalPrice[]).sort(
      (a, b) => a.days - b.days
    );

    response.status(200).json(items);
  } catch (error) {
    console.error("Failed to fetch vehicle rental prices", error);
    response
      .status(500)
      .json({ message: "料金情報の取得に失敗しました。" });
  }
}

async function handlePut(
  request: NextApiRequest,
  response: NextApiResponse<VehicleRentalPrice | { message: string }>
) {
  const { vehicle_type_id, days, price } = request.body ?? {};

  const vehicleTypeId = parseVehicleTypeId(vehicle_type_id);
  if (!vehicleTypeId) {
    response
      .status(400)
      .json({ message: "車種IDを正しく指定してください。" });
    return;
  }

  const normalizedDays = parsePositiveInteger(days);
  if (!normalizedDays) {
    response.status(400).json({ message: "日数を正しく指定してください。" });
    return;
  }

  const normalizedPrice = parsePrice(price);
  if (normalizedPrice == null) {
    response.status(400).json({ message: "料金を正しく入力してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const timestamp = new Date().toISOString();

    const existing = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { vehicle_type_id: vehicleTypeId, days: normalizedDays },
      })
    );

    const createdAt = (existing.Item as VehicleRentalPrice | undefined)?.createdAt;

    const item: VehicleRentalPrice = {
      vehicle_type_id: vehicleTypeId,
      days: normalizedDays,
      price: normalizedPrice,
      createdAt: createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
      })
    );

    response.status(200).json(item);
  } catch (error) {
    console.error("Failed to upsert vehicle rental price", error);
    response.status(500).json({ message: "料金の保存に失敗しました。" });
  }
}

async function handleDelete(
  request: NextApiRequest,
  response: NextApiResponse<{ deleted: boolean } | { message: string }>
) {
  const { vehicle_type_id, days } = request.body ?? {};
  const vehicleTypeId = parseVehicleTypeId(vehicle_type_id);
  const normalizedDays = parsePositiveInteger(days);

  if (!vehicleTypeId || !normalizedDays) {
    response
      .status(400)
      .json({ message: "車種IDと日数を正しく指定してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    await client.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { vehicle_type_id: vehicleTypeId, days: normalizedDays },
      })
    );

    response.status(200).json({ deleted: true });
  } catch (error) {
    console.error("Failed to delete vehicle rental price", error);
    response.status(500).json({ message: "料金の削除に失敗しました。" });
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    await handleGet(request, response);
    return;
  }

  if (request.method === "PUT") {
    await handlePut(request, response);
    return;
  }

  if (request.method === "DELETE") {
    await handleDelete(request, response);
    return;
  }

  response.setHeader("Allow", "GET,PUT,DELETE");
  response.status(405).end("Method Not Allowed");
}
