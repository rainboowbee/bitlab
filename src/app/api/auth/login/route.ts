import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Имя пользователя и пароль обязательны' },
        { status: 400 }
      )
    }

    // Ищем пользователя в базе данных
    const user = await prisma.admin.findUnique({
      where: { email: username.toLowerCase() }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Проверяем пароль
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { message: 'Неверное имя пользователя или пароль' },
        { status: 401 }
      )
    }

    // Создаем JWT токен
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Обновляем время последнего входа
    await prisma.admin.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    })

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
