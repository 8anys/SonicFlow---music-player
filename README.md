# SonicFlow

Інструкція для запуску SonicFlow з PostgreSQL, Python Flask backend і React/Vite frontend.

## Вимоги

- Node.js 18+
- npm
- Python 3.10+
- PostgreSQL

Перевірка:

```bash
node -v
npm -v
python --version
```

## База даних

У PostgreSQL створюється база даних:

```text
sonicflow
```

Таблиці створюються автоматично під час запуску backend.

Схема бази даних:

```text
database/schema.sql
```

Початкові дані:

```text
database/seed.sql
```

Схема нормалізована до третьої нормальної форми:

- `users`
- `artists`
- `genres`
- `albums`
- `tracks`
- `track_artists`
- `playlists`
- `playlist_tracks`
- `liked_tracks`
- `recent_plays`

## Файл `.env`

У корені проєкту створюється файл `.env`.

Основний варіант підключення:

```bash
DATABASE_URL=postgres://postgres:your_postgres_password@127.0.0.1:5432/sonicflow
FLASK_SECRET_KEY=sonicflow-secret
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
```

Spotify-змінні потрібні тільки для Spotify Web Playback SDK. Без них сайт також запускається.

Альтернативний варіант підключення до PostgreSQL:

```bash
PGHOST=127.0.0.1
PGPORT=5432
PGDATABASE=sonicflow
PGUSER=postgres
PGPASSWORD=your_postgres_password
FLASK_SECRET_KEY=sonicflow-secret
```

## Python backend

У першому терміналі:

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

Backend запускається за адресою:

```text
http://127.0.0.1:5000/
```

Під час запуску backend:

- підключається до PostgreSQL
- створює таблиці, якщо їх ще немає
- додає початкові дані
- запускає API `/db-api`

## Frontend

У другому терміналі:

```bash
npm.cmd install
npm.cmd run dev
```

Сайт відкривається за адресою:

```text
http://127.0.0.1:5173/
```

Frontend звертається до backend через:

```text
/db-api
```

## Повторний запуск

Якщо залежності вже встановлені, для повторного запуску достатньо:

Перший термінал:

```bash
.\.venv\Scripts\Activate.ps1
python app.py
```

Другий термінал:

```bash
npm.cmd run dev
```

## Збірка

```bash
npm.cmd run build
```

Готова збірка створюється в папці:

```text
dist
```

## Streaming

Без Spotify Premium використовується Audius API для легального streaming повних треків незалежних артистів.

Spotify Web Playback SDK залишається додатковим режимом. Для повного відтворення Spotify-треків потрібен Spotify Premium акаунт.

