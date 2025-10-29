export type MockUserPlan = 'light' | 'admin';

export interface MockUserRecord {
  id: string;
  email: string;
  password: string;
  plan: MockUserPlan;
  createdAt: string;
}

const mockUserStore = new Map<string, MockUserRecord>();

const adminUser: MockUserRecord = {
  id: 'admin-1',
  email: 'adminuser',
  password: 'adminuser',
  plan: 'admin',
  createdAt: new Date().toISOString(),
};

mockUserStore.set(adminUser.email, adminUser);

export function findUserByEmail(email: string): MockUserRecord | undefined {
  return mockUserStore.get(email);
}

export function registerLightMember(email: string, password: string): MockUserRecord {
  if (mockUserStore.has(email)) {
    throw new Error('USER_EXISTS');
  }

  const record: MockUserRecord = {
    id: `user-${Date.now()}`,
    email,
    password,
    plan: 'light',
    createdAt: new Date().toISOString(),
  };

  mockUserStore.set(email, record);
  return record;
}

export function authenticateUser(email: string, password: string): MockUserRecord | null {
  const user = mockUserStore.get(email);
  if (!user) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return user;
}
