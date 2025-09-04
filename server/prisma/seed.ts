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
      password: '$2b$10$JuVoN6uJp1FPUqf8E5F88umz3BbFL1UVaW/wbTq2B7iioue0AuXAO',
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
      password: '$2b$10$JuVoN6uJp1FPUqf8E5F88umz3BbFL1UVaW/wbTq2B7iioue0AuXAO',
      fullName: 'Administrador Dos',
      role: 'admin',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Segundo admin creado o actualizado');
  process.stdout.write('Segundo admin OK\n');

  // Crear un usuario normal para pruebas
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'user@example.com',
      password: '$2b$10$JuVoN6uJp1FPUqf8E5F88umz3BbFL1UVaW/wbTq2B7iioue0AuXAO',
      fullName: 'Usuario de Prueba',
      role: 'user',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('Usuario de prueba creado o actualizado');

  console.log('Seed completado exitosamente!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
