import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@gymdesk.com' },
  })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        name: 'Gym Manager',
        email: 'admin@gymdesk.com',
        password: hashedPassword,
      },
    })
    console.log('✅ Admin user created: admin@gymdesk.com / admin123')
    console.log('⚠️ Please change the password after logging in!')
  } else {
    console.log('ℹ️ Admin user already exists.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
