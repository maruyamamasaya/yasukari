import type { NextApiRequest, NextApiResponse } from "next";
import { GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDocumentClient } from "../../lib/dynamodb";

type Vehicle = {
  managementNumber: string;
  modelId: number;
  storeId: string;
  publishStatus: "ON" | "OFF";
  tags: string[];
  policyNumber1?: string;
  policyBranchNumber1?: string;
  policyNumber2?: string;
  policyBranchNumber2?: string;
  inspectionExpiryDate?: string;
  licensePlateNumber?: string;
  previousLicensePlateNumber?: string;
  liabilityInsuranceExpiryDate?: string;
  videoUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

const VEHICLES_TABLE = process.env.VEHICLES_TABLE ?? "Vehicles";
const MODELS_TABLE = process.env.BIKE_MODELS_TABLE ?? "BikeModels";

async function handleGet(response: NextApiResponse<Vehicle[] | { message: string }>) {
  try {
    const client = getDocumentClient();
    const result = await client.send(new ScanCommand({ TableName: VEHICLES_TABLE }));
    const items = (result.Items ?? []) as Vehicle[];
    items.sort((a, b) => a.managementNumber.localeCompare(b.managementNumber));
    response.status(200).json(items);
  } catch (error) {
    console.error("Failed to fetch vehicles", error);
    response.status(500).json({ message: "車両情報の取得に失敗しました。" });
  }
}

async function handlePost(
  request: NextApiRequest,
  response: NextApiResponse<Vehicle | { message: string }>
) {
  const {
    managementNumber,
    modelId,
    storeId,
    publishStatus,
    tags,
    policyNumber1,
    policyBranchNumber1,
    policyNumber2,
    policyBranchNumber2,
    inspectionExpiryDate,
    licensePlateNumber,
    previousLicensePlateNumber,
    liabilityInsuranceExpiryDate,
    videoUrl,
    notes,
  } = request.body ?? {};

  if (typeof managementNumber !== "string" || managementNumber.trim().length === 0) {
    response.status(400).json({ message: "管理番号を正しく入力してください。" });
    return;
  }

  if (typeof modelId !== "number") {
    response.status(400).json({ message: "車種を正しく選択してください。" });
    return;
  }

  if (typeof storeId !== "string" || storeId.trim().length === 0) {
    response.status(400).json({ message: "店舗IDを正しく入力してください。" });
    return;
  }

  if (publishStatus !== "ON" && publishStatus !== "OFF") {
    response.status(400).json({ message: "掲載状態を正しく選択してください。" });
    return;
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0).map((tag) => tag.trim())
    : [];

  try {
    const client = getDocumentClient();

    const [existingVehicle, modelResult] = await Promise.all([
      client.send(
        new GetCommand({
          TableName: VEHICLES_TABLE,
          Key: { managementNumber: managementNumber.trim() },
        })
      ),
      client.send(
        new GetCommand({
          TableName: MODELS_TABLE,
          Key: { modelId },
        })
      ),
    ]);

    if (existingVehicle.Item) {
      response.status(400).json({ message: "同じ管理番号の車両が既に存在します。" });
      return;
    }

    if (!modelResult.Item) {
      response.status(400).json({ message: "選択された車種が存在しません。" });
      return;
    }

    const timestamp = new Date().toISOString();
    const item: Vehicle = {
      managementNumber: managementNumber.trim(),
      modelId,
      storeId: storeId.trim(),
      publishStatus,
      tags: normalizedTags,
      policyNumber1:
        typeof policyNumber1 === "string" && policyNumber1.trim() ? policyNumber1.trim() : undefined,
      policyBranchNumber1:
        typeof policyBranchNumber1 === "string" && policyBranchNumber1.trim()
          ? policyBranchNumber1.trim()
          : undefined,
      policyNumber2:
        typeof policyNumber2 === "string" && policyNumber2.trim() ? policyNumber2.trim() : undefined,
      policyBranchNumber2:
        typeof policyBranchNumber2 === "string" && policyBranchNumber2.trim()
          ? policyBranchNumber2.trim()
          : undefined,
      inspectionExpiryDate:
        typeof inspectionExpiryDate === "string" && inspectionExpiryDate.trim()
          ? inspectionExpiryDate
          : undefined,
      licensePlateNumber:
        typeof licensePlateNumber === "string" && licensePlateNumber.trim()
          ? licensePlateNumber.trim()
          : undefined,
      previousLicensePlateNumber:
        typeof previousLicensePlateNumber === "string" && previousLicensePlateNumber.trim()
          ? previousLicensePlateNumber.trim()
          : undefined,
      liabilityInsuranceExpiryDate:
        typeof liabilityInsuranceExpiryDate === "string" && liabilityInsuranceExpiryDate.trim()
          ? liabilityInsuranceExpiryDate
          : undefined,
      videoUrl: typeof videoUrl === "string" && videoUrl.trim() ? videoUrl.trim() : undefined,
      notes: typeof notes === "string" && notes.trim() ? notes.trim() : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await client.send(
      new PutCommand({
        TableName: VEHICLES_TABLE,
        Item: item,
        ConditionExpression: "attribute_not_exists(managementNumber)",
      })
    );

    response.status(201).json(item);
  } catch (error) {
    console.error("Failed to create vehicle", error);
    response.status(500).json({ message: "車両の登録に失敗しました。" });
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
