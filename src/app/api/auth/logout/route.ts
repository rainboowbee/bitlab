import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // В JWT-based аутентификации сервер не хранит состояние сессий,
    // поэтому просто возвращаем успешный ответ
    // Клиент должен удалить токен из localStorage
    
    return NextResponse.json({
      message: 'Выход выполнен успешно'
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
