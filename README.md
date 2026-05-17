# SonicFlow

Інструкція для запуску React/Vite проєкту SonicFlow.

## Вимоги

Проєкт запускається з такими інструментами:

- Node.js 18+
- npm

Перевірка версій:

```bash
node -v
npm -v
```

## Встановлення залежностей

Команда виконується в корені проєкту:

```bash
npm install
```

Якщо запуск відбувається через PowerShell і з'являється помилка про `npm.ps1`, використовується команда:

```bash
npm.cmd install
```

## Запуск проєкту

Команда для запуску локального сервера:

```bash
npm run dev
```
Або, якщо не працює, то

```bash
npm.cmd run dev
```

Після запуску сайт відкривається за адресою:

```text
http://127.0.0.1:5173/
```

## Spotify streaming

Для реального стримінгу використовується Spotify Web Playback SDK.

У Spotify Developer Dashboard створюється застосунок:

```text
https://developer.spotify.com/dashboard
```

У налаштуваннях застосунку додається Redirect URI:

```text
http://127.0.0.1:5173/
```

У корені проєкту створюється файл `.env` на основі `.env.example`:

```bash
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/
```

Після зміни `.env` сервер перезапускається:

```bash
npm.cmd run dev
```

У додатку натискається кнопка `Connect Spotify`. Після входу через Spotify сторінка `Discover` шукає треки в реальному каталозі Spotify, а плеєр запускає їх через Spotify Web Playback SDK.

Для відтворення повних треків потрібен Spotify Premium акаунт.

## Free streaming

Без Spotify Premium у проєкті використовується Audius API.

Audius дає легальний streaming повних треків незалежних артистів без авторизації користувача. Головна сторінка і сторінка `Discover` автоматично підтягують треки з Audius.

Spotify залишається додатковим режимом для користувачів з Premium.

## Збірка

Команда для створення production-збірки:

```bash
npm run build
```

Зібраний проєкт створюється в папці `dist`.

## Перегляд зібраного проєкту

```bash
npm run preview
```

## Перевірка коду

```bash
npm run lint
```

Автоматичне виправлення частини помилок:

```bash
npm run lint:fix
```

## Технології

- React 18
- Vite
- Tailwind CSS
- Base44 Vite Plugin
