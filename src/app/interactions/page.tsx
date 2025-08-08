'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Interaction {
  id: string
  interactionType: string
  description: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  user: {
    id: string
    username: string | null
    firstName: string | null
    lastName: string | null
  }
}

interface InteractionsResponse {
  interactions: Interaction[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function InteractionsPage() {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    telegramUserId: '',
    interactionType: ''
  })

  useEffect(() => {
    fetchInteractions()
  }, [pagination.page, filters])

  const fetchInteractions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.telegramUserId && { telegramUserId: filters.telegramUserId }),
        ...(filters.interactionType && { interactionType: filters.interactionType })
      })

      const response = await fetch(`/api/interactions?${params}`)
      const data: InteractionsResponse = await response.json()
      
      setInteractions(data.interactions)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching interactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const getInteractionTypeColor = (type: string) => {
    switch (type) {
      case 'COMMAND_START':
        return 'bg-green-100 text-green-800'
      case 'COMMAND_HELP':
        return 'bg-blue-100 text-blue-800'
      case 'COMMAND_SETTINGS':
        return 'bg-purple-100 text-purple-800'
      case 'BUTTON_CLICK':
        return 'bg-yellow-100 text-yellow-800'
      case 'MENU_SELECTION':
        return 'bg-indigo-100 text-indigo-800'
      case 'PAYMENT':
        return 'bg-red-100 text-red-800'
      case 'SUBSCRIPTION':
        return 'bg-pink-100 text-pink-800'
      case 'FEEDBACK':
        return 'bg-orange-100 text-orange-800'
      case 'SUPPORT_REQUEST':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInteractionType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Взаимодействия</h1>
              <p className="text-gray-600">История взаимодействий пользователей с ботом</p>
            </div>
            <Link 
              href="/" 
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Назад к дашборду
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID пользователя
              </label>
              <input
                type="text"
                placeholder="Введите ID пользователя"
                value={filters.telegramUserId}
                onChange={(e) => handleFilterChange('telegramUserId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип взаимодействия
              </label>
              <select
                value={filters.interactionType}
                onChange={(e) => handleFilterChange('interactionType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все типы</option>
                <option value="COMMAND_START">Команда /start</option>
                <option value="COMMAND_HELP">Команда /help</option>
                <option value="COMMAND_SETTINGS">Команда /settings</option>
                <option value="BUTTON_CLICK">Клик по кнопке</option>
                <option value="MENU_SELECTION">Выбор из меню</option>
                <option value="PAYMENT">Оплата</option>
                <option value="SUBSCRIPTION">Подписка</option>
                <option value="FEEDBACK">Обратная связь</option>
                <option value="SUPPORT_REQUEST">Запрос в поддержку</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
          </div>
        </div>

        {/* Interactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Метаданные
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Время
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Пользователь
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {interactions.map((interaction) => (
                  <tr key={interaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getInteractionTypeColor(interaction.interactionType)}`}>
                        {formatInteractionType(interaction.interactionType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {interaction.description || '[Нет описания]'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {interaction.metadata ? (
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-800">
                              Показать метаданные
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(interaction.metadata, null, 2)}
                            </pre>
                          </details>
                        ) : (
                          '[Нет метаданных]'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(interaction.createdAt).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/users/${interaction.user.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {interaction.user.firstName} {interaction.user.lastName}
                        {interaction.user.username && ` (@${interaction.user.username})`}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Назад
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Вперед
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Показано{' '}
                    <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>
                    {' '}до{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>
                    {' '}из{' '}
                    <span className="font-medium">{pagination.total}</span>
                    {' '}результатов
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
