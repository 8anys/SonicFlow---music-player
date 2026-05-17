# SonicFlow

SonicFlow - це React/Vite застосунок для музичного сервісу.

## Вимоги

- Node.js 18 або новіше
- npm

Перевірити встановлені версії можна командами:

```bash
node -v
npm -v
```

## Встановлення

У корені проєкту виконайте:

```bash
npm install
```

Якщо у PowerShell з'являється помилка про `npm.ps1` і execution policy, використайте:

```bash
npm.cmd install
```

## Запуск у режимі розробки

```bash
npm run dev
```

Для PowerShell також можна запускати через:

```bash
npm.cmd run dev
```

Після запуску Vite покаже локальну адресу. Зазвичай це:

```text
http://localhost:5173/
```

Відкрийте цю адресу у браузері.

## Збірка проєкту

```bash
npm run build
```

Готові файли будуть створені у папці `dist`.

## Перегляд production-збірки

Спочатку виконайте збірку:

```bash
npm run build
```

Потім запустіть preview:

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

## Примітки

- Проєкт використовує Vite, React 18 і Tailwind CSS.
- У `vite.config.js` підключений плагін `@base44/vite-plugin`.
- Якщо запуск падає через відсутні залежності, повторно виконайте `npm install`.
- Для встановлення залежностей потрібен доступ до `https://registry.npmjs.org/`.

