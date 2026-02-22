/**
 * Check if a user is an admin via ADMIN_EMAILS env var OR the is_admin DB flag.
 * Admins have full access to all features regardless of subscription tier.
 *
 * Set ADMIN_EMAILS in .env as comma-separated emails, e.g.:
 * ADMIN_EMAILS=admin@example.com,dev@example.com
 */
export function isAdmin(
  user: { email?: string | null } | null,
  profile?: { is_admin?: boolean | null } | null
): boolean {
  // DB flag takes priority — avoids relying solely on env
  if (profile?.is_admin === true) return true;
  if (!user?.email) return false;
  const emails = process.env.ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  return emails.includes(user.email.toLowerCase());
}
