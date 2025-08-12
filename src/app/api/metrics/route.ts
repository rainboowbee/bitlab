import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateTokenUsageSchema } from '@/lib/validation'

// GET /api/metrics - Получить метрики
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Совместимость с ботом: вернуть список расходов токенов по пользователю
    const metricType = searchParams.get('metricType')
    const telegramUserId = searchParams.get('telegramUserId')
    if (metricType === 'TOKEN_USAGE' && telegramUserId) {
      const user = await prisma.telegramUser.findUnique({
        where: { telegramId: BigInt(telegramUserId) },
        select: { id: true }
      })
      if (!user) {
        return NextResponse.json({ tokenUsage: [] })
      }
      const usages = await prisma.tokenUsage.findMany({
        where: { telegramUserId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 200
      })
      return NextResponse.json(usages.map(u => ({
        ...u,
        promptTokens: Number(u.promptTokens),
        completionTokens: Number(u.completionTokens),
        totalTokens: Number(u.totalTokens)
      })))
    }
    const period = searchParams.get('period') || '7d' // 7d, 30d, 90d
    
    // Вычисляем дату начала периода
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    
    // Получаем различные метрики
    const [
      totalUsers,
      newUsers,
      activeUsers,
      totalMessages,
      totalInteractions,
      totalTokenUsage,
      usersByStatus,
      messagesByType,
      interactionsByType,
      dailyStats
    ] = await Promise.all([
      // Общее количество пользователей
      prisma.telegramUser.count(),
      
      // Новые пользователи за период
      prisma.telegramUser.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      
      // Активные пользователи за период (с активностью)
      prisma.telegramUser.count({
        where: {
          lastActivityAt: {
            gte: startDate
          }
        }
      }),
      
      // Общее количество сообщений
      prisma.message.count(),
      
      // Общее количество взаимодействий
      prisma.interaction.count(),
      prisma.tokenUsage.aggregate({ _sum: { totalTokens: true } }),
      
      // Пользователи по статусам
      prisma.telegramUser.groupBy({
        by: ['status'],
        _count: {
          status: true
        }
      }),
      
      // Сообщения по типам
      prisma.message.groupBy({
        by: ['messageType'],
        _count: {
          messageType: true
        }
      }),
      
      // Взаимодействия по типам
      prisma.interaction.groupBy({
        by: ['interactionType'],
        _count: {
          interactionType: true
        }
      }),
      
      // Статистика по дням
      prisma.$queryRaw`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*) as new_users,
          COUNT(CASE WHEN "lastActivityAt" >= NOW() - INTERVAL '1 day' THEN 1 END) as active_users
        FROM telegram_users 
        WHERE "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30
      `
    ])
    
    // Форматируем данные
    const statusDistribution = usersByStatus.reduce((acc, item) => {
      acc[item.status] = Number(item._count.status)
      return acc
    }, {} as Record<string, number>)
    
    const messageTypeDistribution = messagesByType.reduce((acc, item) => {
      acc[item.messageType] = Number(item._count.messageType)
      return acc
    }, {} as Record<string, number>)
    
    const interactionTypeDistribution = interactionsByType.reduce((acc, item) => {
      acc[item.interactionType] = Number(item._count.interactionType)
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      period,
      overview: {
        totalUsers: Number(totalUsers),
        newUsers: Number(newUsers),
        activeUsers: Number(activeUsers),
        totalMessages: Number(totalMessages),
        totalInteractions: Number(totalInteractions),
        totalTokensSpent: Number(totalTokenUsage._sum.totalTokens || 0),
        retentionRate: totalUsers > 0 ? ((Number(activeUsers) / Number(totalUsers)) * 100).toFixed(2) : 0
      },
      distributions: {
        usersByStatus: statusDistribution,
        messagesByType: messageTypeDistribution,
        interactionsByType: interactionTypeDistribution
      },
      dailyStats: (dailyStats as Array<{ date: string; new_users: number; active_users: number }>).map((stat) => ({
        date: stat.date,
        new_users: Number(stat.new_users),
        active_users: Number(stat.active_users)
      }))
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/metrics - Записать использование токенов
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let data
    try {
      data = CreateTokenUsageSchema.parse(body)
    } catch (_) {
      // Режим совместимости с прежним форматом из бота
      // { telegramUserId: string(telegramId), model, promptTokens, completionTokens, totalTokens, cost, source }
      if (body && (body.telegramId || body.telegramUserId)) {
        const telegramIdPayload = body.telegramId ?? body.telegramUserId
        data = {
          telegramId: Number(telegramIdPayload),
          model: body.model ?? 'unknown',
          promptTokens: Number(body.promptTokens ?? 0),
          completionTokens: Number(body.completionTokens ?? 0),
          totalTokens: Number(body.totalTokens ?? 0),
          cost: typeof body.cost === 'number' ? body.cost : undefined,
          source: body.source ?? 'telegram_bot',
          createdAt: undefined
        }
      } else {
        throw _
      }
    }

    const user = await prisma.telegramUser.findUnique({
      where: { telegramId: BigInt(data.telegramId) },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const usage = await prisma.tokenUsage.create({
      data: {
        telegramUserId: user.id,
        model: data.model,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        cost: data.cost ?? null,
        source: data.source ?? 'telegram_bot',
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date()
      }
    })

    // Если нужна логика списания баланса токенов
    await prisma.telegramUser.update({
      where: { id: user.id },
      data: { tokenBalance: { decrement: data.totalTokens } }
    })

    return NextResponse.json(usage, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      )
    }
    console.error('Error creating token usage:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}