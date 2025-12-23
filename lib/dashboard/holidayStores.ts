export type HolidayManagerStore = {
  id: string;
  label: string;
};

export const HOLIDAY_MANAGER_STORES: HolidayManagerStore[] = [
  { id: "adachi-odai", label: "足立小台店" },
  { id: "minowa", label: "三ノ輪店" },
];

export const findHolidayStoreById = (storeId?: string) => {
  return HOLIDAY_MANAGER_STORES.find((store) => store.id === storeId);
};

export const findHolidayStoreByLabel = (label?: string) => {
  return HOLIDAY_MANAGER_STORES.find((store) => store.label === label);
};
