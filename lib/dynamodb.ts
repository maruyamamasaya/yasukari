import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

// ScanCommand に渡したい最小限の入力型を自前で定義する
type ScanInput = {
  TableName: string;
  ExclusiveStartKey?: Record<string, unknown>;
  ProjectionExpression?: string;
  FilterExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, unknown>;
  // 他に使いたくなったらここに足す
  [key: string]: unknown;
};

// DynamoDBDocumentClient.from(...) の戻り値の型
type DocumentClient = ReturnType<typeof DynamoDBDocumentClient.from>;

let documentClient: DocumentClient | null = null;

export function getDocumentClient(): DocumentClient {
  if (!documentClient) {
    const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;

    if (!region) {
      throw new Error("AWS_REGION or AWS_DEFAULT_REGION must be set");
    }

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
