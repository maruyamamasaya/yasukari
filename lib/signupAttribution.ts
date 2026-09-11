export const SIGNUP_ATTRIBUTION_COOKIE = 'yasukari_signup_attribution';
export const SIGNUP_ATTRIBUTION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type SignupAttribution = {
  source: string;
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
};

const MAX_ATTRIBUTION_VALUE_LENGTH = 200;

const normalizeValue = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().slice(0, MAX_ATTRIBUTION_VALUE_LENGTH);
  return normalized || undefined;
};

export const parseSignupAttribution = (value: unknown): SignupAttribution | null => {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const source = normalizeValue(record.source);
  if (!source) return null;

  return {
    source,
    campaign: normalizeValue(record.campaign),
    medium: normalizeValue(record.medium),
    content: normalizeValue(record.content),
    term: normalizeValue(record.term),
  };
};

export const attributionFromSearchParams = (
  params: Pick<URLSearchParams, 'get'>
): SignupAttribution | null =>
  parseSignupAttribution({
    source: params.get('utm_source'),
    campaign: params.get('utm_campaign'),
    medium: params.get('utm_medium'),
    content: params.get('utm_content'),
    term: params.get('utm_term'),
  });

export const readSignupAttributionCookie = (): SignupAttribution | null => {
  if (typeof document === 'undefined') return null;
  const prefix = `${SIGNUP_ATTRIBUTION_COOKIE}=`;
  const rawValue = document.cookie
    .split(';')
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
  if (!rawValue) return null;

  try {
    return parseSignupAttribution(JSON.parse(decodeURIComponent(rawValue)));
  } catch {
    return null;
  }
};

export const storeFirstTouchAttribution = (params: Pick<URLSearchParams, 'get'>): boolean => {
  if (typeof document === 'undefined' || readSignupAttributionCookie()) return false;
  const attribution = attributionFromSearchParams(params);
  if (!attribution) return false;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${SIGNUP_ATTRIBUTION_COOKIE}=${encodeURIComponent(
    JSON.stringify(attribution)
  )}; Path=/; SameSite=Lax; Max-Age=${SIGNUP_ATTRIBUTION_MAX_AGE_SECONDS}${secure}`;
  return true;
};
