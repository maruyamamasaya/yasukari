import type { NextApiRequest, NextApiResponse } from "next";
import {
  BatchWriteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { generateNextNumericId, getDocumentClient } from "../../lib/dynamodb";
import { DurationPriceKey, DurationPriceMap } from "../../lib/dashboard/types";

type BikeClass = {
  classId: number;
  class_id?: string;
  className: string;
  base_prices?: DurationPriceMap;
  insurance_prices?: DurationPriceMap;
  extra_prices?: Partial<Record<string, number>>;
  theft_insurance?: number;
  createdAt: string;
  updatedAt: string;
};

const TABLE_NAME = process.env.BIKE_CLASSES_TABLE ?? "BikeClasses";
const durationKeys: DurationPriceKey[] = ["24h", "2d", "4d", "1w", "2w", "1m"];

function normalizeClassIdentifier(raw: unknown): string | undefined {
  if (typeof raw !== "string") {
    return undefined;
  }

  const numericPart = raw.match(/\d+/)?.[0];
  if (!numericPart) {
    return undefined;
  }

  return `class_${numericPart}`;
}

function normalizePriceValue(raw: unknown): number | undefined {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw;
  }

  if (typeof raw === "string") {
    const sanitized = raw.replace(/,/g, "").trim();
    if (!sanitized) {
      return undefined;
    }

    const numericValue = Number(sanitized);
    if (!Number.isFinite(numericValue)) {
      return undefined;
    }

    return numericValue;
  }

  return undefined;
}

function normalizePriceMap(
  prices: unknown,
  allowedKeys: readonly string[]
): Record<string, number> | undefined {
  if (!prices || typeof prices !== "object") {
    return undefined;
  }

  const entries = Object.entries(prices as Record<string, unknown>)
    .filter(([key]) => allowedKeys.includes(key))
    .map(([key, value]) => {
      const normalizedValue = normalizePriceValue(value);
      return normalizedValue == null ? null : ([key, normalizedValue] as const);
    })
    .filter((value): value is [string, number] => Boolean(value));

  if (entries.length === 0) {
    return undefined;
  }

  return Object.fromEntries(entries);
}

async function handleGet(response: NextApiResponse<BikeClass[] | { message: string }>) {
  try {
    const client = getDocumentClient();
    const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = (result.Items ?? []) as BikeClass[];
    items.sort((a, b) => a.classId - b.classId);
    response.status(200).json(items);
  } catch (error) {
    console.error("Failed to fetch bike classes", error);
    response.status(500).json({ message: "クラス情報の取得に失敗しました。" });
  }
}

async function handlePost(
  request: NextApiRequest,
  response: NextApiResponse<BikeClass | { message: string }>
) {
  const {
    className,
    class_id,
    base_prices,
    insurance_prices,
    extra_prices,
    theft_insurance,
  } = request.body ?? {};

  if (typeof className !== "string" || className.trim().length === 0) {
    response.status(400).json({ message: "クラス名を正しく入力してください。" });
    return;
  }

  const normalizedClassIdentifier = normalizeClassIdentifier(class_id);
  if (class_id && !normalizedClassIdentifier) {
    response.status(400).json({ message: "ID欄には数字を含めて入力してください。" });
    return;
  }

  const normalizedBasePrices = normalizePriceMap(base_prices, durationKeys);
  const normalizedInsurancePrices = normalizePriceMap(
    insurance_prices,
    durationKeys
  );
  const normalizedExtraPrices = normalizePriceMap(extra_prices, durationKeys);
  const normalizedTheftInsurance = normalizePriceValue(theft_insurance);

  try {
    const client = getDocumentClient();
    const timestamp = new Date().toISOString();
    const classId = await generateNextNumericId(TABLE_NAME, "classId");
    const item: BikeClass = {
      classId,
      class_id: normalizedClassIdentifier,
      className: className.trim(),
      base_prices: normalizedBasePrices,
      insurance_prices: normalizedInsurancePrices,
      extra_prices: normalizedExtraPrices,
      theft_insurance: normalizedTheftInsurance,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(classId)",
      })
    );

    response.status(201).json(item);
  } catch (error) {
    console.error("Failed to create bike class", error);
    response.status(500).json({ message: "クラスの登録に失敗しました。" });
  }
}

async function handlePut(
  request: NextApiRequest,
  response: NextApiResponse<BikeClass | { message: string }>
) {
  const {
    classId,
    className,
    class_id,
    base_prices,
    insurance_prices,
    extra_prices,
    theft_insurance,
  } = request.body ?? {};

  if (typeof classId !== "number") {
    response.status(400).json({ message: "クラスIDを正しく指定してください。" });
    return;
  }

  if (typeof className !== "string" || className.trim().length === 0) {
    response.status(400).json({ message: "クラス名を正しく入力してください。" });
    return;
  }

  const normalizedClassIdentifier = normalizeClassIdentifier(class_id);
  if (class_id && !normalizedClassIdentifier) {
    response.status(400).json({ message: "ID欄には数字を含めて入力してください。" });
    return;
  }

  const normalizedBasePrices = normalizePriceMap(base_prices, durationKeys);
  const normalizedInsurancePrices = normalizePriceMap(
    insurance_prices,
    durationKeys
  );
  const normalizedExtraPrices = normalizePriceMap(extra_prices, durationKeys);
  const normalizedTheftInsurance = normalizePriceValue(theft_insurance);

  try {
    const client = getDocumentClient();
    const timestamp = new Date().toISOString();
    const currentItemResult = await client.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { classId },
      })
    );

    const currentItem = currentItemResult.Item as BikeClass | undefined;
    if (!currentItem) {
      response.status(404).json({ message: "クラスが見つかりませんでした。" });
      return;
    }

    const updatedItem: BikeClass = {
      ...currentItem,
      className: className.trim(),
      class_id: normalizedClassIdentifier,
      base_prices: normalizedBasePrices,
      insurance_prices: normalizedInsurancePrices,
      extra_prices: normalizedExtraPrices,
      theft_insurance: normalizedTheftInsurance,
      updatedAt: timestamp,
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: updatedItem,
        ConditionExpression: "attribute_exists(classId)",
      })
    );

    response.status(200).json(updatedItem);
  } catch (error) {
    console.error("Failed to update bike class", error);
    const errorName = (error as { name?: string } | null)?.name;
    if (errorName === "ConditionalCheckFailedException") {
      response.status(404).json({ message: "クラスが見つかりませんでした。" });
      return;
    }
    response.status(500).json({ message: "クラスの更新に失敗しました。" });
  }
}

async function handleDelete(
  request: NextApiRequest,
  response: NextApiResponse<{ deletedIds: number[] } | { message: string }>
) {
  const { classIds } = request.body ?? {};

  if (!Array.isArray(classIds)) {
    response.status(400).json({ message: "削除対象のクラスIDを指定してください。" });
    return;
  }

  const normalizedIds = classIds.filter(
    (value): value is number => typeof value === "number"
  );

  if (normalizedIds.length === 0) {
    response.status(400).json({ message: "削除対象のクラスIDを指定してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const chunkSize = 25;

    for (let i = 0; i < normalizedIds.length; i += chunkSize) {
      const chunk = normalizedIds.slice(i, i + chunkSize);

      await client.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: chunk.map((classId) => ({
              DeleteRequest: { Key: { classId } },
            })),
          },
        })
      );
    }

    response.status(200).json({ deletedIds: normalizedIds });
  } catch (error) {
    console.error("Failed to delete bike classes", error);
    response.status(500).json({ message: "クラスの削除に失敗しました。" });
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method === "GET") {
    await handleGet(response);
    return;
  }

  if (request.method === "POST") {
    await handlePost(request, response);
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

  response.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
  response.status(405).json({ message: "Method Not Allowed" });
}
