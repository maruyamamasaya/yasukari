export type StoreOption = {
  id: string;
  label: string;
};

export const STORE_OPTIONS: StoreOption[] = [
  { id: "足立小台店", label: "足立小台店" },
  { id: "三ノ輪店", label: "三ノ輪店" },
];

export const getStoreLabel = (storeId?: string | null): string => {
  if (!storeId) {
    return "-";
  }

  return (
    STORE_OPTIONS.find((option) => option.id === storeId)?.label ?? storeId ?? "-"
  );
};
