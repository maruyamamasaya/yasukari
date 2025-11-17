export type PublishStatus = "ON" | "OFF";

export type DurationPriceKey = "24h" | "2d" | "4d" | "1w" | "2w" | "1m";

export type DurationPriceMap = Partial<Record<DurationPriceKey, number>>;

export type BikeClass = {
  classId: number;
  class_id?: string;
  className: string;
  base_prices?: DurationPriceMap;
  insurance_prices?: DurationPriceMap;
  extra_prices?: Partial<Record<string, number>>;
  theft_insurance?: number;
  createdAt: string;
  updatedAt: string;
};

export type BikeModel = {
  modelId: number;
  classId: number;
  modelName: string;
  publishStatus: PublishStatus;
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
  createdAt: string;
  updatedAt: string;
};

export type Vehicle = {
  managementNumber: string;
  modelId: number;
  storeId: string;
  publishStatus: PublishStatus;
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
