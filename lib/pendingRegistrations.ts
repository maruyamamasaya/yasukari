export type PendingRegistration = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  createdAt: number;
};

const pendingRegistrations = new Map<string, PendingRegistration>();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function savePendingRegistration({
  email,
  password,
  fullName,
  phoneNumber,
}: {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}): PendingRegistration {
  const normalizedEmail = normalizeEmail(email);
  const sanitizedFullName = fullName.trim();
  const sanitizedPassword = password;
  const sanitizedPhoneNumber = phoneNumber.trim();

  const record: PendingRegistration = {
    email: normalizedEmail,
    password: sanitizedPassword,
    fullName: sanitizedFullName,
    phoneNumber: sanitizedPhoneNumber,
    createdAt: Date.now(),
  };

  pendingRegistrations.set(normalizedEmail, record);
  return record;
}

export function getPendingRegistration(email: string): PendingRegistration | null {
  const normalizedEmail = normalizeEmail(email);
  const record = pendingRegistrations.get(normalizedEmail);
  return record ? { ...record } : null;
}

export function clearPendingRegistration(email: string): void {
  const normalizedEmail = normalizeEmail(email);
  pendingRegistrations.delete(normalizedEmail);
}

export function clearAllPendingRegistrations(): void {
  pendingRegistrations.clear();
}
