# Обслуживание Karten & Code — 22.11.2026

Отчёт о подготовке изменений после `d8b5d96`. На момент описанных ниже локальных проверок коммит, push и deploy ещё не выполнялись. После просмотра dev владелец 22.11.2026 разрешил коммит и публикацию; итоговый выпуск указан в свежей передаче `portfolio_audit/56_new_chat_handoff_2026-11-22.md`.

## Datenschutz / Impressum

Проверены опубликованные правовые экраны восьми приложений. В Datenschutz портфолио добавлены прямые ссылки на оба раздела семи приложений; для U-Bahn in der Tiefe указаны реальные кнопки внутри приложения, без выдуманных deep links.

| Приложение | Подтверждённое устройство / опубликованные пояснения |
|---|---|
| U-Bahn in der Tiefe | GitHub Pages, локально поставляемые картографические данные; настройки `ubahn3d.*` в Local Storage |
| Flussströmung | GitHub Pages, CARTO; при включённом рельефе AWS Terrain Tiles; настройки и параметры печати в Local Storage |
| EnergieAtlas | GitHub Pages, CARTO; выбранная тема в Local Storage, возвратные состояния в Session Storage |
| MobileNetwork | Netlify, CARTO; настройки карты в памяти |
| Unfallkarte Deutschland | GitHub Pages, Supabase API, CARTO; настройки карты в памяти |
| Unfallatlas Deutschland | Netlify, CARTO; детали функций и хранения описаны на экране about |
| Ladeinfrastruktur | GitHub Pages, CARTO; выбранная тема в Local Storage, состояния также в URL |
| Berliner U-Bahn | GitHub Pages, собственные картографические файлы; настройки карты в памяти |

Публичные страницы открывались в headless Edge; правовые экраны дополнительно проверялись в изолированных контекстах браузера. Начальный сетевой просмотр ограничен стартовой загрузкой: отсутствие домена среди начальных запросов не доказывает его отсутствие во всех функциях. Ключи хранилища в общем контексте одного origin не приписывались каждому приложению: настройки U-Bahn 3D видны другим приложениям того же origin.

Bayern и Clustering / Ookla оставлены без изменений по указанию владельца. Их ссылки и iframe сохранены. Возможное закрытие Ookla — решение владельца, не выполненная задача.

Публичные документы GitHub подтверждают IP-протоколирование Pages и описывают область собственной ответственности GitHub. Не делалось предположение, что к конкретному аккаунту автоматически применён DPA. Этот пункт и два отложенных приложения остаются в `legalOpenItems`; `legalDraft` не отключён. Impressum самого портфолио не менялся. Дата Datenschutz: 22.11.2026.

Проверенные первичные документы:

- https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages#data-collection
- https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- https://github.com/customer-terms/github-data-protection-agreement

## Общая разметка источников

- `ProjectSources` задаёт общий заголовок, существующих участников первыми и три независимых закрытых disclosure.
- `SourceBlocks` преобразует Markdown; `SourceResources` единолично строит `dl/div/dt/dd/p` для строк источников.
- Flussströmung и EnergieAtlas переведены на общие компоненты. В Flussströmung не добавлялись выдуманные участники: раздел участников опционален.
- MobileNetwork сохраняет адаптер своих React-данных, но использует тот же `SourceResources`, включая `<dd><p>…</p></dd>`.
- Списки и абзацы, не являющиеся строками «название — описание», сохранены как списки и абзацы. Язык страниц сохранён, MobileNetwork английский.
- Полный нормализованный текст и полный список URL, включая повторения, совпали до/после для шести страниц: Flussströmung 36 ссылок, EnergieAtlas 41, MobileNetwork 29, Ladeinfrastruktur 35, Unfallatlas 45, U-Bahn 3D 20. Всего 206.

## GitHub Actions

Проверены официальные stable releases и `action.yml` через GitHub API. Все внешние действия закреплены по полному SHA:

| Action | Версия | SHA |
|---|---|---|
| checkout | v7.0.1 | 3d3c42e5aac5ba805825da76410c181273ba90b1 |
| setup-node | v7.1.0 | 949feb2413d6458794dcd2491c4babbbce0c15c1 |
| upload-pages-artifact | v5.0.0 | fc324d3547104276b827a68afc52ff2a11cc49c9 |
| deploy-pages | v5.0.1 | 368f82528645a54fb793d4d04e342629a3f51346 |

JS actions используют Node 24; composite upload-pages-artifact вызывает закреплённый upload-artifact v7. Node приложения остаётся 22, разрешения, target, concurrency и ручной `workflow_dispatch` сохранены. Workflow проверен actionlint. Реальный run новых версий не запускался: он публикует production, это следующий шаг после отдельного разрешения.

Первичные источники версий: https://github.com/actions/checkout/releases ; https://github.com/actions/setup-node/releases ; https://github.com/actions/upload-pages-artifact/releases ; https://github.com/actions/deploy-pages/releases .

## Проверки

- `npm run check` — PASS, 13 проектов.
- `npm run check:publication` — PASS с двумя явно сохранёнными пунктами legalOpenItems.
- `npm run build` — PASS, 17 страниц, 9 redirects, 716 links/files.
- `npm test` — PASS, гидратация 17 страниц и интерактивные проверки.
- `node scripts/verify-flussstroemung.mjs` — PASS, 26 фрагментов.
- `node scripts/verify-energieatlas.mjs` — PASS, 93 фрагмента.
- `actionlint .github/workflows/pages.yml` — PASS.
- Impeccable detect по изменённому UI — `[]`.
- Браузер: шесть страниц источников и Datenschutz, ширины 1440 и 390 px; без overflow и page errors, три disclosure изначально закрыты и раскрываются независимо. Размер текста описаний 15/14 px.
- Проверены скриншоты изменённых источников и Datenschutz.
- Мобильное кадрирование U-Bahn 3D не менялось.

Локальные диагностические JSON/скрипты и скриншоты — в `.build/` (ignored): `sources-unification-verification.json`, `maintenance-browser-verification.json`, `legal-texts-20261122.json`, `imprint-texts-20261122.json`, `actions-verified-20261122.json`, `maintenance-*.png`. Они содержат только публичные страницы и диагностические сведения, не договорные подтверждения владельца.
