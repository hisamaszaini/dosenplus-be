export function hasRole(role: string | string[], target: string): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(target);
}

export function hasAnyRole(userRoles: string | string[] | any[], allowedRoles: string[]): boolean {
  const rolesArray = Array.isArray(userRoles)
    ? userRoles.map(r => (typeof r === 'string' ? r : r.role?.name)).filter(Boolean)
    : typeof userRoles === 'string'
    ? [userRoles]
    : [];

  return allowedRoles.some(role => rolesArray.includes(role));
}