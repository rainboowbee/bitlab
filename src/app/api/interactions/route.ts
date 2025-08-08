import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/interactions - Создать новое взаимодействие
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      telegramUserId,
      interactionType,
      description,
      metadata
    } = body
    
    // Проверяем обязательные поля
    if (!telegramUserId || !interactionType) {
      return NextResponse.json(
        { error: 'telegramUserId and interactionType are required' },
        { status: 400 }
      )
    }
    
    // Проверяем, существует ли пользователь
    const user = await prisma.telegramUser.findUnique({
      where: { id: telegramUserId }
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
        telegramUserId,
        interactionType,
        description,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null
      }
    })
    
    // Обновляем время последней активности пользователя
    await prisma.telegramUser.update({
      where: { id: telegramUserId },
      data: { lastActivityAt: new Date() }
    })
    
    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
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
    const where: any = {}
    
    if (telegramUserId) {
      where.telegramUserId = telegramUserId
    }
    
    if (interactionType) {
      where.interactionType = interactionType
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
              lastName: true
            }
          }
        }
      }),
      prisma.interaction.count({ where })
    ])
    
    return NextResponse.json({
      interactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
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
