import type { NextApiRequest, NextApiResponse } from "next";
import { PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { generateNextNumericId, getDocumentClient } from "../../lib/dynamodb";

type BikeClass = {
  classId: number;
  className: string;
  createdAt: string;
  updatedAt: string;
};

const TABLE_NAME = process.env.BIKE_CLASSES_TABLE ?? "BikeClasses";

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
  const { className } = request.body ?? {};
  if (typeof className !== "string" || className.trim().length === 0) {
    response.status(400).json({ message: "クラス名を正しく入力してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const timestamp = new Date().toISOString();
    const classId = await generateNextNumericId(TABLE_NAME, "classId");
    const item: BikeClass = {
      classId,
      className: className.trim(),
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
