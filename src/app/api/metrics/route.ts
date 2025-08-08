import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/metrics - Получить метрики
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
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
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)
    
    const messageTypeDistribution = messagesByType.reduce((acc, item) => {
      acc[item.messageType] = item._count.messageType
      return acc
    }, {} as Record<string, number>)
    
    const interactionTypeDistribution = interactionsByType.reduce((acc, item) => {
      acc[item.interactionType] = item._count.interactionType
      return acc
    }, {} as Record<string, number>)
    
    return NextResponse.json({
      period,
      overview: {
        totalUsers,
        newUsers,
        activeUsers,
        totalMessages,
        totalInteractions,
        retentionRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0
      },
      distributions: {
        usersByStatus: statusDistribution,
        messagesByType: messageTypeDistribution,
        interactionsByType: interactionTypeDistribution
      },
      dailyStats
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}