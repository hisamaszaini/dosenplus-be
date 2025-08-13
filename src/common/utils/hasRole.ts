export function hasRole(role: string | string[], target: string): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(target);
}

export function hasAnyRole(role: string | string[], targets: string[]): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return targets.some(r => roles.includes(r));
}