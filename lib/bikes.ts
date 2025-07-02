import bikesData from "../data/bikes.json";

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
}

/**
 * Fetch list of bike models.
 * In the future this will read from DynamoDB.
 */
export async function getBikeModels(): Promise<BikeModel[]> {
  // Data now resides in data/bikes.json
  return bikesData.bikes as BikeModel[];
}
