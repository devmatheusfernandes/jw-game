export const ADMIN_EMAILS: string[] = [];

// Também verifica variável de ambiente
const ENV_ADMINS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim())
  .filter(Boolean);

export function isAdmin(email?: string | null) {
  if (!email) return false;
  return [...ADMIN_EMAILS, ...ENV_ADMINS].includes(email);
}
