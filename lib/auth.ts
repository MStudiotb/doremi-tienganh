export const ADMIN_EMAIL = "mstudiotb@gmail.com";
export const ADMIN_PASSWORD_HASH =
  "$2b$12$IcAzjgUeJ5PbxbTyEUEw2eDr8vD0Vx6gp0kytgV2nldVVzLrgzxy2";

export function isAdmin(email?: string | null) {
  return email?.trim().toLowerCase() === ADMIN_EMAIL;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
