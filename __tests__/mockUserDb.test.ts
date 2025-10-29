import { createLightMember, verifyLightMember, listLightMembers } from '../lib/mockUserDb';

describe('mockUserDb', () => {
  it('registers a new light member and allows login', () => {
    const username = `user_${Date.now()}`;
    const password = 'secret123';

    const member = createLightMember({ username, password });
    expect(member.username).toBe(username);
    expect(member.plan).toBe('ライトプラン');

    const verified = verifyLightMember(username, password);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(member.id);
  });

  it('registers a new light member with email only', () => {
    const email = `user_${Date.now()}@example.com`;

    const member = createLightMember({ email });
    expect(member.email).toBe(email.toLowerCase());
    expect(member.username).toBeUndefined();

    const verified = verifyLightMember(email, '');
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(member.id);
  });

  it('lists registered members including the seeded account', () => {
    const members = listLightMembers();
    expect(members.some((member) => member.username === 'adminuser')).toBe(true);
  });

  it('rejects duplicated usernames', () => {
    const username = `dup_${Date.now()}`;
    createLightMember({ username, password: 'password1' });
    expect(() => createLightMember({ username, password: 'password2' })).toThrow('同じユーザー名が既に登録されています');
  });

  it('rejects duplicated emails regardless of casing', () => {
    const email = `dup_email_${Date.now()}@example.com`;
    createLightMember({ email });
    expect(() => createLightMember({ email: email.toUpperCase() })).toThrow('同じメールアドレスが既に登録されています');
  });
});
