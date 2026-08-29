# RITTER-RUN

Ein simples 2D-Endless-Runner-Browserspiel im Mittelalter-Stil: Ein automatisch
laufender Ritter springt über prozedural auftauchende Hindernisse (Fässer und
Zäune), das Lauftempo steigt mit der Zeit, Punkte nach Distanz plus Highscore im
LocalStorage, ein parallax scrollender Burg-/Hügel-Hintergrund sowie Start- und
Game-Over-Screen mit Neustart. Vanilla JavaScript auf HTML5-Canvas, ohne
Game-Framework.

## Tech-Stack

- JavaScript (Vanilla, ES-Module)
- Build: Vite
- Rendering: HTML5 Canvas 2D
- Laufzeit: Browser
- Speicherung: LocalStorage (Highscore)
- Tests: Vitest

## Installation

```sh
npm install
```

## Entwicklung / Ausführen

```sh
npm run dev
```

Danach im Browser die angezeigte URL öffnen (standardmäßig
http://localhost:5173). Hinweis: Die App muss über einen HTTP-Server geladen
werden — ES-Module funktionieren nicht über `file://`.

## Produktions-Build

```sh
npm run build
```

Der Build landet in `dist/`. Mit `npm run preview` lässt sich das Ergebnis
lokal ansehen.

## Tests

```sh
npm test
```

## Steuerung

- Leertaste oder Klick: springen / Spiel starten / Neustart

## Features

- Automatisch laufender Ritter (Platzhalter-Figur) mit Sprung per Leertaste/Klick
- Canvas-Game-Loop mit Delta-Zeit und HiDPI-Skalierung
- Parallax scrollender Hintergrund (Burg, Hügel, Boden)
- Prozedural auftauchende Hindernisse (Fässer, Zäune)
- Punktesystem mit Temposteigerung und Highscore im LocalStorage
- Start-Screen und Game-Over-Screen mit Neustart
