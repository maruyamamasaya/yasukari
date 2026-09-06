import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { getDocumentClient } from "../dynamodb";
import type { BikeClass, BikeModel } from "../dashboard/types";
import { resolveRentalPrice } from "../rentalPrice";
import { readVehicleRentalPricesFromStore } from "./vehicleRentalPrices";

export async function getServerRentalPrice(modelId: number, days: number): Promise<number | null> {
  if (!Number.isInteger(modelId) || modelId <= 0 || !Number.isInteger(days) || days <= 0) return null;

  const client = getDocumentClient();
  const modelResult = await client.send(new GetCommand({
    TableName: process.env.BIKE_MODELS_TABLE ?? "BikeModels",
    Key: { modelId },
  }));
  const model = modelResult.Item as BikeModel | undefined;
  if (!model?.classId) return null;

  const [prices, classResult] = await Promise.all([
    readVehicleRentalPricesFromStore(modelId),
    client.send(new GetCommand({
      TableName: process.env.BIKE_CLASSES_TABLE ?? "BikeClasses",
      Key: { classId: model.classId },
    })),
  ]);
  const bikeClass = classResult.Item as BikeClass | undefined;
  return resolveRentalPrice(prices, bikeClass?.base_prices, days);
}
