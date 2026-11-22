# Karten & Code

Persönliches Portfolio von Kirill Lisochenko: Geodaten, Kartografie und interaktive Webanwendungen.

Website: **https://kirman442.github.io/kc/**

React 18, Vite und eigenes CSS. Die Projektgeschichten werden beim Build als einzelne HTML-Seiten erzeugt; React ergänzt die interaktiven Komponenten im Browser.

## Lokal starten

Voraussetzung: Node.js 22.12 oder neuer.

```sh
npm ci
npm run dev
```

Entwicklung: http://127.0.0.1:5183/kc/

## Build und Prüfung

```sh
npm run check
npm run build
npm test
npm run preview
```

Der Preview-Server verwendet denselben Port wie der Entwicklungsserver; nur einen davon gleichzeitig starten.

Der Build erzeugt HTML, Metadaten, Sitemap und Weiterleitungen innerhalb von `/kc/`. Anschließend werden interne Links, Anker und die Groß-/Kleinschreibung von Dateinamen geprüft. Die Client-Tests prüfen React-Hydration und ausgewählte Interaktionen in jsdom. Sie ersetzen keine visuelle Browserprüfung und prüfen nicht die extern gehosteten Kartenanwendungen.

## Inhalte bearbeiten

- `src/projects.js`: Projektkatalog, Vorschaubilder, Datum und Reihenfolge.
- `src/routes.js`: Seiten und Metadaten.
- `src/*Article.jsx`, `FullProject.jsx`, `AboutPage.jsx`: Geschichten und Seiten.
- `src/ladeinfrastruktur-content.js`, `src/unfallatlas-trial-content.js`: strukturierte Projekttexte.
- `src/LegalPage.jsx`, `src/legal-details.js`: rechtliche Informationen und offene Prüfpunkte.
- `src/components.jsx`, `src/SiteHeader.jsx`, `src/MapEmbed.jsx`: gemeinsame Komponenten.
- `public/`: Bilder, Video und Browser-Icons.
- `site.config.mjs`: Basis-Pfad `/kc/`, Origin und Zielrepository.

`dist/` wird generiert und nicht von Hand bearbeitet. Eingebettete Anwendungen werden unabhängig von diesem Repository veröffentlicht.

## Projektbilder und responsive Vorschauen

1. Das freigegebene Titelbild in `public/assets/` ablegen (bevorzugt WebP, sRGB; für neue Cover etwa 2400 × 1200 Pixel). Das Original außerhalb der Website aufbewahren. Der Generator überschreibt WebP-Originale nicht.
2. Den Bildpfad in `src/projects.js` eintragen. Für eine neue Geschichte außerdem die Route und die Seite ergänzen. `imagePosition` steuert den Ausschnitt der Karte; das Titelbild wird separat auf der Projektseite positioniert.
3. Mit Python und Pillow ausführen (Windows):

   ```powershell
   py -3.11 scripts/prepare-project-images.py
   ```

   Alternativ: `python scripts/prepare-project-images.py`. Falls Pillow fehlt: `python -m pip install Pillow` in der verwendeten Python-Umgebung.

Der Generator liest den gesamten Projektkatalog, berücksichtigt EXIF-Ausrichtung und erzeugt WebP-Vorschauen mit 160, 192, 256, 320, 384, 480, 640, 960 und 1280 Pixel Breite (Qualität 76, bei Bedarf mit `--preview-quality` anpassbar, keine Vergrößerung, Seitenverhältnis bleibt erhalten). PNG-Quellen erhalten zusätzlich eine WebP-Fassung mit Qualität 86. Danach im Katalog den WebP-Pfad verwenden. `src/ProjectImage.jsx` wählt mit `srcset` und `sizes` die passende Datei für Kartengröße und Pixeldichte.

`public/assets/previews/` und `src/project-images.json` werden mit eingecheckt. Der Build braucht dadurch kein Python. `npm run check` meldet Projekte ohne vorbereitete oder mit fehlenden Vorschauen. Nach Änderungen: `npm run check`, `npm run build`, `npm test` und Desktop/Mobilansicht prüfen. Titelbilder werden nicht auf Polaroid-Größe verkleinert; nur die Vorschauen.

## Veröffentlichung

Der Workflow **Publish Karten & Code to kc** wird manuell in GitHub Actions gestartet. Er installiert die Abhängigkeiten, führt die Prüfungen aus und veröffentlicht `dist/` über GitHub Pages. `npm run check:publication` prüft das Zielrepository und meldet offene rechtliche Prüfpunkte; diese Prüfung ist keine rechtliche Freigabe.

Das frühere Portfolio unter `/gis/` bleibt eine unabhängige Website und wird durch diesen Workflow nicht geändert.

## Общие источники проектных историй

`src/ProjectSources.jsx` задаёт единое оформление: существующие участники первыми, затем три независимо раскрываемых блока. `SourceBlocks` принимает Markdown-блоки, а `SourceResources` строит строки из готовых React-данных; отдельные рендереры `dl/dt/dd` в страницах не нужны. Описания строк имеют структуру `<dd><p>…</p></dd>`. Обычные абзацы и списки сохраняют свою семантику.

При изменении источников сохранять язык страницы, весь текст и полный набор URL, включая ссылки в описаниях. Пример проверки унификации и её границы: `docs/maintenance-2026-11-22.md`.
