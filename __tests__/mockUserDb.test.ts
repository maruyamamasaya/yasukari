import { createLightMember, verifyLightMember, listLightMembers } from '../lib/mockUserDb';

describe('mockUserDb', () => {
  it('registers a new light member and allows login', () => {
    const username = `user_${Date.now()}`;
    const password = 'secret123';

    const member = createLightMember(username, password);
    expect(member.username).toBe(username);
    expect(member.plan).toBe('ライトプラン');

    const verified = verifyLightMember(username, password);
    expect(verified).not.toBeNull();
    expect(verified?.id).toBe(member.id);
  });

  it('lists registered members including the seeded account', () => {
    const members = listLightMembers();
    expect(members.some((member) => member.username === 'adminuser')).toBe(true);
  });

  it('rejects duplicated usernames', () => {
    const username = `dup_${Date.now()}`;
    createLightMember(username, 'password1');
    expect(() => createLightMember(username, 'password2')).toThrow('同じユーザー名が既に登録されています');
  });
});
