import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/users/[id] - Получить пользователя по ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const user = await prisma.telegramUser.findUnique({
      where: { id: resolvedParams.id },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 50
        },
        interactions: {
          orderBy: { createdAt: 'desc' },
          take: 50
        },
        _count: {
          select: {
            messages: true,
            interactions: true
          }
        }
      }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ...user,
      telegramId: Number(user.telegramId),
      tokenBalance: Number(user.tokenBalance),
      _count: {
        messages: Number(user._count.messages),
        interactions: Number(user._count.interactions)
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Обновить пользователя
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    
    const {
      username,
      firstName,
      lastName,
      phoneNumber,
      languageCode,
      isPremium,
      hasSubscription,
      tokenBalance,
      privacyAccepted,
      privacyAcceptedAt,
      lastTokensIssuedAt,
      isBot,
      status,
      tags,
      notes,
      source
    } = body
    
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { id: resolvedParams.id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Обновляем пользователя
    const updatedUser = await prisma.telegramUser.update({
      where: { id: resolvedParams.id },
      data: {
        username,
        firstName,
        lastName,
        phoneNumber,
        languageCode,
        isPremium,
        hasSubscription,
        tokenBalance,
        privacyAccepted,
        privacyAcceptedAt: privacyAcceptedAt ? new Date(privacyAcceptedAt) : undefined,
        lastTokensIssuedAt: lastTokensIssuedAt ? new Date(lastTokensIssuedAt) : undefined,
        isBot,
        status,
        tags,
        notes,
        source,
        updatedAt: new Date()
      }
    })
    
    return NextResponse.json({
      ...updatedUser,
      telegramId: Number(updatedUser.telegramId)
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Удалить пользователя
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    // Проверяем, существует ли пользователь
    const existingUser = await prisma.telegramUser.findUnique({
      where: { id: resolvedParams.id }
    })
    
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Удаляем пользователя (каскадно удалятся сообщения и взаимодействия)
    await prisma.telegramUser.delete({
      where: { id: resolvedParams.id }
    })
    
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
