import crypto from 'crypto';

export type CognitoIdTokenPayload = {
  sub: string;
  email?: string;
  'cognito:username'?: string;
  token_use?: string;
  aud?: string;
  iss?: string;
  exp?: number;
};

type JwksKey = {
  kid: string;
  kty: string;
  n: string;
  e: string;
};

type JwksResponse = {
  keys: JwksKey[];
};

const ID_TOKEN_COOKIE = 'cognito_id_token';
const ACCESS_TOKEN_COOKIE = 'cognito_access_token';
const REFRESH_TOKEN_COOKIE = 'cognito_refresh_token';

const region = process.env.COGNITO_REGION ?? process.env.NEXT_PUBLIC_COGNITO_REGION ?? 'ap-northeast-1';
const userPoolId = process.env.COGNITO_USER_POOL_ID ?? process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID ?? process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID;
const clientSecret = process.env.COGNITO_CLIENT_SECRET;
const cognitoDomain = (process.env.COGNITO_DOMAIN ?? process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '').replace(/\/$/, '');

const REFRESH_TOKEN_MAX_AGE_SECONDS = Number(process.env.COGNITO_REFRESH_TOKEN_MAX_AGE ?? 60 * 60 * 24 * 30);

let jwksCache: { keys: JwksKey[]; fetchedAt: number } | null = null;

const base64UrlToArrayBuffer = (value: string): ArrayBuffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const buffer = Buffer.from(padded, 'base64');
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
};

const decodeJwtPayload = (token: string): CognitoIdTokenPayload | null => {
  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }
  const encodedPayload = segments[1] ?? '';
  try {
    const payloadJson = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(payloadJson) as CognitoIdTokenPayload;
  } catch (error) {
    return null;
  }
};

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
};

async function getJwks(): Promise<JwksKey[]> {
  if (jwksCache && Date.now() - jwksCache.fetchedAt < 60 * 60 * 1000) {
    return jwksCache.keys;
  }

  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID is required.');
  }

  const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;
  const response = await fetch(jwksUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch JWKS: ${response.status}`);
  }
  const data = (await response.json()) as JwksResponse;
  jwksCache = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

async function getVerificationKey(kid: string): Promise<crypto.webcrypto.CryptoKey> {
  const keys = await getJwks();
  const jwk = keys.find((key) => key.kid === kid);
  if (!jwk) {
    throw new Error('Signing key not found');
  }

  return crypto.webcrypto.subtle.importKey(
    'jwk',
    { ...jwk, alg: 'RS256', use: 'sig' },
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['verify']
  );
}

type CognitoTokenResponse = {
  id_token?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
};

type CognitoAuthResult = {
  payload: CognitoIdTokenPayload;
  idToken: string;
  accessToken?: string;
  refreshToken?: string;
};

const formatExpires = (maxAgeSeconds: number): string => {
  const expires = new Date(Date.now() + maxAgeSeconds * 1000);
  return expires.toUTCString();
};

const buildCookie = (name: string, value: string, maxAgeSeconds: number): string => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}; Expires=${formatExpires(
    maxAgeSeconds
  )}${secure}`;
};

export const createCognitoAuthCookies = (tokens: {
  idToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}): string[] => {
  const cookies: string[] = [];
  const maxAge = tokens.expiresIn ?? 3600;
  if (tokens.idToken) {
    cookies.push(buildCookie(ID_TOKEN_COOKIE, tokens.idToken, maxAge));
  }
  if (tokens.accessToken) {
    cookies.push(buildCookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, maxAge));
  }
  if (tokens.refreshToken) {
    cookies.push(buildCookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, REFRESH_TOKEN_MAX_AGE_SECONDS));
  }
  return cookies;
};

const getBearerToken = (authorization?: string): string | undefined => {
  if (!authorization) {
    return undefined;
  }
  const [type, token] = authorization.split(' ');
  if (type?.toLowerCase() !== 'bearer' || !token) {
    return undefined;
  }
  return token;
};

const callTokenEndpoint = async (params: Record<string, string>): Promise<CognitoTokenResponse> => {
  if (!cognitoDomain) {
    throw new Error('COGNITO_DOMAIN is required.');
  }
  if (!clientId) {
    throw new Error('COGNITO_CLIENT_ID is required.');
  }
  const tokenUrl = `${cognitoDomain}/oauth2/token`;
  const body = new URLSearchParams({
    client_id: clientId,
    ...params,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange token (${response.status})`);
  }

  return (await response.json()) as CognitoTokenResponse;
};

export async function verifyCognitoIdToken(token: string | undefined | null): Promise<CognitoIdTokenPayload | null> {
  if (!token) {
    return null;
  }
  if (!clientId) {
    throw new Error('COGNITO_CLIENT_ID is required.');
  }
  if (!userPoolId) {
    throw new Error('COGNITO_USER_POOL_ID is required.');
  }

  const segments = token.split('.');
  if (segments.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments;
  const headerJson = Buffer.from(encodedHeader.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const header = JSON.parse(headerJson) as { kid?: string; alg?: string };

  if (header.alg !== 'RS256' || !header.kid) {
    return null;
  }

  const key = await getVerificationKey(header.kid);
  const data = new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`);
  const signature = base64UrlToArrayBuffer(encodedSignature);

  const isValid = await crypto.webcrypto.subtle.verify(
    'RSASSA-PKCS1-v1_5',
    key,
    signature,
    data
  );

  if (!isValid) {
    return null;
  }

  const payloadJson = Buffer.from(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
  const payload = JSON.parse(payloadJson) as CognitoIdTokenPayload;

  if (payload.token_use !== 'id') {
    return null;
  }
  if (payload.aud !== clientId) {
    return null;
  }
  const expectedIssuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  if (payload.iss !== expectedIssuer) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp <= now) {
    return null;
  }

  return payload;
}

export const exchangeCognitoCode = async (code: string, redirectUri: string): Promise<CognitoTokenResponse> => {
  const response = await callTokenEndpoint({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });
  return response;
};

const refreshCognitoTokens = async (refreshToken: string): Promise<CognitoTokenResponse> =>
  callTokenEndpoint({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });

export const getCognitoAuthFromRequest = async ({
  cookies,
  authorization,
  setCookie,
}: {
  cookies?: Record<string, string>;
  authorization?: string;
  setCookie?: (cookies: string[]) => void;
}): Promise<CognitoAuthResult | null> => {
  const idTokenFromHeader = getBearerToken(authorization);
  const idToken = idTokenFromHeader ?? cookies?.[ID_TOKEN_COOKIE];
  const accessToken = cookies?.[ACCESS_TOKEN_COOKIE];
  const refreshToken = cookies?.[REFRESH_TOKEN_COOKIE];

  if (idToken) {
    const payload = await verifyCognitoIdToken(idToken);
    if (payload) {
      return { payload, idToken, accessToken, refreshToken };
    }
  }

  if (!refreshToken || (idToken && !isTokenExpired(idToken))) {
    return null;
  }

  const refreshed = await refreshCognitoTokens(refreshToken);
  if (!refreshed.id_token) {
    return null;
  }

  const refreshedPayload = await verifyCognitoIdToken(refreshed.id_token);
  if (!refreshedPayload) {
    return null;
  }

  if (setCookie) {
    const cookiesToSet = createCognitoAuthCookies({
      idToken: refreshed.id_token,
      accessToken: refreshed.access_token,
      expiresIn: refreshed.expires_in ?? 3600,
    });
    if (cookiesToSet.length > 0) {
      setCookie(cookiesToSet);
    }
  }

  return {
    payload: refreshedPayload,
    idToken: refreshed.id_token,
    accessToken: refreshed.access_token,
    refreshToken,
  };
};

export {
  ID_TOKEN_COOKIE as COGNITO_ID_TOKEN_COOKIE,
  ACCESS_TOKEN_COOKIE as COGNITO_ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE as COGNITO_REFRESH_TOKEN_COOKIE,
};
