# Favbet E2E & API Tests

Коротко: проект с Playwright-тестами, разделёнными на E2E (UI) и API. Код организован по OOP и POM: клиенты API, шаги (Steps), страничные объекты (Pages), утилиты и тесты.

## Технологии
- Node.js + TypeScript
- Playwright
- POM (Page Object Model) + OOP
- Same-origin fetch для API-запросов

## Структура проекта
- pages/ — Page Objects для UI (AuthPage, HomePage, LivePage, YouTubePage)
- tests/
  - api/ — API-спеки (bonuses-api.spec.ts, instant-games-favorites-api.spec.ts)
  - e2e/ — UI-спеки (favorites-management.spec.ts и др.)
- utils/
  - api/ — OOP-клиенты API (authApi.ts, bonusesApi.ts, favoritesApi.ts), endpoints.ts, types.ts
  - e2e/ — Steps-слой (bonusesSteps.ts, favoritesSteps.ts)
  - base/ — BaseApiClient (same-origin fetch, helper’ы)
  - helpers/ — assert, retry, validators, e2eHelpers
  - session/ — resetSession
  - data/ — BASE_URL и CREDENTIALS

## Подготовка
1) Установить зависимости:
- PowerShell
  - npm ci
  - npx playwright install

2) Настроить окружение:
- utils/data/baseUrl.ts — базовый URL (например, https://www.favbet.ua)
- utils/data/credentials.ts — учётные данные тестового пользователя

## Запуск тестов
- Все тесты (по умолчанию): 
  - npm test
- Только API (headless), если в playwright.config настроен проект api-chromium:
  - npx playwright test tests/api --project=api-chromium
- Только E2E (headed), если настроен проект e2e-chromium:
  - npx playwright test tests/e2e --project=e2e-chromium

## Архитектура API-слоя
- BaseApiClient: выполняет запросы fetch из контекста страницы (credentials: 'include'), что даёт «естественные» куки/Referer и снижает 403/405.
- Кэширует x-device-id в localStorage и добавляет его как заголовок, где требуется.
- endpoints.ts: централизованные пути API.

Клиенты:
- AuthApi: signIn
- BonusesApi: waitForUid, getAnyBonusCount
- FavoritesApi: saveFavorites, deleteFavorites, getEntities, listFavoriteGameIds, clearAllFavorites

## Steps (POM-слой)
- utils/e2e/favoritesSteps.ts: login, navigateToInstantGames, deleteFavorites, saveFavorites, listFavoriteIdsWithRetry
- utils/e2e/bonusesSteps.ts: login, ensureUid, getBonusCount, validateBonusCount
- Тесты становятся краткими и читаемыми, логика спрятана в шаги.

## Частые сценарии
- Test 2 - Instant Games Favorites API:
  - login → deleteFavorites → saveFavorites → getEntities → строгая проверка соответствия списка добавленным играм
- Favbet API - Auth + Bonuses:
  - login → ensureUid → getAnyBonusCount → строгая валидация структуры ответа

## Добавление нового эндпоинта
1) Добавить путь в utils/api/endpoints.ts
2) Реализовать метод в соответствующем клиенте (utils/api/*Api.ts) через same-origin helper (postJsonSameOrigin/postFormSameOrigin)
3) При необходимости — шаг в Steps (utils/e2e/*Steps.ts)
4) Написать тест в tests/api или tests/e2e

Пример (эскиз метода):
- TypeScript
  - const res = await this.postJsonSameOrigin(ENDPOINTS.favorites.save, { casino_games: ids.map(id => ({ id })) }, { 'x-device-id': await this.ensureDeviceId() });

## Траблшутинг
- 405 Not Allowed:
  - Убедитесь, что запрос идёт same-origin (из страницы), URL относительный, Referer — корректной страницы (например, /en/instant-games/)
- 403 Forbidden:
  - Добавьте x-device-id (ensureDeviceId), убедитесь в действительной сессии (uid)
- “uid cookie not found”:
  - После login дождитесь uid (waitForUid) или сделайте переход на стабильную страницу домена и повторите ожидание
