import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createAdminSession(adminId: string) {
  // Обновляем время последнего входа
  await prisma.admin.update({
    where: { id: adminId },
    data: { lastLoginAt: new Date() }
  })
  
  // Создаем запись активности
  await prisma.adminActivity.create({
    data: {
      adminId,
      action: 'LOGIN',
      targetType: 'admin',
      targetId: adminId,
      details: { timestamp: new Date().toISOString() }
    }
  })
}

export async function logAdminActivity(
  adminId: string,
  action: string,
  targetType?: string,
  targetId?: string,
  details?: unknown
) {
  const safeDetails = details ? JSON.parse(JSON.stringify(details)) : null

  await prisma.adminActivity.create({
    data: {
      adminId,
      action,
      targetType,
      targetId,
      details: safeDetails,
    },
  })
}
