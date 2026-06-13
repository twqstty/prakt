# Football Manager Web

Fullstack-проект футбольного менеджера: React + Vite frontend, Node.js + Express backend, PostgreSQL и Prisma ORM.

## Возможности

- Регистрация и авторизация через JWT.
- Хеширование паролей через bcrypt.
- Просмотр клубов, игроков, матчей, трансферов и турнирной таблицы.
- Покупка игрока в новый клуб.
- Админ-панель для добавления и удаления клубов/игроков, а также добавления матчей.
- Темная адаптивная футбольная тема на обычном CSS.

## Backend

```bash
cd prakt/backend
npm install
npm run db:push
npm run seed
npm run dev
```

Backend запускается на `http://localhost:5001`.

Файл `backend/.env` уже содержит пример:

```env
DATABASE_URL=postgresql://riad:1234@localhost:5432/football_manager
JWT_SECRET=secret123
PORT=5001
```

Перед миграцией создайте базу данных PostgreSQL:

```sql
CREATE DATABASE football_manager;
```

Тестовый пользователь после seed:

- Email: `admin@football.local`
- Password: `admin123`

## Frontend

```bash
cd prakt/frontend
npm install
npm run dev
```

Frontend запускается на адресе, который покажет Vite, обычно `http://localhost:5173`.

Файл `frontend/.env` уже содержит:

```env
VITE_API_URL=http://localhost:5001
```

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/clubs`
- `POST /api/clubs`
- `DELETE /api/clubs/:id`
- `GET /api/players`
- `POST /api/players`
- `DELETE /api/players/:id`
- `GET /api/matches`
- `POST /api/matches`
- `GET /api/transfers`
- `POST /api/transfers`
- `GET /api/league-table`
