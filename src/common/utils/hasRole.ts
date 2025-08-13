export function hasRole(role: string | string[], target: string): boolean {
  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(target);
}

export function hasAnyRole(userRoles: string | string[] | any[], allowedRoles: string[]): boolean {
  // normalisasi userRoles
  const rolesArray = Array.isArray(userRoles)
    ? userRoles.map(r => {
        const roleName = typeof r === 'string' ? r : r.role?.name;
        console.log('Mapped role:', r, '=>', roleName); // debug tiap item
        return roleName;
      }).filter(Boolean)
    : typeof userRoles === 'string'
    ? [userRoles]
    : [];

  console.log('Normalized rolesArray:', rolesArray);
  console.log('Allowed roles:', allowedRoles);

  const result = allowedRoles.some(role => rolesArray.includes(role));
  console.log('hasAnyRole result:', result);

  return result;
}

