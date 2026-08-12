/**
 * formatRole — converts raw backend role strings to human-readable labels.
 *
 * Examples:
 *   "ROLE_APP_ADMIN"  → "App Admin"
 *   "APP_ADMIN"       → "App Admin"
 *   "ROLE_EVENT_ADMIN"→ "Event Admin"
 *   "ROLE_STUDENT"    → "Student"
 *   "STUDENT"         → "Student"
 */
export function formatRole(raw = '') {
  const clean = String(raw).replace(/^ROLE_/, '');   // strip ROLE_ prefix
  return clean
    .split('_')                                        // split on underscore
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * formatRoleClass — returns a stable CSS-friendly class key for a role.
 * e.g. "APP_ADMIN" → "app-admin", "EVENT_ADMIN" → "event-admin"
 */
export function formatRoleClass(raw = '') {
  return String(raw)
    .replace(/^ROLE_/, '')
    .toLowerCase()
    .replace(/_/g, '-');
}
