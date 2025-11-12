import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandInput,
} from "@aws-sdk/lib-dynamodb";

type DocumentClient = ReturnType<typeof DynamoDBDocumentClient.from>;

let documentClient: DocumentClient | null = null;

export function getDocumentClient(): DocumentClient {
  if (!documentClient) {
    const region = process.env.AWS_REGION ?? process.env.AWS_DEFAULT_REGION;
    documentClient = DynamoDBDocumentClient.from(
      new DynamoDBClient({ region }),
      {
        marshallOptions: { removeUndefinedValues: true },
      }
    );
  }
  return documentClient;
}

export async function scanAllItems<T>(
  input: Omit<ScanCommandInput, "TableName"> & { TableName: string }
): Promise<T[]> {
  const client = getDocumentClient();
  let items: T[] = [];
  let lastEvaluatedKey: ScanCommandInput["ExclusiveStartKey"] | undefined;

  do {
    const response = await client.send(
      new ScanCommand({ ...input, ExclusiveStartKey: lastEvaluatedKey })
    );
    items = items.concat((response.Items ?? []) as T[]);
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return items;
}

export async function generateNextNumericId(
  tableName: string,
  fieldName: string
): Promise<number> {
  const client = getDocumentClient();
  let lastEvaluatedKey: ScanCommandInput["ExclusiveStartKey"] | undefined;
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

    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return maxValue + 1;
}
