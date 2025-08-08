# Быстрая настройка CRM для Telegram бота

## Шаг 1: Настройка базы данных

1. Создайте PostgreSQL базу данных
2. Скопируйте файл переменных окружения:
   ```bash
   cp env.example .env
   ```
3. Отредактируйте `.env` файл, указав правильный `DATABASE_URL`

## Шаг 2: Установка зависимостей

```bash
npm install
```

## Шаг 3: Настройка базы данных

```bash
# Генерация Prisma клиента
npx prisma generate

# Создание таблиц в базе данных
npx prisma db push
```

## Шаг 4: Создание первого админа

```bash
node scripts/create-admin.js
```

По умолчанию создается админ:
- Email: `admin@example.com`
- Пароль: `admin123`
- Роль: `SUPER_ADMIN`

## Шаг 5: Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## Интеграция с Telegram ботом

### Пример создания пользователя через API:

```javascript
// Создание нового пользователя
const response = await fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    telegramId: 123456789,
    username: 'username',
    firstName: 'Имя',
    lastName: 'Фамилия',
    phoneNumber: '+1234567890',
    languageCode: 'ru',
    isPremium: false,
    isBot: false,
    source: 'bot_start'
  })
})
```

### Пример создания сообщения:

```javascript
// Создание сообщения
const response = await fetch('http://localhost:3000/api/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    telegramUserId: 'user-id-from-crm',
    messageId: 123,
    chatId: 456,
    text: 'Текст сообщения',
    messageType: 'TEXT',
    timestamp: new Date().toISOString(),
    isFromBot: false
  })
})
```

### Пример создания взаимодействия:

```javascript
// Создание взаимодействия
const response = await fetch('http://localhost:3000/api/interactions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    telegramUserId: 'user-id-from-crm',
    interactionType: 'COMMAND_START',
    description: 'Пользователь запустил бота',
    metadata: {
      command: '/start',
      chatType: 'private'
    }
  })
})
```

## Основные функции CRM

1. **Дашборд** - обзор метрик и статистики
2. **Пользователи** - управление пользователями бота
3. **Сообщения** - история всех сообщений
4. **Взаимодействия** - отслеживание действий пользователей

## Структура API

- `GET /api/users` - список пользователей
- `POST /api/users` - создание пользователя
- `GET /api/users/[id]` - информация о пользователе
- `PUT /api/users/[id]` - обновление пользователя
- `DELETE /api/users/[id]` - удаление пользователя
- `GET /api/messages` - список сообщений
- `POST /api/messages` - создание сообщения
- `GET /api/interactions` - список взаимодействий
- `POST /api/interactions` - создание взаимодействия
- `GET /api/metrics` - получение метрик
- `POST /api/auth/login` - вход админа
