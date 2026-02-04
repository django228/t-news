1. зависимости для бэкенда:

```bash
cd backend
npm install
```

2. база данных PostgreSQL с именем `tnews`

3. создать файл `.env` в папке `backend` и добавить:

```
DATABASE_URL="postgresql://postgres:твой_пароль@localhost:5432/tnews?schema=public"
```

4. миграции:

```bash
npm run prisma:migrate
```

5. prisma клиент:

```bash
npm run prisma:generate
```

6. (опционально) запустить сидер:

```bash
npm run prisma:seed
```

7. поднять бэкенд:

```bash
npm start
```

8. зависимости для фронтенда:

```bash
cd frontend
npm install
```

9. поднять фронтенд:

```bash
npm run dev
```

фронтенд на http://localhost:5173 
бэкенд на http://localhost:3000
