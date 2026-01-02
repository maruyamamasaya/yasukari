export const MANUAL_BASIC_USER = process.env.MANUAL_BASIC_USER ?? "0000";
export const MANUAL_BASIC_PASS = process.env.MANUAL_BASIC_PASS ?? "0000";
export const ADMIN_BASIC_USER = process.env.ADMIN_BASIC_USER ?? "yasukari";
export const ADMIN_BASIC_PASS = process.env.ADMIN_BASIC_PASS ?? "yasukari2022";

export function isBasicAuthValid(
  authHeader: string | null,
  expectedUser: string,
  expectedPass: string
): boolean {
  if (!authHeader) return false;
  const [, encoded] = authHeader.split(" ");
  const [user, pass] = Buffer.from(encoded ?? "", "base64").toString().split(":");
  return user === expectedUser && pass === expectedPass;
}
