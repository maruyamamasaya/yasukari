export type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  { code: 'JP', name: '日本', dialCode: '81' },
  { code: 'US', name: 'アメリカ合衆国', dialCode: '1' },
  { code: 'GB', name: 'イギリス', dialCode: '44' },
  { code: 'CN', name: '中国', dialCode: '86' },
  { code: 'KR', name: '韓国', dialCode: '82' },
  { code: 'AU', name: 'オーストラリア', dialCode: '61' },
  { code: 'FR', name: 'フランス', dialCode: '33' },
  { code: 'DE', name: 'ドイツ', dialCode: '49' },
];

export const findCountryByDialCodePrefix = (value: string): CountryOption | undefined => {
  const digits = value.replace(/[^0-9]/g, '');

  return COUNTRY_OPTIONS.reduce<CountryOption | undefined>((matched, option) => {
    if (digits.startsWith(option.dialCode)) {
      if (!matched || option.dialCode.length > matched.dialCode.length) {
        return option;
      }
    }
    return matched;
  }, undefined);
};

export const formatInternationalPhoneNumber = (countryDialCode: string, nationalNumber: string): string => {
  const normalizedCountry = countryDialCode.replace(/[^0-9]/g, '');
  const normalizedNational = nationalNumber.replace(/[^0-9]/g, '');
  const subscriberNumber = normalizedNational.replace(/^0+/, '');

  if (!normalizedCountry || !subscriberNumber) return '';

  return `+${normalizedCountry}${subscriberNumber}`;
};
