const hostedUiDomain = (process.env.NEXT_PUBLIC_COGNITO_DOMAIN ?? '').replace(/\/$/, '');
export const cognitoClientId =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? 'vicsspgv2q7mtn6m6os2n893j';
const redirectUri =
  process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI ?? 'https://yasukari.com/auth/callback';
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
  (redirectUriObject ? `${redirectUriObject.origin}/auth/logout` : 'https://yasukari.com/auth/logout');

const scopeList = (() => {
  const configured = (process.env.NEXT_PUBLIC_COGNITO_SCOPES ?? '')
    .split(/[ ,]+/)
    .map((value) => value.trim())
    .filter(Boolean);

  if (configured.length > 0) {
    return configured;
  }

  // Keep the default scopes aligned with the user self-service operations we
  // perform (GetUser/UpdateUserAttributes). The admin scope is required for
  // these endpoints when using Hosted UI access tokens.
  return ['openid', 'email', 'phone', 'profile', 'aws.cognito.signin.user.admin'];
})();

export const COGNITO_ID_TOKEN_COOKIE = 'cognito_id_token';
export const COGNITO_ACCESS_TOKEN_COOKIE = 'cognito_access_token';
export const COGNITO_OAUTH_STATE_KEY = 'cognito_oauth_state';
const SIGNUP_STATE_PREFIX = 'signup.';

const generateOauthState = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return Math.random().toString(36).slice(2);
};

export const createAndStoreOauthState = (intent: 'login' | 'signup' = 'login') => {
  const randomState = generateOauthState();
  const state = intent === 'signup' ? `${SIGNUP_STATE_PREFIX}${randomState}` : randomState;

  if (typeof window !== 'undefined' && window.sessionStorage) {
    window.sessionStorage.setItem(COGNITO_OAUTH_STATE_KEY, state);
  }

  return state;
};

export const isSignupOauthState = (state: string) => state.startsWith(SIGNUP_STATE_PREFIX);

export const buildAuthorizeUrl = (state: string, options?: { lang?: string }) => {
  const params = new URLSearchParams({
    client_id: cognitoClientId,
    response_type: 'token',
    scope: scopeList.join(' '),
    redirect_uri: redirectUri,
    state,
  });

  const lang = options?.lang ?? 'ja';
  if (lang) {
    params.set('lang', lang);
  }

  return `${hostedUiDomain}/oauth2/authorize?${params.toString()}`;
};

export const buildSignupUrl = (state = 'signup', options?: { lang?: string }) => {
  const params = new URLSearchParams({
    client_id: cognitoClientId,
    // The callback consumes tokens from the URL fragment. Keep signup on the
    // same implicit flow as login so Cognito does not return an unhandled
    // authorization code in the query string.
    response_type: 'token',
    scope: scopeList.join(' '),
    redirect_uri: redirectUri,
    state,
  });

  const lang = options?.lang ?? 'ja';
  if (lang) {
    params.set('lang', lang);
  }

  return `${hostedUiDomain}/signup?${params.toString()}`;
};

export const buildLogoutUrl = () => {
  const params = new URLSearchParams({
    client_id: cognitoClientId,
    logout_uri: logoutRedirectUri,
  });

  return `${hostedUiDomain}/logout?${params.toString()}`;
};
