'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  telegramId: string
  username: string | null
  firstName: string | null
  lastName: string | null
  phoneNumber: string | null
  languageCode: string | null
  isPremium: boolean
  isBot: boolean
  status: string
  tags: string[]
  notes: string | null
  source: string | null
  createdAt: string
  updatedAt: string
  lastActivityAt: string
  messages: Message[]
  interactions: Interaction[]
  _count: {
    messages: number
    interactions: number
  }
}

interface Message {
  id: string
  messageId: string
  chatId: string
  text: string | null
  messageType: string
  timestamp: string
  isFromBot: boolean
  createdAt: string
}

interface Interaction {
  id: string
  interactionType: string
  description: string | null
  metadata: any
  createdAt: string
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    tags: '',
    notes: ''
  })

  useEffect(() => {
    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/users/${params.id}`)
      if (!response.ok) {
        throw new Error('User not found')
      }
      const data = await response.json()
      setUser(data)
      setFormData({
        status: data.status,
        tags: data.tags.join(', '),
        notes: data.notes || ''
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      router.push('/users')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...user,
          status: formData.status,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          notes: formData.notes
        })
      })

      if (response.ok) {
        setEditing(false)
        fetchUser()
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return
    }

    try {
      const response = await fetch(`/api/users/${params.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/users')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
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

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">User not found</div>
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
              <h1 className="text-3xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h1>
              <p className="text-gray-600">@{user.username || 'без username'}</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/users" 
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Назад к списку
              </Link>
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Отмена
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Информация о пользователе</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telegram ID</label>
                  <p className="mt-1 text-sm text-gray-900">{user.telegramId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Имя</label>
                  <p className="mt-1 text-sm text-gray-900">{user.firstName || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Фамилия</label>
                  <p className="mt-1 text-sm text-gray-900">{user.lastName || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-sm text-gray-900">@{user.username || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Телефон</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phoneNumber || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Язык</label>
                  <p className="mt-1 text-sm text-gray-900">{user.languageCode || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Premium</label>
                  <p className="mt-1 text-sm text-gray-900">{user.isPremium ? 'Да' : 'Нет'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Бот</label>
                  <p className="mt-1 text-sm text-gray-900">{user.isBot ? 'Да' : 'Нет'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Источник</label>
                  <p className="mt-1 text-sm text-gray-900">{user.source || 'Не указано'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Дата регистрации</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Последняя активность</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(user.lastActivityAt).toLocaleString('ru-RU')}
                  </p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Управление</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Статус</label>
                  {editing ? (
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="ACTIVE">Активный</option>
                      <option value="INACTIVE">Неактивный</option>
                      <option value="BLOCKED">Заблокированный</option>
                      <option value="PENDING">Ожидающий</option>
                    </select>
                  ) : (
                    <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Теги</label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                      placeholder="Введите теги через запятую"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {user.tags.map((tag, index) => (
                        <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Заметки</label>
                  {editing ? (
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{user.notes || 'Нет заметок'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages and Interactions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Messages */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Сообщения ({user._count.messages})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {user.messages.map((message) => (
                  <div key={message.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            message.isFromBot ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {message.isFromBot ? 'Бот' : 'Пользователь'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.timestamp).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-900">{message.text || '[Нет текста]'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  Взаимодействия ({user._count.interactions})
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {user.interactions.map((interaction) => (
                  <div key={interaction.id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {interaction.interactionType.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(interaction.createdAt).toLocaleString('ru-RU')}
                          </span>
                        </div>
                        {interaction.description && (
                          <p className="mt-1 text-sm text-gray-900">{interaction.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
