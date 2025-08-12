import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import { CreateInteractionSchema } from '@/lib/validation'

// POST /api/interactions - Создать новое взаимодействие
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидируем входные данные
    const validatedData = CreateInteractionSchema.parse(body)
    
    // Проверяем, существует ли пользователь
    const user = await prisma.telegramUser.findUnique({
      where: { id: validatedData.telegramUserId }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Создаем взаимодействие
    const interaction = await prisma.interaction.create({
      data: {
        telegramUserId: validatedData.telegramUserId,
        interactionType: validatedData.interactionType,
        description: validatedData.description,
        metadata: validatedData.metadata ? JSON.parse(JSON.stringify(validatedData.metadata)) : null
      }
    })
    
    // Обновляем время последней активности пользователя
    await prisma.telegramUser.update({
      where: { id: validatedData.telegramUserId },
      data: { lastActivityAt: new Date() }
    })
    
    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
    console.error('Error creating interaction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/interactions - Получить взаимодействия с фильтрацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const telegramUserId = searchParams.get('telegramUserId')
    const interactionType = searchParams.get('interactionType')
    
    const skip = (page - 1) * limit
    
    // Формируем фильтры
    const where: Prisma.InteractionWhereInput = {}
    
    if (telegramUserId) {
      where.telegramUserId = telegramUserId
    }
    
    if (interactionType) {
      where.interactionType = interactionType as import('@/generated/prisma').InteractionType
    }
    
    // Получаем взаимодействия с пагинацией
    const [interactions, total] = await Promise.all([
      prisma.interaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              telegramId: true
            }
          }
        }
      }),
      prisma.interaction.count({ where })
    ])
    
    return NextResponse.json({
      interactions: interactions.map(interaction => ({
        ...interaction,
        user: interaction.user ? {
          ...interaction.user,
          telegramId: Number(interaction.user.telegramId)
        } : null
      })),
      pagination: {
        page,
        limit,
        total: Number(total),
        pages: Math.ceil(Number(total) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
