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
