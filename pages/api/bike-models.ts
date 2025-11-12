import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { generateNextNumericId, getDocumentClient } from "../../lib/dynamodb";

type BikeModel = {
  modelId: number;
  classId: number;
  modelName: string;
  publishStatus: "ON" | "OFF";
  displacementCc?: number;
  requiredLicense?: string;
  lengthMm?: number;
  widthMm?: number;
  heightMm?: number;
  seatHeightMm?: number;
  seatCapacity?: number;
  vehicleWeightKg?: number;
  fuelTankCapacityL?: number;
  fuelType?: string;
  maxPower?: string;
  maxTorque?: string;
  mainImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

const MODELS_TABLE = process.env.BIKE_MODELS_TABLE ?? "BikeModels";
const CLASSES_TABLE = process.env.BIKE_CLASSES_TABLE ?? "BikeClasses";

async function handleGet(response: NextApiResponse<BikeModel[] | { message: string }>) {
  try {
    const client = getDocumentClient();
    const result = await client.send(new ScanCommand({ TableName: MODELS_TABLE }));
    const items = (result.Items ?? []) as BikeModel[];
    items.sort((a, b) => a.modelId - b.modelId);
    response.status(200).json(items);
  } catch (error) {
    console.error("Failed to fetch bike models", error);
    response.status(500).json({ message: "車種情報の取得に失敗しました。" });
  }
}

async function handlePost(
  request: NextApiRequest,
  response: NextApiResponse<BikeModel | { message: string }>
) {
  const {
    classId,
    modelName,
    publishStatus,
    displacementCc,
    requiredLicense,
    lengthMm,
    widthMm,
    heightMm,
    seatHeightMm,
    seatCapacity,
    vehicleWeightKg,
    fuelTankCapacityL,
    fuelType,
    maxPower,
    maxTorque,
    mainImageUrl,
  } = request.body ?? {};

  if (typeof classId !== "number") {
    response.status(400).json({ message: "所属クラスを正しく選択してください。" });
    return;
  }

  if (typeof modelName !== "string" || modelName.trim().length === 0) {
    response.status(400).json({ message: "車種名を正しく入力してください。" });
    return;
  }

  if (publishStatus !== "ON" && publishStatus !== "OFF") {
    response.status(400).json({ message: "掲載状態を正しく選択してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const classResult = await client.send(
      new GetCommand({
        TableName: CLASSES_TABLE,
        Key: { classId },
      })
    );

    if (!classResult.Item) {
      response.status(400).json({ message: "選択されたクラスが存在しません。" });
      return;
    }

    const timestamp = new Date().toISOString();
    const modelId = await generateNextNumericId(MODELS_TABLE, "modelId");
    const item: BikeModel = {
      modelId,
      classId,
      modelName: modelName.trim(),
      publishStatus,
      displacementCc: typeof displacementCc === "number" ? displacementCc : undefined,
      requiredLicense: typeof requiredLicense === "string" && requiredLicense.trim()
        ? requiredLicense.trim()
        : undefined,
      lengthMm: typeof lengthMm === "number" ? lengthMm : undefined,
      widthMm: typeof widthMm === "number" ? widthMm : undefined,
      heightMm: typeof heightMm === "number" ? heightMm : undefined,
      seatHeightMm: typeof seatHeightMm === "number" ? seatHeightMm : undefined,
      seatCapacity: typeof seatCapacity === "number" ? seatCapacity : undefined,
      vehicleWeightKg: typeof vehicleWeightKg === "number" ? vehicleWeightKg : undefined,
      fuelTankCapacityL:
        typeof fuelTankCapacityL === "number" ? fuelTankCapacityL : undefined,
      fuelType: typeof fuelType === "string" && fuelType.trim() ? fuelType.trim() : undefined,
      maxPower: typeof maxPower === "string" && maxPower.trim() ? maxPower.trim() : undefined,
      maxTorque:
        typeof maxTorque === "string" && maxTorque.trim() ? maxTorque.trim() : undefined,
      mainImageUrl:
        typeof mainImageUrl === "string" && mainImageUrl.trim()
          ? mainImageUrl.trim()
          : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await client.send(
      new PutCommand({
        TableName: MODELS_TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(modelId)",
      })
    );

    response.status(201).json(item);
  } catch (error) {
    console.error("Failed to create bike model", error);
    response.status(500).json({ message: "車種の登録に失敗しました。" });
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

  response.setHeader("Allow", ["GET", "POST"]);
  response.status(405).json({ message: "Method Not Allowed" });
}
