import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@/generated/prisma'
import { CreateMessageSchema } from '@/lib/validation'

// POST /api/messages - Создать новое сообщение
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Валидируем входные данные
    const validatedData = CreateMessageSchema.parse(body)
    
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
    
    // Создаем сообщение
    const message = await prisma.message.create({
      data: {
        telegramUserId: validatedData.telegramUserId,
        messageId: BigInt(validatedData.messageId),
        chatId: BigInt(validatedData.chatId),
        text: validatedData.text,
        messageType: validatedData.messageType,
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : new Date(),
        isFromBot: validatedData.isFromBot
      }
    })
    
    // Обновляем время последней активности пользователя
    await prisma.telegramUser.update({
      where: { id: validatedData.telegramUserId },
      data: { lastActivityAt: new Date() }
    })
    
    return NextResponse.json({
      ...message,
      messageId: Number(message.messageId),
      chatId: Number(message.chatId)
    }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    
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
    const where: Prisma.MessageWhereInput = {}
    
    if (telegramUserId) {
      where.telegramUserId = telegramUserId
    }
    
    if (messageType) {
      where.messageType = messageType as import('@/generated/prisma').MessageType
    }
    
  if (isFromBot !== null && isFromBot !== undefined) {
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
              telegramId: true,
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
      messages: messages.map(message => ({
        ...message,
        messageId: Number(message.messageId),
        chatId: Number(message.chatId),
        user: message.user ? {
          ...message.user,
          telegramId: Number(message.user.telegramId)
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
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
