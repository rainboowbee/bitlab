import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validation'

// GET /api/users - Получить список пользователей
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const tag = searchParams.get('tag')
    const hasSubscription = searchParams.get('hasSubscription')
    
    const skip = (page - 1) * limit
    
    // Формируем фильтры
    const where: Prisma.TelegramUserWhereInput = {}
    
    if (status) {
      where.status = status as import('@/generated/prisma').UserStatus
    }
    
    if (search) {
      // Проверяем, является ли search числом (telegramId)
      const searchNumber = parseInt(search)
      if (!isNaN(searchNumber)) {
        where.telegramId = BigInt(searchNumber)
      } else {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ]
      }
    }
    
    if (tag) {
      where.tags = { has: tag }
    }

    if (hasSubscription !== null && hasSubscription !== undefined) {
      where.hasSubscription = hasSubscription === 'true'
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
      users: users.map(user => ({
        ...user,
        telegramId: Number(user.telegramId),
        tokenBalance: Number(user.tokenBalance),
        _count: {
          messages: Number(user._count.messages),
          interactions: Number(user._count.interactions)
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
    
    // Валидируем входные данные
    const validatedData = CreateUserSchema.parse(body)
    
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(validatedData.telegramId) }
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
        telegramId: BigInt(validatedData.telegramId),
        username: validatedData.username === null ? null : validatedData.username,
        firstName: validatedData.firstName === null ? null : validatedData.firstName,
        lastName: validatedData.lastName === null ? null : validatedData.lastName,
        phoneNumber: validatedData.phoneNumber === null ? null : validatedData.phoneNumber,
        languageCode: validatedData.languageCode === null ? null : validatedData.languageCode,
        isPremium: validatedData.isPremium === null ? false : validatedData.isPremium,
        isBot: validatedData.isBot === null ? false : validatedData.isBot,
        hasSubscription: validatedData.hasSubscription === null ? false : validatedData.hasSubscription,
        tokenBalance: validatedData.tokenBalance === null ? 0 : validatedData.tokenBalance,
        privacyAccepted: validatedData.privacyAccepted === null ? false : validatedData.privacyAccepted,
        privacyAcceptedAt: validatedData.privacyAcceptedAt ? new Date(validatedData.privacyAcceptedAt) : null,
        lastTokensIssuedAt: validatedData.lastTokensIssuedAt ? new Date(validatedData.lastTokensIssuedAt) : null,
        source: validatedData.source === null ? null : validatedData.source,
        tags: validatedData.tags,
        status: validatedData.status
      }
    })
    
    return NextResponse.json({
      ...user,
      telegramId: Number(user.telegramId)
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('Validation error:', error.message)
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users?telegramId=123 - Обновить пользователя по telegramId
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const telegramIdParam = searchParams.get('telegramId')
    if (!telegramIdParam) {
      return NextResponse.json({ error: 'telegramId is required' }, { status: 400 })
    }

    const body = await request.json()
    const validated = UpdateUserSchema.parse(body)

    // Фильтруем undefined значения
    const updateData: any = {}
    Object.entries(validated).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value
      }
    })
    
    // Обрабатываем поля даты
    if (updateData.privacyAcceptedAt) {
      updateData.privacyAcceptedAt = new Date(updateData.privacyAcceptedAt)
    }
    if (updateData.lastTokensIssuedAt) {
      updateData.lastTokensIssuedAt = new Date(updateData.lastTokensIssuedAt)
    }
    if (updateData.lastActivityAt) {
      updateData.lastActivityAt = new Date(updateData.lastActivityAt)
    }
    
    updateData.updatedAt = new Date()

    const user = await prisma.telegramUser.update({
      where: { telegramId: BigInt(telegramIdParam) },
      data: updateData
    })

    return NextResponse.json({ ...user, telegramId: Number(user.telegramId) })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('Validation error:', error.message)
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    console.error('Error updating user by telegramId:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
