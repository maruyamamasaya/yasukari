import bikesData from "../data/bikes.json";
import { scanAllItems } from "./dynamodb";

type DynamoBikeModel = {
  modelId: number;
  classId?: number;
  modelName: string;
  publishStatus?: "ON" | "OFF";
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
};

export interface BikeClass {
  classId: number;
  className: string;
  class_id?: string;
}

export interface BikeSpec {
  license?: string;
  capacity?: string;
  length?: string;
  width?: string;
  height?: string;
  seatHeight?: string;
  weight?: string;
  tank?: string;
  fuel?: string;
  output?: string;
  displacement?: string;
  torque?: string;
}

export interface BikeModel {
  modelName: string;
  modelCode: string;
  img: string;
  badge?: string;
  description?: string;
  price24h?: string;
  tags?: string[];
  spec?: BikeSpec;
  stores?: string[];
  classId?: number;
  modelId?: number;
}

/**
 * Fetch list of bike models.
 */
export async function getBikeModels(): Promise<BikeModel[]> {
  const MODELS_TABLE = process.env.BIKE_MODELS_TABLE ?? "BikeModels";

  try {
    const models = await scanAllItems<DynamoBikeModel>({
      TableName: MODELS_TABLE,
    });

    const published = models
      .filter((model) => (model.publishStatus ?? "ON") === "ON")
      .sort((a, b) => a.modelId - b.modelId);

    return published.map((model) => {
      const spec: BikeSpec = {
        license: model.requiredLicense,
        capacity: model.seatCapacity != null ? `${model.seatCapacity}名` : undefined,
        length: model.lengthMm != null ? `${model.lengthMm}mm` : undefined,
        width: model.widthMm != null ? `${model.widthMm}mm` : undefined,
        height: model.heightMm != null ? `${model.heightMm}mm` : undefined,
        seatHeight: model.seatHeightMm != null ? `${model.seatHeightMm}mm` : undefined,
        weight: model.vehicleWeightKg != null ? `${model.vehicleWeightKg}kg` : undefined,
        tank: model.fuelTankCapacityL != null ? `${model.fuelTankCapacityL}L` : undefined,
        fuel: model.fuelType,
        output: model.maxPower,
        displacement: model.displacementCc != null ? `${model.displacementCc}cm3` : undefined,
        torque: model.maxTorque,
      };

      const descriptionParts = [
        spec.displacement ? `排気量：${spec.displacement}` : null,
        spec.seatHeight ? `シート高：${spec.seatHeight}` : null,
      ].filter(Boolean);

      return {
        modelName: model.modelName,
        modelCode: String(model.modelId ?? model.modelName),
        modelId: model.modelId,
        classId: model.classId,
        img: model.mainImageUrl ?? "https://placehold.co/600x400?text=Bike",
        description: descriptionParts.join(" ") || undefined,
        spec,
      };
    });
  } catch (error) {
    console.error("Failed to fetch bike models from DynamoDB, falling back to static data", error);
    return bikesData.bikes as BikeModel[];
  }
}

export async function getBikeClasses(): Promise<BikeClass[]> {
  const CLASSES_TABLE = process.env.BIKE_CLASSES_TABLE ?? "BikeClasses";
  try {
    const classes = await scanAllItems<BikeClass>({ TableName: CLASSES_TABLE });
    return classes.sort((a, b) => a.classId - b.classId);
  } catch (error) {
    console.error("Failed to fetch bike classes from DynamoDB", error);
    return [];
  }
}
