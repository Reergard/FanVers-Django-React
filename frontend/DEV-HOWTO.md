# Разработка фронтенда

## Где править

Работаете локально в `frontend/`.

**Важно:** Любое изменение исходников фронта (JS/TS/React-компоненты, CSS, роуты, тексты, картинки в `src/` и т.п.) требует новой сборки и выкладки `dist`, потому что Vite собирает и «упаковывает» всё в статические файлы с хешами. Старые файлы и ссылки на них становятся невалидными.

Сборочные артефакты не коммитим: `frontend/build/`, `frontend/dist/` игнорируются.

## Сборка и деплой

### Локальная разработка
```bash
npm run dev
# или
yarn dev
```

### Продовая сборка
Для прод-сборки Vite использует `VITE_API_URL`.

На сервере постоянного `frontend/.env.production` нет (удалён).
Для сборки фронта используйте локально `frontend/.env.production`, например:

```env
VITE_API_URL=https://fan-vers.com/api/
```

Затем соберите проект:
```bash
npm run build
# или
yarn build
```

Файл `.env.production` не коммить. После сборки его можно удалить.

### После изменений на сервере
После `git pull` на сервере саппорт должен:

1. **Пересобрать фронт:**
   ```bash
   cd /Fan-vers.com/app/src/frontend
   npm ci
   # при необходимости: echo "VITE_API_URL=https://fan-vers.com/api/" > .env.production
   npm run build
   ```

2. **Обновить раздаваемую статику:**
   ```bash
   rsync -a --delete dist/ /var/www/fanvers/
   nginx -t && sudo systemctl reload nginx
   ```

### В dev-режиме
При локальной разработке сборка не нужна — запускаете `npm run dev`, и Vite делает HMR (Hot Module Replacement). Но это только для локалки, на прод это не влияет.

## Что не трогать

- Не добавляйте в git `node_modules/`, `build/`, `dist/`, `.env*`, Redis-дампы.
- Не правьте файлы на сервере. Сборка/деплой — через PR и дальнейшие действия админа.

## Git-флоу для фронта

```bash
git checkout main
git pull --ff-only
git checkout -b feat/ui/<кратко-о-чём>

# правки/коммиты
git add .
git commit -m "feat(ui): ..."

# пуш ветки
git push -u origin feat/ui/<...>

# создаём PR в main
# после мержа деплой выполняет админ (pull на сервере и нужные действия)
```

## Памятка по игнорам

В корневом `.gitignore` уже есть правила: `frontend/build/`, `frontend/dist/`, `node_modules/`, `.env*` и др.

На сервере дополнительно локально скрыты через `.git/info/exclude`: `wt-frontend/` и `frontend/dist` — не трогайте.

## мини-FAQ

**Можно ли пушить прямо в main?**
Нет. Работайте через фиче-ветки и Pull Request. Прямые пуши в main запрещены политикой репозитория.

**Хочу добавить домен/источник CORS/CSRF. Где менять?**
Только через `.env`:
- `ALLOWED_HOSTS=...`
- `CSRF_TRUSTED_ORIGINS=...`

Для прод — правит админ на сервере. Для дев — в вашем локальном `.env`.

**Нужен билд фронта для прод — как быть?**
Локально задайте `VITE_API_URL` в `frontend/.env.production`, выполните сборку, проверьте. Артефакты в git не добавляем. Деплой — через PR и действия админа.

**Почему в логах/дереве нет celery.log, staticfiles/, dump.rdb?**
Они игнорируются по `.gitignore`. Так и должно быть.
