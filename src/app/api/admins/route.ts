import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import type { Prisma } from '@/generated/prisma'

// GET /api/admins - Получить список админов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')
    
    const skip = (page - 1) * limit
    
    // Формируем фильтры
    const where: Prisma.AdminWhereInput = {}
    
    if (role) {
      where.role = role as import('@/generated/prisma').AdminRole
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }
    
    // Получаем админов с пагинацией
    const [admins, total] = await Promise.all([
      prisma.admin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              activities: true
            }
          }
        }
      }),
      prisma.admin.count({ where })
    ])
    
    return NextResponse.json({
      admins: admins.map(admin => ({
        ...admin,
        _count: {
          activities: Number(admin._count.activities)
        }
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
        pages: Math.ceil(Number(total) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admins - Создать нового админа
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      email,
      password,
      firstName,
      lastName,
      role = 'ADMIN'
    } = body
    
    // Проверяем обязательные поля
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Email, password, firstName, and lastName are required' },
        { status: 400 }
      )
    }
    
    // Проверяем, существует ли админ с таким email
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin with this email already exists' },
        { status: 409 }
      )
    }
    
    // Хешируем пароль
    const hashedPassword = await hashPassword(password)
    
    // Создаем нового админа
    const admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    return NextResponse.json(admin, { status: 201 })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
