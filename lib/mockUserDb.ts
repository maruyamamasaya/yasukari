import { createHash, randomUUID } from 'crypto';

export type RegistrationStatus = 'provisional' | 'full';

export type LightMember = {
  id: string;
  username?: string;
  email?: string;
  passwordHash?: string;
  createdAt: string;
  plan: 'ライトプラン';
  phoneNumber?: string;
  registrationStatus: RegistrationStatus;
};

type CreateLightMemberParams = {
  username?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  registrationStatus?: RegistrationStatus;
};

const members = new Map<string, LightMember>();
const membersByUsername = new Map<string, string>();
const membersByEmail = new Map<string, string>();

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function storeMember(member: LightMember) {
  members.set(member.id, member);
  if (member.username) {
    membersByUsername.set(member.username, member.id);
  }
  if (member.email) {
    membersByEmail.set(member.email.toLowerCase(), member.id);
  }
}

function seedDefaultAccount() {
  if (members.size > 0) {
    return;
  }
  const seededAccount: LightMember = {
    id: randomUUID(),
    username: 'adminuser',
    email: 'adminuser@example.com',
    passwordHash: hashPassword('adminuser'),
    createdAt: new Date().toISOString(),
    plan: 'ライトプラン',
    registrationStatus: 'full',
  };
  storeMember(seededAccount);
}

seedDefaultAccount();

export function createLightMember(params: CreateLightMemberParams): LightMember {
  const username = params.username?.trim();
  const password = params.password ?? '';
  const email = params.email?.trim().toLowerCase();
  const rawPhoneNumber = params.phoneNumber ?? '';
  const registrationStatus: RegistrationStatus = params.registrationStatus ?? 'provisional';

  const normalizedPhoneNumber = rawPhoneNumber.replace(/[^0-9]/g, '');

  const hasEmail = Boolean(email);
  const hasCredentials = Boolean(username && password);
  const hasPhoneNumber = Boolean(normalizedPhoneNumber);

  if (!hasEmail && !hasCredentials) {
    throw new Error('メールアドレスを入力してください');
  }

  if (hasPhoneNumber && (normalizedPhoneNumber.length < 10 || normalizedPhoneNumber.length > 15)) {
    throw new Error('電話番号は10桁以上15桁以下の数字で入力してください');
  }

  if (hasCredentials && password.length < 6) {
    throw new Error('パスワードは6文字以上にしてください');
  }

  if (username && membersByUsername.has(username)) {
    throw new Error('同じユーザー名が既に登録されています');
  }

  if (email) {
    if (!isValidEmail(email)) {
      throw new Error('有効なメールアドレスを入力してください');
    }
    if (membersByEmail.has(email)) {
      throw new Error('同じメールアドレスが既に登録されています');
    }
  }

  const member: LightMember = {
    id: randomUUID(),
    username: username || undefined,
    email: email || undefined,
    passwordHash: hasCredentials ? hashPassword(password) : undefined,
    createdAt: new Date().toISOString(),
    plan: 'ライトプラン',
    phoneNumber: normalizedPhoneNumber || undefined,
    registrationStatus,
  };

  storeMember(member);
  return member;
}

export function hasLightMemberByEmail(email: string): boolean {
  if (!email) {
    return false;
  }
  return membersByEmail.has(email.trim().toLowerCase());
}

export function findLightMemberByEmail(email: string): LightMember | null {
  if (!email) {
    return null;
  }
  const normalizedEmail = email.trim().toLowerCase();
  const memberId = membersByEmail.get(normalizedEmail);
  if (!memberId) {
    return null;
  }
  const member = members.get(memberId);
  return member ? { ...member } : null;
}

export function findLightMemberById(id: string): LightMember | null {
  if (!id) {
    return null;
  }
  const member = members.get(id.trim());
  return member ? { ...member } : null;
}

export function verifyLightMember(identifier: string, password: string): LightMember | null {
  const sanitizedIdentifier = identifier.trim();
  if (!sanitizedIdentifier) {
    return null;
  }

  const byUsernameId = membersByUsername.get(sanitizedIdentifier);
  if (byUsernameId) {
    const member = members.get(byUsernameId);
    if (!member) {
      return null;
    }
    if (!member.passwordHash) {
      return member;
    }
    return member.passwordHash === hashPassword(password) ? member : null;
  }

  const byEmailId = membersByEmail.get(sanitizedIdentifier.toLowerCase());
  if (byEmailId) {
    const member = members.get(byEmailId);
    if (!member) {
      return null;
    }
    if (!member.passwordHash) {
      return member;
    }
    return password ? (member.passwordHash === hashPassword(password) ? member : null) : null;
  }

  return null;
}

export function listLightMembers(): LightMember[] {
  return Array.from(members.values()).map((member) => ({ ...member }));
}
