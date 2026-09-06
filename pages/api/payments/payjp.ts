import type { NextApiRequest, NextApiResponse } from "next";

import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from "../../../lib/cognitoServer";
import { getPayjpSecretKey, getPayjpSecretKeyError } from "../../../lib/payjpServer";
import { getServerRentalPrice } from "../../../lib/server/rentalPrice";

type PayjpChargeRequest = {
  token?: string;
  amount?: number;
  description?: string;
  metadata?: Record<string, string>;
  email?: string;
  pricing?: {
    vehicleModelId?: number;
    rentalDays?: number;
    rentalFee?: number;
    priceMultiplier?: number;
    accessoryTotal?: number;
    protectionTotal?: number;
    highSeasonAndDiscountTotal?: number;
  };
};

type PayjpChargeResponse = {
  chargeId: string;
  amount: number;
  paidAt?: string;
};

const buildMetadataParams = (metadata?: Record<string, string>) => {
  const params = new URLSearchParams();
  if (!metadata) return params;

  Object.entries(metadata).forEach(([key, value]) => {
    params.append(`metadata[${key}]`, value);
  });

  return params;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PayjpChargeResponse | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method ?? "unknown"} Not Allowed` });
  }

  const token = req.cookies?.[COGNITO_ID_TOKEN_COOKIE];
  const payload = await verifyCognitoIdToken(token);
  if (!payload?.sub) {
    return res.status(401).json({ error: "認証が必要です" });
  }

  const body = req.body as PayjpChargeRequest;
  if (!body.token || !body.amount) {
    return res.status(400).json({ error: "token と amount が必要です。" });
  }

  const pricing = body.pricing;
  const isExtensionCharge = Boolean(body.metadata?.reservationId && body.metadata?.extensionDays);
  if ((!pricing || !pricing.vehicleModelId || !pricing.rentalDays) && !isExtensionCharge) {
    return res.status(400).json({ error: "料金情報が不足しています。お見積りからやり直してください。" });
  }

  if (pricing) {
    try {
      const baseRentalPrice = await getServerRentalPrice(pricing.vehicleModelId, pricing.rentalDays);
      if (baseRentalPrice == null) {
        return res.status(409).json({ error: "レンタル料金を確認できないため決済できません。" });
      }
      const multiplier = pricing.priceMultiplier === 2 ? 2 : 1;
      const expectedRentalFee = Math.round(baseRentalPrice * multiplier);
      const components = [pricing.accessoryTotal, pricing.protectionTotal, pricing.highSeasonAndDiscountTotal];
      if (components.some((value) => typeof value !== "number" || !Number.isFinite(value))) {
        return res.status(400).json({ error: "料金の内訳が不正です。" });
      }
      const expectedAmount = expectedRentalFee + components.reduce((sum, value) => sum + (value as number), 0);
      if (pricing.rentalFee !== expectedRentalFee || body.amount !== expectedAmount) {
        return res.status(409).json({ error: "料金が更新されました。お見積りを再確認してください。" });
      }
    } catch (error) {
      console.error("Failed to verify charge amount", error);
      return res.status(500).json({ error: "料金の検証に失敗しました。" });
    }
  }

  try {
    const secretKeyError = getPayjpSecretKeyError(body.email);
    if (secretKeyError) {
      return res.status(500).json({ error: secretKeyError });
    }

    const secretKey = getPayjpSecretKey(body.email);
    const basicAuth = Buffer.from(`${secretKey}:`).toString("base64");

    const params = new URLSearchParams({
      amount: body.amount.toString(),
      currency: "jpy",
      card: body.token,
      capture: "true",
    });

    if (body.description) {
      params.append("description", body.description);
    }

    buildMetadataParams(body.metadata).forEach((value, key) => {
      params.append(key, value);
    });

    const response = await fetch("https://api.pay.jp/v1/charges", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const responseData = (await response.json()) as {
      id?: string;
      amount?: number;
      created?: number;
      paid?: boolean;
      error?: { message?: string };
    };

    if (!response.ok || !responseData.id) {
      return res.status(400).json({ error: responseData.error?.message ?? "決済に失敗しました。" });
    }

    const paidAt = responseData.created ? new Date(responseData.created * 1000).toISOString() : undefined;

    return res.status(200).json({
      chargeId: responseData.id,
      amount: responseData.amount ?? body.amount,
      paidAt,
    });
  } catch (error) {
    console.error("Failed to create Pay.JP charge", error);
    return res.status(500).json({ error: "決済処理中にエラーが発生しました。" });
  }
}
