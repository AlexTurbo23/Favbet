# Favbet E2E & API Tests

Проект с Playwright-тестами: E2E (UI) и API. Архитектура по OOP и POM: клиенты API, шаги (Steps), Page Objects, утилиты и спеки.

## Технологии

- Node.js + TypeScript
- Playwright
- POM (Page Object Model) + OOP
- Same-origin fetch для API-запросов

## Структура проекта

- pages/ — Page Objects (AuthPage, HomePage, LivePage, YouTubePage)
- tests/
  - api/ — API-спеки (bonuses-api.spec.ts, instant-games-favorites-api.spec.ts)
  - e2e/ — UI-спеки (favorites-management.spec.ts, settings-configuration.spec.ts и др.)
- utils/
  - api/ — OOP-клиенты API (authApi.ts, bonusesApi.ts, favoritesApi.ts), endpoints.ts, types.ts
  - e2e/ — Steps-слой (bonusesSteps.ts, favoritesSteps.ts)
  - base/ — BaseApiClient (same-origin fetch, helper’ы)
  - helpers/ — validators, e2eHelpers
  - session/ — resetSession
  - data/ — BASE_URL и CREDENTIALS

## Быстрый старт

1. Установка зависимостей и браузеров Playwright

```powershell
npm ci
npx playwright install
```

2. Настроить окружение

- `utils/data/baseUrl.ts` — базовый URL (например, https://www.favbet.ua)
- `utils/data/credentials.ts` — учётные данные тестового пользователя

## Запуск тестов

- Все тесты:

```powershell
npm test
```

- Конкретные спеки:

```powershell
npx playwright test tests/api/bonuses-api.spec.ts
npx playwright test tests/api/instant-games-favorites-api.spec.ts
npx playwright test tests/e2e/favorites-management.spec.ts
```

- Headed/UI режимы:

```powershell
npm run test:headed
npm run test:ui
```

## Lint и форматирование

```powershell
npm run lint        # Проверка ESLint
npm run lint:fix    # Автоисправление ESLint
npm run format      # Проверка Prettier
npm run format:fix  # Форматирование Prettier
```

## Allure отчёты

В проект подключён репортёр `allure-playwright`. После запуска тестов формируются результаты в `allure-results`.

- Сгенерировать HTML-отчёт и открыть:

```powershell
npm run allure:generate
npm run allure:open
```

- Быстро посмотреть отчёт (временный сервер из результатов):

```powershell
npm run allure:serve
```

Примечание: Playwright HTML-репорт тоже доступен и включён в конфиг (reporter: html + list).

## Архитектура API-слоя

- BaseApiClient выполняет запросы fetch из контекста страницы (`credentials: 'include'`), что даёт «естественные» куки/Referer и снижает 403/405.
- Кэширует `x-device-id` в `localStorage` и добавляет его как заголовок, где требуется.
- `endpoints.ts` — централизованные пути API.

Клиенты:

- AuthApi: `signIn`
- BonusesApi: `waitForUid`, `getAnyBonusCount`
- FavoritesApi: `saveFavorites`, `deleteFavorites`, `getEntities`, `listFavoriteGameIds`, `clearAllFavorites`

## Steps (POM-слой)

- `utils/e2e/favoritesSteps.ts`: `login`, `navigateToInstantGames`, `deleteFavorites`, `saveFavorites`, `listFavoriteIdsWithRetry`
- `utils/e2e/bonusesSteps.ts`: `login`, `ensureUid`, `getBonusCount`, `validateBonusCount`
- Тесты становятся краткими и читаемыми, логика находится в шагах.

## Частые сценарии

- Test 1 - Bonuses API: `login → ensureUid → getAnyBonusCount` и строгая валидация структуры ответа
- Test 2 - Instant Games Favorites API: `login → deleteFavorites → saveFavorites → getEntities` и строгая проверка соответствия списка

## Добавление нового эндпоинта

1. Добавить путь в `utils/api/endpoints.ts`
2. Реализовать метод в соответствующем клиенте (`utils/api/*Api.ts`) через same-origin helper (`postJsonSameOrigin`/`postFormSameOrigin`)
3. При необходимости — шаг в Steps (`utils/e2e/*Steps.ts`)
4. Написать тест в `tests/api` или `tests/e2e`
