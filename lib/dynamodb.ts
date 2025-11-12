import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// ★ここでリージョンを直接指定（東京リージョンなら ap-northeast-1）
const REGION = "ap-northeast-1";

// ScanCommand に渡したい最小限の入力型を自前で定義
type ScanInput = {
  TableName: string;
  ExclusiveStartKey?: Record<string, unknown>;
  ProjectionExpression?: string;
  FilterExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, unknown>;
  // 必要になったらここにプロパティを足していけばOK
  [key: string]: unknown;
};

// DynamoDBDocumentClient.from(...) の戻り値の型
type DocumentClient = ReturnType<typeof DynamoDBDocumentClient.from>;

let documentClient: DocumentClient | null = null;

export function getDocumentClient(): DocumentClient {
  if (!documentClient) {
    // .env は使わず、上の REGION をそのまま使う
    const region = REGION;

    documentClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region }),
      {
        marshallOptions: { removeUndefinedValues: true },
      }
    );
  }
  return documentClient;
}

export async function scanAllItems<T>(input: ScanInput): Promise<T[]> {
  const client = getDocumentClient();
  let items: T[] = [];
  let lastEvaluatedKey: ScanInput["ExclusiveStartKey"] | undefined;

  do {
    const response = await client.send(
      new ScanCommand({
        ...input,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    items = items.concat((response.Items ?? []) as T[]);
    lastEvaluatedKey = response.LastEvaluatedKey as ScanInput["ExclusiveStartKey"];
  } while (lastEvaluatedKey);

  return items;
}

export async function generateNextNumericId(
  tableName: string,
  fieldName: string
): Promise<number> {
  const client = getDocumentClient();
  let lastEvaluatedKey: ScanInput["ExclusiveStartKey"] | undefined;
  let maxValue = 0;

  do {
    const response = await client.send(
      new ScanCommand({
        TableName: tableName,
        ProjectionExpression: fieldName,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    for (const item of response.Items ?? []) {
      const value = (item as Record<string, unknown>)[fieldName];
      if (typeof value === "number" && value > maxValue) {
        maxValue = value;
      }
    }

    lastEvaluatedKey = response.LastEvaluatedKey as ScanInput["ExclusiveStartKey"];
  } while (lastEvaluatedKey);

  return maxValue + 1;
}
