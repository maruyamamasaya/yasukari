import { getCompletedProfileRedirect } from '../lib/profileSetupRedirect';

describe('profile setup redirect', () => {
  it('always sends a completed signup flow to the account thanks page', () => {
    expect(getCompletedProfileRedirect({
      isSignupFlow: true,
      localePath: '/mypage',
    })).toBe('/account/thanks');
  });

  it('sends an ordinary profile update to the locale-specific mypage', () => {
    expect(getCompletedProfileRedirect({
      isSignupFlow: false,
      localePath: '/en/mypage',
    })).toBe('/en/mypage');
  });
});
