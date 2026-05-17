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

Для PowerShell:

```bash
npm.cmd run dev
```

Після запуску сайт відкривається за адресою:

```text
http://localhost:5173/
```

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

