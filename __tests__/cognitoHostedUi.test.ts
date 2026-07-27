import {
  buildAuthorizeUrl,
  buildSignupUrl,
  createAndStoreOauthState,
  isSignupOauthState,
} from '../lib/cognitoHostedUi';

const parseHostedUiUrl = (value: string) => new URL(value, 'https://cognito.example.com');

describe('Cognito Hosted UI URLs', () => {
  it('round-trips signup intent in the validated OAuth state', () => {
    const state = createAndStoreOauthState('signup');

    expect(sessionStorage.getItem('cognito_oauth_state')).toBe(state);
    expect(isSignupOauthState(state)).toBe(true);
    expect(isSignupOauthState(createAndStoreOauthState())).toBe(false);
  });

  it('requests fragment tokens for login', () => {
    const url = parseHostedUiUrl(buildAuthorizeUrl('login-state'));

    expect(url.pathname).toBe('/oauth2/authorize');
    expect(url.searchParams.get('response_type')).toBe('token');
    expect(url.searchParams.get('state')).toBe('login-state');
  });

  it('requests fragment tokens for signup so the callback can complete authentication', () => {
    const url = parseHostedUiUrl(buildSignupUrl('signup-state'));

    expect(url.pathname).toBe('/signup');
    expect(url.searchParams.get('response_type')).toBe('token');
    expect(url.searchParams.get('state')).toBe('signup-state');
  });
});
