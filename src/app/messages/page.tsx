'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  messageId: string
  chatId: string
  text: string | null
  messageType: string
  timestamp: string
  isFromBot: boolean
  createdAt: string
  user: {
    id: string
    username: string | null
    firstName: string | null
    lastName: string | null
  }
}

interface MessagesResponse {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    telegramUserId: '',
    messageType: '',
    isFromBot: ''
  })

  useEffect(() => {
    fetchMessages()
  }, [pagination.page, filters])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.telegramUserId && { telegramUserId: filters.telegramUserId }),
        ...(filters.messageType && { messageType: filters.messageType }),
        ...(filters.isFromBot && { isFromBot: filters.isFromBot })
      })

      const response = await fetch(`/api/messages?${params}`)
      const data: MessagesResponse = await response.json()
      
      setMessages(data.messages)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching messages:', error)
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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'TEXT':
        return 'bg-blue-100 text-blue-800'
      case 'PHOTO':
        return 'bg-green-100 text-green-800'
      case 'VIDEO':
        return 'bg-purple-100 text-purple-800'
      case 'AUDIO':
        return 'bg-yellow-100 text-yellow-800'
      case 'DOCUMENT':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Сообщения</h1>
              <p className="text-gray-600">История сообщений пользователей</p>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                Тип сообщения
              </label>
              <select
                value={filters.messageType}
                onChange={(e) => handleFilterChange('messageType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все типы</option>
                <option value="TEXT">Текст</option>
                <option value="PHOTO">Фото</option>
                <option value="VIDEO">Видео</option>
                <option value="AUDIO">Аудио</option>
                <option value="DOCUMENT">Документ</option>
                <option value="STICKER">Стикер</option>
                <option value="VOICE">Голосовое</option>
                <option value="LOCATION">Местоположение</option>
                <option value="CONTACT">Контакты</option>
                <option value="OTHER">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отправитель
              </label>
              <select
                value={filters.isFromBot}
                onChange={(e) => handleFilterChange('isFromBot', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="false">Пользователь</option>
                <option value="true">Бот</option>
              </select>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Отправитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Текст
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
                {messages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        message.isFromBot ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {message.isFromBot ? 'Бот' : 'Пользователь'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMessageTypeColor(message.messageType)}`}>
                        {message.messageType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {message.text || '[Нет текста]'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(message.timestamp).toLocaleString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/users/${message.user.id}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {message.user.firstName} {message.user.lastName}
                        {message.user.username && ` (@${message.user.username})`}
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
