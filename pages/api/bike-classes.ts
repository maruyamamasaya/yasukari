import type { NextApiRequest, NextApiResponse } from "next";
import {
  BatchWriteCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
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

async function handlePut(
  request: NextApiRequest,
  response: NextApiResponse<BikeClass | { message: string }>
) {
  const { classId, className } = request.body ?? {};

  if (typeof classId !== "number") {
    response.status(400).json({ message: "クラスIDを正しく指定してください。" });
    return;
  }

  if (typeof className !== "string" || className.trim().length === 0) {
    response.status(400).json({ message: "クラス名を正しく入力してください。" });
    return;
  }

  try {
    const client = getDocumentClient();
    const timestamp = new Date().toISOString();
    const result = await client.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { classId },
        UpdateExpression: "SET className = :className, updatedAt = :updatedAt",
        ExpressionAttributeValues: {
          ":className": className.trim(),
          ":updatedAt": timestamp,
        },
        ConditionExpression: "attribute_exists(classId)",
        ReturnValues: "ALL_NEW",
      })
    );

    const updatedItem = result.Attributes as BikeClass | undefined;
    if (!updatedItem) {
      response.status(404).json({ message: "クラスが見つかりませんでした。" });
      return;
    }

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
