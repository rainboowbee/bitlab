import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createAdminSession } from '@/lib/auth'

// POST /api/auth/login - Вход админа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    // Проверяем обязательные поля
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    // Ищем админа по email
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Проверяем, активен ли админ
    if (!admin.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 401 }
      )
    }
    
    // Проверяем пароль
    const isValidPassword = await verifyPassword(password, admin.password)
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }
    
    // Создаем сессию
    await createAdminSession(admin.id)
    
    // Возвращаем данные админа (без пароля)
    const { password: _, ...adminData } = admin
    
    return NextResponse.json({
      admin: adminData,
      message: 'Login successful'
    })
  } catch (error) {
    console.error('Error during login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
