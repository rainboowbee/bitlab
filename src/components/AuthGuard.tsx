'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')

      if (!token || !user) {
        router.push('/login')
        return
      }

      // Проверяем, не истек ли токен
      try {
        JSON.parse(user) // Проверяем, что JSON валиден
        // Здесь можно добавить дополнительную проверку токена
        setIsAuthenticated(true)
      } catch {
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
        router.push('/login')
        return
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Проверка авторизации...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
