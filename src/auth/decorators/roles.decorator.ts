import { SetMetadata } from '@nestjs/common';
import { TypeUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: TypeUserRole[]) => SetMetadata(ROLES_KEY, roles);