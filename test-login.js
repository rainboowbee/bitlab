const fetch = require('node-fetch')

async function testLogin() {
  try {
    console.log('Тестирование API входа...')
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin@example.com',
        password: 'admin123'
      })
    })

    console.log('Статус ответа:', response.status)
    console.log('Заголовки:', response.headers.raw())

    const data = await response.text()
    console.log('Тело ответа:', data)

    if (response.ok) {
      const jsonData = JSON.parse(data)
      console.log('✅ Вход успешен!')
      console.log('Токен:', jsonData.token ? 'Получен' : 'Отсутствует')
      console.log('Пользователь:', jsonData.user)
    } else {
      console.log('❌ Ошибка входа')
    }

  } catch (error) {
    console.error('Ошибка запроса:', error.message)
  }
}

testLogin()
