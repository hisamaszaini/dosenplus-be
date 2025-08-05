export function hasRole(role: string | string[], target: string): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(target);
}