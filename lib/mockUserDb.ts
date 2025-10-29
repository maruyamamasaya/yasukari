import { createHash, randomUUID } from 'crypto';

export type LightMember = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  plan: 'ライトプラン';
};

const lightMembers = new Map<string, LightMember>();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function seedDefaultAccount() {
  const username = 'adminuser';
  if (!lightMembers.has(username)) {
    const seededAccount: LightMember = {
      id: randomUUID(),
      username,
      passwordHash: hashPassword('adminuser'),
      createdAt: new Date().toISOString(),
      plan: 'ライトプラン',
    };
    lightMembers.set(username, seededAccount);
  }
}

seedDefaultAccount();

export function createLightMember(username: string, password: string): LightMember {
  const sanitizedUsername = username.trim();
  if (!sanitizedUsername) {
    throw new Error('ユーザー名を入力してください');
  }
  if (password.length < 6) {
    throw new Error('パスワードは6文字以上にしてください');
  }
  if (lightMembers.has(sanitizedUsername)) {
    throw new Error('同じユーザー名が既に登録されています');
  }

  const member: LightMember = {
    id: randomUUID(),
    username: sanitizedUsername,
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
    plan: 'ライトプラン',
  };

  lightMembers.set(member.username, member);
  return member;
}

export function verifyLightMember(username: string, password: string): LightMember | null {
  const member = lightMembers.get(username.trim());
  if (!member) {
    return null;
  }
  return member.passwordHash === hashPassword(password) ? member : null;
}

export function listLightMembers(): LightMember[] {
  return Array.from(lightMembers.values()).map((member) => ({ ...member }));
}
