const hostedUiDomain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '').replace(/\/$/, '');
const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? 'vicsspgv2q7mtn6m6os2n893j';
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? 'https://yasukaribike.com/auth/callback';
const logoutRedirectUri =
  process.env.NEXT_PUBLIC_COGNITO_LOGOUT_REDIRECT_URI ?? 'https://yasukaribike.com/';

export const COGNITO_ID_TOKEN_COOKIE = 'cognito_id_token';
export const COGNITO_ACCESS_TOKEN_COOKIE = 'cognito_access_token';

export const buildAuthorizeUrl = (state?: string) => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
    scope: 'openid email phone',
    redirect_uri: redirectUri,
  });

  if (state) {
    params.set('state', state);
  }

  return `${hostedUiDomain}/oauth2/authorize?${params.toString()}`;
};

export const buildSignupUrl = (state = 'signup') => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'token',
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
