# Telegram Bot CRM

CRM система для управления пользователями Telegram бота с аналитикой и метриками.

## Возможности

- 📊 **Дашборд с метриками** - обзор ключевых показателей
- 👥 **Управление пользователями** - просмотр, редактирование, удаление
- 💬 **История сообщений** - все сообщения пользователей
- 🔄 **Взаимодействия** - отслеживание действий пользователей
- 🏷️ **Теги и категоризация** - организация пользователей
- 📈 **Аналитика** - статистика по периодам
- 🔐 **Система админов** - управление доступом

## Технологии

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL с Prisma ORM
- **Authentication**: bcryptjs для хеширования паролей

## Структура базы данных

### Основные модели:

- **TelegramUser** - пользователи бота
- **Message** - сообщения пользователей
- **Interaction** - взаимодействия пользователей
- **Admin** - администраторы CRM
- **AdminActivity** - активность админов
- **Metric** - метрики системы

## Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd crm-telegram
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка базы данных
```bash
# Создайте файл .env на основе .env.example
cp .env.example .env

# Настройте DATABASE_URL в .env файле
DATABASE_URL="postgresql://username:password@localhost:5432/crm_telegram"
```

### 4. Генерация Prisma клиента
```bash
npx prisma generate
```

### 5. Миграция базы данных
```bash
npx prisma db push
```

### 6. Создание первого админа
```bash
# Запустите скрипт для создания админа
node scripts/create-admin.js
```

### 7. Запуск приложения
```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## API Endpoints

### Пользователи
- `GET /api/users` - список пользователей с фильтрацией
- `POST /api/users` - создание пользователя
- `GET /api/users/[id]` - информация о пользователе
- `PUT /api/users/[id]` - обновление пользователя
- `DELETE /api/users/[id]` - удаление пользователя

### Сообщения
- `GET /api/messages` - список сообщений
- `POST /api/messages` - создание сообщения

### Взаимодействия
- `GET /api/interactions` - список взаимодействий
- `POST /api/interactions` - создание взаимодействия

### Метрики
- `GET /api/metrics` - получение метрик системы

### Админы
- `GET /api/admins` - список админов
- `POST /api/admins` - создание админа

### Аутентификация
- `POST /api/auth/login` - вход админа

## Интеграция с Telegram ботом

Для интеграции с вашим Telegram ботом используйте следующие API endpoints:

### Создание пользователя
```bash
POST /api/users
{
  "telegramId": 123456789,
  "username": "username",
  "firstName": "Имя",
  "lastName": "Фамилия",
  "phoneNumber": "+1234567890",
  "languageCode": "ru",
  "isPremium": false,
  "isBot": false,
  "source": "bot_start"
}
```

### Создание сообщения
```bash
POST /api/messages
{
  "telegramUserId": "user-id",
  "messageId": 123,
  "chatId": 456,
  "text": "Текст сообщения",
  "messageType": "TEXT",
  "timestamp": "2024-01-01T12:00:00Z",
  "isFromBot": false
}
```

### Создание взаимодействия
```bash
POST /api/interactions
{
  "telegramUserId": "user-id",
  "interactionType": "COMMAND_START",
  "description": "Пользователь запустил бота",
  "metadata": {
    "command": "/start",
    "chatType": "private"
  }
}
```

## Структура проекта

```
src/
├── app/
│   ├── api/                    # API endpoints
│   │   ├── users/             # Управление пользователями
│   │   ├── messages/          # Сообщения
│   │   ├── interactions/      # Взаимодействия
│   │   ├── metrics/           # Метрики
│   │   ├── admins/            # Админы
│   │   └── auth/              # Аутентификация
│   ├── users/                 # Страницы пользователей
│   ├── globals.css            # Глобальные стили
│   ├── layout.tsx             # Основной layout
│   └── page.tsx               # Главная страница (дашборд)
├── lib/
│   ├── prisma.ts              # Prisma клиент
│   └── auth.ts                # Утилиты аутентификации
└── generated/
    └── prisma/                # Сгенерированный Prisma клиент
```

## Разработка

### Добавление новых метрик
1. Создайте новый API endpoint в `src/app/api/metrics/`
2. Добавьте логику расчета метрики
3. Обновите интерфейс для отображения

### Добавление новых полей пользователя
1. Обновите схему Prisma в `prisma/schema.prisma`
2. Выполните миграцию: `npx prisma db push`
3. Обновите API endpoints и интерфейс

### Кастомизация интерфейса
- Стили: Tailwind CSS классы
- Компоненты: React функциональные компоненты
- Состояние: React hooks (useState, useEffect)

## Лицензия

MIT License
