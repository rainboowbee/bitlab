import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users - Получить список пользователей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    
    const skip = (page - 1) * limit
    
    // Формируем фильтры
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (tag) {
      where.tags = { has: tag }
    }
    
    // Получаем пользователей с пагинацией
    const [users, total] = await Promise.all([
      prisma.telegramUser.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastActivityAt: 'desc' },
        include: {
          _count: {
            select: {
              messages: true,
              interactions: true
            }
          }
        }
      }),
      prisma.telegramUser.count({ where })
    ])
    
    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Создать нового пользователя
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      telegramId,
      username,
      firstName,
      lastName,
      phoneNumber,
      languageCode,
      isPremium = false,
      isBot = false,
      source
    } = body
    
    // Проверяем обязательные поля
    if (!telegramId) {
      return NextResponse.json(
        { error: 'telegramId is required' },
        { status: 400 }
      )
    }
    
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(telegramId) }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }
    
    // Создаем нового пользователя
    const user = await prisma.telegramUser.create({
      data: {
        telegramId: BigInt(telegramId),
        username,
        firstName,
        lastName,
        phoneNumber,
        languageCode,
        isPremium,
        isBot,
        source,
        tags: [],
        status: 'ACTIVE'
      }
    })
    
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
