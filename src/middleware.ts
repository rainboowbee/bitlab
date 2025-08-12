import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const start = Date.now()
  
  // Логируем входящий запрос
  console.log(`[${new Date().toISOString()}] ${request.method} ${request.url}`)
  
  // Проверяем авторизацию для защищенных маршрутов
  const { pathname } = request.nextUrl
  
  // Пропускаем API маршруты авторизации и статические файлы
  if (pathname.startsWith('/api/auth/') || 
      pathname.startsWith('/_next/') || 
      pathname.startsWith('/favicon.ico') ||
      pathname === '/login') {
    const response = NextResponse.next()
    response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
    response.headers.set('X-Request-ID', Math.random().toString(36).substring(7))
    return response
  }
  
  // Для клиентской стороны токен хранится в localStorage, поэтому пропускаем проверку в middleware
  // Проверка будет происходить на уровне компонентов
  const response = NextResponse.next()
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`)
  response.headers.set('X-Request-ID', Math.random().toString(36).substring(7))
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
