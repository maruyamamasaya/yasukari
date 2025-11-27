const hostedUiDomain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '').replace(/\/$/, '');
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? 'vicsspgv2q7mtn6m6os2n893j';
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? 'https://yasukaribike.com/auth/callback';
const redirectUriObject = (() => {
  try {
    return new URL(redirectUri);
  } catch (error) {
    console.error('Failed to parse redirectUri for Cognito configuration', error);
    return null;
  }
})();
const logoutRedirectUri =
  process.env.NEXT_PUBLIC_COGNITO_LOGOUT_REDIRECT_URI ??
  (redirectUriObject ? `${redirectUriObject.origin}/auth/logout` : 'https://yasukaribike.com/auth/logout');

export const COGNITO_ID_TOKEN_COOKIE = 'cognito_id_token';
export const COGNITO_ACCESS_TOKEN_COOKIE = 'cognito_access_token';
export const COGNITO_OAUTH_STATE_KEY = 'cognito_oauth_state';

const generateOauthState = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export const createAndStoreOauthState = () => {
  const state = generateOauthState();

  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(COGNITO_OAUTH_STATE_KEY, state);
  }

  return state;
};

export const buildAuthorizeUrl = (state: string) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    scope: 'openid email phone',
    redirect_uri: redirectUri,
    state,
  });

  return `${hostedUiDomain}/oauth2/authorize?${params.toString()}`;
};

export const buildSignupUrl = (state = 'signup') => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    scope: 'openid email phone',
    redirect_uri: redirectUri,
    state,
  });

  return `${hostedUiDomain}/signup?${params.toString()}`;
};

export const buildLogoutUrl = () => {
  const params = new URLSearchParams({
    client_id: clientId,
    logout_uri: logoutRedirectUri,
  });

  return `${hostedUiDomain}/logout?${params.toString()}`;
};
