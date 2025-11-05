export type RegistrationStatus = 'provisional' | 'full';

export type AuthenticatedUser = {
  id: string;
  username?: string;
  email?: string;
  registrationStatus: RegistrationStatus;
};

const TEST_USER = {
  id: 'test-admin-user',
  username: 'adminuser',
  email: 'admin@example.com',
  password: 'adminpass',
  registrationStatus: 'full' as const,
};

export type NormalizedLoginInput = {
  identifier: string;
  password: string;
  email?: string;
  phone?: string;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function normalizeLoginInput(input: unknown): NormalizedLoginInput {
  const record = (typeof input === 'object' && input !== null ? input : {}) as Record<string, unknown>;

  const password = typeof record.password === 'string' ? record.password : '';
  const email = typeof record.email === 'string' ? normalizeEmail(record.email) : undefined;
  const possibleIdentifiers: string[] = [];

  if (typeof record.identifier === 'string') {
    possibleIdentifiers.push(record.identifier.trim());
  }
  if (typeof record.username === 'string') {
    possibleIdentifiers.push(record.username.trim());
  }
  if (email) {
    possibleIdentifiers.push(email);
  }

  const identifier = possibleIdentifiers.find((value) => value.length > 0) ?? '';
  const phone = typeof record.phone === 'string' ? normalizePhoneNumber(record.phone) : undefined;

  return { identifier, password, email, phone };
}

export function authenticateTestUser(identifier: string, password: string): AuthenticatedUser | null {
  const trimmedIdentifier = identifier.trim();
  if (!trimmedIdentifier) {
    return null;
  }

  const isEmailMatch = normalizeEmail(trimmedIdentifier) === TEST_USER.email;
  const isUsernameMatch = trimmedIdentifier === TEST_USER.username;

  if (!isEmailMatch && !isUsernameMatch) {
    return null;
  }

  if (password !== TEST_USER.password) {
    return null;
  }

  return {
    id: TEST_USER.id,
    username: TEST_USER.username,
    email: TEST_USER.email,
    registrationStatus: TEST_USER.registrationStatus,
  };
}
