import {
  buildProvisionalRegistrationThanksPath,
  buildRegistrationDetailsPath,
} from '../lib/provisionalRegistrationRedirect';

describe('provisional registration redirects', () => {
  it('sends a completed provisional registration to its thanks page', () => {
    expect(buildProvisionalRegistrationThanksPath({
      id: 'member-1',
      email: 'member@example.com',
      username: '山田 太郎',
    }, 'fallback@example.com')).toBe(
      '/register/thanks?name=%E5%B1%B1%E7%94%B0+%E5%A4%AA%E9%83%8E&user_id=member-1&email=member%40example.com',
    );
  });

  it('keeps registration details in the thanks-page continuation link', () => {
    expect(buildRegistrationDetailsPath({
      name: '山田 太郎',
      user_id: 'member-1',
      email: 'member@example.com',
      ignored: 'value',
    })).toBe(
      '/register/test?name=%E5%B1%B1%E7%94%B0+%E5%A4%AA%E9%83%8E&user_id=member-1&email=member%40example.com',
    );
  });
});
