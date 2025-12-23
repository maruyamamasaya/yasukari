export type CountryOption = {
  code: string;
  name: string;
  dialCode: string;
};

export const COUNTRY_OPTIONS: CountryOption[] = [
  // 日本・北米
  { code: 'JP', name: '日本', dialCode: '81' },
  { code: 'US', name: 'アメリカ合衆国', dialCode: '1' },
  { code: 'CA', name: 'カナダ', dialCode: '1' },

  // ヨーロッパ主要国（G7中心＋α）
  { code: 'GB', name: 'イギリス', dialCode: '44' },
  { code: 'FR', name: 'フランス', dialCode: '33' },
  { code: 'DE', name: 'ドイツ', dialCode: '49' },
  { code: 'IT', name: 'イタリア', dialCode: '39' },
  { code: 'ES', name: 'スペイン', dialCode: '34' },
  { code: 'NL', name: 'オランダ', dialCode: '31' },
  { code: 'CH', name: 'スイス', dialCode: '41' },
  { code: 'SE', name: 'スウェーデン', dialCode: '46' },

  // アジア主要国
  { code: 'CN', name: '中国', dialCode: '86' },
  { code: 'KR', name: '韓国', dialCode: '82' },
  { code: 'TW', name: '台湾', dialCode: '886' },
  { code: 'HK', name: '香港', dialCode: '852' },
  { code: 'SG', name: 'シンガポール', dialCode: '65' },
  { code: 'TH', name: 'タイ', dialCode: '66' },
  { code: 'VN', name: 'ベトナム', dialCode: '84' },
  { code: 'PH', name: 'フィリピン', dialCode: '63' },
  { code: 'MY', name: 'マレーシア', dialCode: '60' },
  { code: 'ID', name: 'インドネシア', dialCode: '62' },
  { code: 'IN', name: 'インド', dialCode: '91' },

  // オセアニア
  { code: 'AU', name: 'オーストラリア', dialCode: '61' },
  { code: 'NZ', name: 'ニュージーランド', dialCode: '64' },

  // 中南米
  { code: 'MX', name: 'メキシコ', dialCode: '52' },
  { code: 'BR', name: 'ブラジル', dialCode: '55' },
  { code: 'AR', name: 'アルゼンチン', dialCode: '54' },

  // 中東・その他
  { code: 'TR', name: 'トルコ', dialCode: '90' },
  { code: 'SA', name: 'サウジアラビア', dialCode: '966' },
  { code: 'AE', name: 'アラブ首長国連邦', dialCode: '971' },
  { code: 'RU', name: 'ロシア', dialCode: '7' },
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

const getJapanOption = (): CountryOption | undefined =>
  COUNTRY_OPTIONS.find((option) => option.code === 'JP');

const formatJapaneseNationalNumber = (nationalNumber: string): string => {
  const digits = nationalNumber.replace(/[^0-9]/g, '');
  if (!digits) return '';

  if (digits.length === 10) {
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return digits;
};

export const formatDisplayPhoneNumber = (value?: string): string => {
  if (!value) return '';

  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';

  const japanOption = getJapanOption();
  const matchedCountry = findCountryByDialCodePrefix(digits);

  let country = matchedCountry;
  let national = '';

  if (matchedCountry) {
    national = digits.slice(matchedCountry.dialCode.length);
    if (national && !national.startsWith('0')) {
      national = `0${national}`;
    }
  } else if (digits.startsWith('0') && japanOption) {
    country = japanOption;
    national = digits;
  }

  if (!country) {
    return `+${digits}`;
  }

  const formattedNational =
    country.code === 'JP' ? formatJapaneseNationalNumber(national) : national;
  const label = `${country.name} +${country.dialCode}`;

  return formattedNational ? `${label} ${formattedNational}` : label;
};

export const formatDisplayPhoneNumberWithCountryCode = (
  phone: string,
  countryCode?: string
): string => {
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return '';

  const dialCode = (countryCode ?? '').replace(/[^0-9]/g, '');
  if (!dialCode) {
    return formatDisplayPhoneNumber(digits);
  }

  if (digits.startsWith(dialCode)) {
    return formatDisplayPhoneNumber(digits);
  }

  const national = digits.startsWith('0') ? digits.slice(1) : digits;
  return formatDisplayPhoneNumber(`${dialCode}${national}`);
};
