import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/messages - Создать новое сообщение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      telegramUserId,
      messageId,
      chatId,
      text,
      messageType = 'TEXT',
      timestamp,
      isFromBot = false
    } = body
    
    // Проверяем обязательные поля
    if (!telegramUserId || !messageId || !chatId) {
      return NextResponse.json(
        { error: 'telegramUserId, messageId, and chatId are required' },
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
    
    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        telegramUserId,
        messageId: BigInt(messageId),
        chatId: BigInt(chatId),
        text,
        messageType,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
        isFromBot
      }
    })
    
    // Обновляем время последней активности пользователя
    await prisma.telegramUser.update({
      where: { id: telegramUserId },
      data: { lastActivityAt: new Date() }
    })
    
    return NextResponse.json(message, { status: 201 })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/messages - Получить сообщения с фильтрацией
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const telegramUserId = searchParams.get('telegramUserId')
    const messageType = searchParams.get('messageType')
    const isFromBot = searchParams.get('isFromBot')
    
    const skip = (page - 1) * limit
    
    // Формируем фильтры
    const where: any = {}
    
    if (telegramUserId) {
      where.telegramUserId = telegramUserId
    }
    
    if (messageType) {
      where.messageType = messageType
    }
    
    if (isFromBot !== null) {
      where.isFromBot = isFromBot === 'true'
    }
    
    // Получаем сообщения с пагинацией
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
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
      prisma.message.count({ where })
    ])
    
    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
