const { PrismaClient } = require('../src/generated/prisma')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    console.log('Создание первого админа...')
    
    // Данные для создания админа
    const adminData = {
      email: 'admin@example.com',
      password: 'admin123', // Измените на безопасный пароль
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'SUPER_ADMIN'
    }
    
    // Проверяем, существует ли уже админ с таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: adminData.email }
    })
    
    if (existingAdmin) {
      console.log('Админ с таким email уже существует!')
      return
    }
    
    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(adminData.password, 12)
    
    // Создаем админа
    const admin = await prisma.admin.create({
      data: {
        email: adminData.email,
        password: hashedPassword,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role
      }
    })
    
    console.log('✅ Админ успешно создан!')
    console.log('Email:', admin.email)
    console.log('Пароль:', adminData.password)
    console.log('Роль:', admin.role)
    console.log('\n⚠️  Не забудьте изменить пароль после первого входа!')
    
  } catch (error) {
    console.error('❌ Ошибка при создании админа:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
