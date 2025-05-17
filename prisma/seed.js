import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed...');
  process.stdout.write('Depuración activa...\n');
  // Crea dos usuarios admin
  await prisma.user.upsert({
    where: { email: 'admin1@example.com' },
    update: {},
    create: {
      username: 'admin1',
      email: 'admin1@example.com',
      password: '$2b$10$zsZSD64KuWC9p/8bx6Gw4OGwI8yWxmVOP4BREujwTPDMe3xy1pzey',
      fullName: 'Administrador Uno',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Primer admin creado o actualizado');
  process.stdout.write('Primer admin OK\n');

  await prisma.user.upsert({
    where: { email: 'admin2@example.com' },
    update: {},
    create: {
      username: 'admin2',
      email: 'admin2@example.com',
      password: '$2b$10$NPkMemW3U1jHCi0uk4em5u55cLZnDIA4ASRwjt279RbPop4xuu34q',
      fullName: 'Administrador Dos',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Segundo admin creado o actualizado');
  process.stdout.write('Segundo admin OK\n');

  console.log('Usuarios admin creados');
  process.stdout.write('Seed finalizado\n');
}

main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
