import { PrismaClient, TypeUserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get all values from the TypeUserRole enum
  const roles: TypeUserRole[] = Object.values(TypeUserRole);

  // Create roles if they don't exist
  for (const roleName of roles) {
    const existingRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!existingRole) {
      await prisma.role.create({
        data: { name: roleName },
      });
    }
  }

  // Create admin user if they don't exist
  const existingAdmin = await prisma.user.findFirst({
    where: { email: 'admin@hisam.ac.id' },
  });

  if (!existingAdmin) {
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin@hisam.ac.id',
        username: 'admin',
        name: 'Admin Sistem',
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    // Assign ADMIN role to the admin user
    const adminRole = await prisma.role.findUnique({
      where: { name: TypeUserRole.ADMIN },
    });

    if (adminRole) {
      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      });
    }

    console.log('✅ Admin user created and assigned ADMIN role!');
  } else {
    console.log('ℹ️ Admin already exists, skipped seeding.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });