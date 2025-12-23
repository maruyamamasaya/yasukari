import {
  DeleteCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { getDocumentClient } from "../dynamodb";

export type HolidayRecord = {
  date: string;
  store: string;
  isHoliday: boolean;
  note?: string;
};

const TABLE_NAME = "HolidayCalendar";

type DynamoHolidayRecord = {
  store_id: string;
  date: string;
  is_holiday: boolean;
  note?: string;
};

export async function readHolidayRecords(
  store: string,
  month?: string
): Promise<HolidayRecord[]> {
  const client = getDocumentClient();
  const expressionAttributeNames: Record<string, string> = {
    "#store_id": "store_id",
    "#date": "date",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":store_id": store,
  };
  let keyCondition = "#store_id = :store_id";

  if (month) {
    expressionAttributeValues[":month_prefix"] = `${month}-`;
    keyCondition += " AND begins_with(#date, :month_prefix)";
  }

  const response = await client.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: keyCondition,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    })
  );

  return (response.Items ?? []).map((item) => {
    const record = item as DynamoHolidayRecord;
    return {
      date: record.date,
      store: record.store_id,
      isHoliday: record.is_holiday,
      note: record.note,
    } satisfies HolidayRecord;
  });
}

export async function upsertHolidayRecord(record: HolidayRecord): Promise<void> {
  const client = getDocumentClient();
  await client.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        store_id: record.store,
        date: record.date,
        is_holiday: record.isHoliday,
        note: record.note,
      } satisfies DynamoHolidayRecord,
    })
  );
}

export async function removeHolidayRecord(date: string, store: string): Promise<void> {
  const client = getDocumentClient();
  await client.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        store_id: store,
        date,
      },
    })
  );
}
