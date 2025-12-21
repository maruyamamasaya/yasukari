export type RequiredLicenseOption = {
  value: number;
  label: string;
};

export const REQUIRED_LICENSE_OPTIONS: RequiredLicenseOption[] = [
  { value: 1, label: "大型二輪免許" },
  { value: 2, label: "中型二輪免許（400ccまで）" },
  { value: 3, label: "普通二輪免許（小型限定を含む）" },
  { value: 4, label: "小型限定普通二輪免許（〜125cc MT）" },
  { value: 5, label: "小型限定普通二輪免許（〜125cc AT）" },
  { value: 6, label: "原付免許（50cc以下）" },
  { value: 7, label: "普通自動車免許（AT限定可・特例車）" },
];

export const REQUIRED_LICENSE_LABEL_MAP = new Map(
  REQUIRED_LICENSE_OPTIONS.map((option) => [option.value, option.label])
);

export const getRequiredLicenseLabel = (value?: number) =>
  value == null ? undefined : REQUIRED_LICENSE_LABEL_MAP.get(value);
