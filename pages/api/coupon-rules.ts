import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { getDocumentClient } from "../../lib/dynamodb";
import { CouponRule } from "../../lib/dashboard/types";

const TABLE_NAME = process.env.COUPON_RULES_TABLE ?? "coupon_rules";

type CouponRuleResponse = CouponRule | CouponRule[] | { message: string };

type NormalizedIds = number[] | undefined | null;

type ValidatedCoupon = Omit<CouponRule, "updated_at">;

const parseNumberValue = (value: unknown): number | undefined | null => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

const normalizeIdArray = (value: unknown): NormalizedIds => {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const ids = value
    .map((item) => {
      if (typeof item === "number" && Number.isFinite(item)) {
        return item;
      }

      if (typeof item === "string") {
        const parsed = Number(item.trim());
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }

      return null;
    })
    .filter((id): id is number => typeof id === "number");

  return ids.length > 0 ? ids : undefined;
};

const validateCouponPayload = (
  payload: unknown,
  { isUpdate }: { isUpdate: boolean }
): ValidatedCoupon => {
  if (!payload || typeof payload !== "object") {
    throw new Error("入力内容を確認してください。");
  }

  const { title, coupon_code, start_date, end_date } = payload as Record<
    string,
    unknown
  >;
  const discountAmount = parseNumberValue(
    (payload as Record<string, unknown>).discount_amount
  );
  const discountPercentage = parseNumberValue(
    (payload as Record<string, unknown>).discount_percentage
  );

  const targetBikeClassIds = normalizeIdArray(
    (payload as Record<string, unknown>).target_bike_class_ids
  );
  const targetUserClassIds = normalizeIdArray(
    (payload as Record<string, unknown>).target_user_class_ids
  );

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("クーポンタイトルを入力してください。");
  }

  if (typeof coupon_code !== "string" || !coupon_code.trim()) {
    throw new Error("クーポンコードを入力してください。");
  }

  if (typeof start_date !== "string" || !start_date.trim()) {
    throw new Error("開始日を入力してください。");
  }

  if (typeof end_date !== "string" || !end_date.trim()) {
    throw new Error("終了日を入力してください。");
  }

  if (discountAmount === null) {
    throw new Error("割引額は数値で入力してください。");
  }

  if (discountPercentage === null) {
    throw new Error("割引率は数値で入力してください。");
  }

  if (discountAmount == null && discountPercentage == null) {
    throw new Error("割引額または割引率を入力してください。");
  }

  if (discountAmount != null && discountPercentage != null) {
    throw new Error("割引額と割引率はどちらか一方のみ入力してください。");
  }

  if (discountPercentage != null && (discountPercentage < 0 || discountPercentage > 100)) {
    throw new Error("割引率は0〜100の範囲で入力してください。");
  }

  return {
    coupon_code: coupon_code.trim(),
    title: title.trim(),
    start_date: start_date.trim(),
    end_date: end_date.trim(),
    discount_amount: discountAmount ?? undefined,
    discount_percentage: discountPercentage ?? undefined,
    target_bike_class_ids: targetBikeClassIds ?? undefined,
    target_user_class_ids: targetUserClassIds ?? undefined,
  };
};

async function handleGet(response: NextApiResponse<CouponRuleResponse>) {
  try {
    const client = getDocumentClient();
    const result = await client.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = ((result.Items ?? []) as CouponRule[]).sort((a, b) =>
      a.coupon_code.localeCompare(b.coupon_code)
    );

    response.status(200).json(items);
  } catch (error) {
    console.error("Failed to fetch coupon rules", error);
    response
      .status(500)
      .json({ message: "クーポン情報の取得に失敗しました。" });
  }
}

async function handlePost(
  request: NextApiRequest,
  response: NextApiResponse<CouponRuleResponse>
) {
  try {
    const coupon = validateCouponPayload(request.body, { isUpdate: false });
    const client = getDocumentClient();

    const item: CouponRule = {
      ...coupon,
      updated_at: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_not_exists(coupon_code)",
      })
    );

    response.status(201).json(item);
  } catch (error) {
    console.error("Failed to create coupon rule", error);
    response.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "クーポンの登録に失敗しました。",
    });
  }
}

async function handlePut(
  request: NextApiRequest,
  response: NextApiResponse<CouponRuleResponse>
) {
  try {
    const coupon = validateCouponPayload(request.body, { isUpdate: true });
    const client = getDocumentClient();

    const item: CouponRule = {
      ...coupon,
      updated_at: new Date().toISOString(),
    };

    await client.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: item,
        ConditionExpression: "attribute_exists(coupon_code)",
      })
    );

    response.status(200).json(item);
  } catch (error) {
    console.error("Failed to update coupon rule", error);
    response.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : "クーポンの更新に失敗しました。",
    });
  }
}

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<CouponRuleResponse>
) {
  switch (request.method) {
    case "GET":
      await handleGet(response);
      break;
    case "POST":
      await handlePost(request, response);
      break;
    case "PUT":
      await handlePut(request, response);
      break;
    default:
      response.setHeader("Allow", ["GET", "POST", "PUT"]);
      response.status(405).json({ message: "Method Not Allowed" });
  }
}
