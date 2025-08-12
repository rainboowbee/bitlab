const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const email = process.argv[2]
    const password = process.argv[3]
    const firstName = process.argv[4] || 'Admin'
    const lastName = process.argv[5] || 'User'

    if (!email || !password) {
      console.error('Usage: node create-admin.js <email> <password> [firstName] [lastName]')
      console.error('Example: node create-admin.js admin@example.com mypassword "John" "Doe"')
      process.exit(1)
    }

    // Проверяем, существует ли уже админ с таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingAdmin) {
      console.error('Admin with this email already exists')
      process.exit(1)
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 12)

    // Создаем админа
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role: 'SUPER_ADMIN',
        isActive: true
      }
    })

    console.log('✅ Admin created successfully!')
    console.log(`ID: ${admin.id}`)
    console.log(`Email: ${admin.email}`)
    console.log(`Name: ${admin.firstName} ${admin.lastName}`)
    console.log(`Role: ${admin.role}`)
    console.log('\nYou can now login to the CRM with these credentials.')

  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
