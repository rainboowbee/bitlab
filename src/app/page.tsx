'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Metrics {
  period: string
  overview: {
    totalUsers: number
    newUsers: number
    activeUsers: number
    totalMessages: number
    totalInteractions: number
    retentionRate: string
  }
  distributions: {
    usersByStatus: Record<string, number>
    messagesByType: Record<string, number>
    interactionsByType: Record<string, number>
  }
  dailyStats: Array<{
    date: string
    new_users: number
    active_users: number
  }>
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7d')

  useEffect(() => {
    fetchMetrics()
  }, [period])

  const fetchMetrics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/metrics?period=${period}`)
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    } finally {
      setLoading(false)
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
              <h1 className="text-3xl font-bold text-gray-900">Telegram Bot CRM</h1>
              <p className="text-gray-600">Управление пользователями и аналитика</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/users" 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Пользователи
              </Link>
              <Link 
                href="/messages" 
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Сообщения
              </Link>
              <Link 
                href="/interactions" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Взаимодействия
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex space-x-2">
            {['7d', '30d', '90d'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-50'
                }`}
              >
                {p === '7d' ? '7 дней' : p === '30d' ? '30 дней' : '90 дней'}
              </button>
            ))}
          </div>
        </div>

        {metrics && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.overview.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Новых пользователей</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.overview.newUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Активных пользователей</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.overview.activeUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Retention Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{metrics.overview.retentionRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Users by Status */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Пользователи по статусам</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.distributions.usersByStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{status.toLowerCase()}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages by Type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Сообщения по типам</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.distributions.messagesByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{type.toLowerCase()}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactions by Type */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Взаимодействия по типам</h3>
                <div className="space-y-3">
                  {Object.entries(metrics.distributions.interactionsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">{type.toLowerCase().replace('_', ' ')}</span>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика по дням</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Новых пользователей</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Активных пользователей</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {metrics.dailyStats.map((stat) => (
                      <tr key={stat.date}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.new_users}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stat.active_users}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
