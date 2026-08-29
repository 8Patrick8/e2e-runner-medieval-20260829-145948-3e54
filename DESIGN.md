# Design — Project Identity

> This document is project-long-lived. Tokens are not changed without
> the Architect's approval. Developers MUST use these tokens
> instead of improvising their own colors/spacings.

## Style Direction

Warme, schlichte Mittelalter-Optik im Retro-Browserstil: erdige Farben, klare Silhouetten und ein ruhiger Abendhimmel — charmant und gut lesbar für ein schlichtes Canvas-Spiel ohne externe Assets.

## Colors

- `--color-bg`: **#8ec5d6**
- `--color-fg`: **#2b1f16**
- `--color-accent`: **#d4a017**
- `--color-border`: **#5b4636**
- `--color-muted`: **#8a7a68**
- `--color-sky`: **#8ec5d6**
- `--color-sky_light`: **#b8dce8**
- `--color-cloud`: **#f4f1e8**
- `--color-castle`: **#6e5a4b**
- `--color-castle_dark`: **#4a3b30**
- `--color-castle_light`: **#8f7a66**
- `--color-hill_far`: **#7a9e6d**
- `--color-hill_near`: **#5d7f52**
- `--color-ground`: **#6b4a2f**
- `--color-ground_dark`: **#4a3320**
- `--color-ground_light`: **#8a6a45**
- `--color-steel`: **#9aa7b5**
- `--color-steel_dark`: **#4e5860**
- `--color-crimson`: **#b23a48**
- `--color-skin`: **#e8c39e**
- `--color-wood`: **#8b5a2b**
- `--color-wood_dark`: **#6b4320**
- `--color-wood_light`: **#a8723d**
- `--color-danger`: **#c0392b**
- `--color-overlay`: **rgba(43,31,22,0.55)**

## Typography

- `font_family`: 'Trebuchet MS', 'Segoe UI', system-ui, sans-serif
- `heading_weight`: 700
- `body_weight`: 400
- `size_scale`: 14px / 18px / 24px / 40px / 64px

## Spacing Scale

- `--space-0`: 4px
- `--space-1`: 8px
- `--space-2`: 12px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- `--space-6`: 48px

## Border-Radii

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 16px
- `--radius-pill`: 999px

## Components

### Button

Primär-Action: padding 12px 24px, radius md (8px), bg=accent #d4a017, Textfarbe=fg #2b1f16, min-height 44px (Touch-Target); hover: bg +10% Helligkeit (#e6b43a); active: 2px nach unten versetzt + Abdunklung (#c29315); disabled: opacity 0.6. Beschriftung 18px, Schriftgewicht 700, Umriss 2px border #5b4636.

### Sprite: Ritter (Spieler)

Größe 48×64 px (Hitbox 34×56 px). 4 Töne + Umriss: Stahl-Rüstung #9aa7b5, Stahl dunkel #4e5860, Wappenrot #b23a48, Haut #e8c39e, Gold-Akzent Feder #d4a017; Umriss #2b1f16 (2px). Lauf-Animation: 2 Frames im Wechsel (Beine vor/zurück, je 6px Versatz), 120 ms pro Frame. Sprungpose: Beine angewinkelt, Feder nach hinten. Silhouette muss auch ohne Details als 'Ritter mit Helm' lesbar sein — niemals einfarbige Rechtecke.

### Sprite: Fass (Hindernis)

Größe 36×44 px. Holztöne: #8b5a2b (Grund), #6b4320 (Schatten), #a8723d (Highlight), Metallband #3e2f23, Umriss #2b1f16 (2px). Vertikale Dauben-Linien plus zwei horizontale Bänder; Roll-Animation: 2 Frames (Band um 6px gedreht).

### Sprite: Zaun (Hindernis)

Größe 44×40 px. Holztöne: #7a5c3a (Grund), #5d4529 (Schatten), #a8723d (Highlight), Umriss #2b1f16. Drei senkrechte Latten mit zwei Querstreben und spitzen Enden; statisch, klar als Hindernis erkennbar.

### Hintergrund-Parallax (Burg & Hügel)

3 Ebenen + Himmel: (1) Himmel #8ec5d6 mit Wolken #f4f1e8, scrollt 0.1×; (2) ferne Burg #6e5a4b/#4a3b30/#8f7a66 plus Hügel #7a9e6d, scrollt 0.25×; (3) nahe Hügel #5d7f52, scrollt 0.5×. Boden #6b4a2f mit Streifen #4a3320/#8a6a45, scrollt 1.0×. Burg als Zinnen-Silhouette mit Türmen, Fenster 2px dunkel.

### HUD

Score oben links: 24px, Gewicht 700, Farbe #2b1f16 mit 1px hellem Schatten #f4f1e8 oder halbtransparentem Panel rgba(43,31,22,0.35), radius sm. Highscore oben rechts gleicher Stil; neuer Rekord: Akzentfarbe #d4a017 + Label 'NEU!'. Abstand zum Rand 16px. Muss auf jedem Hintergrund lesbar sein (Schatten/Panel).

### Screen: Start-Screen

Zentriert über Spielszene: Titel 'RITTER-RUN' 64px/700 in #2b1f16 mit Gold-Akzent #d4a017 und 2px Umriss; Untertitel 'Leertaste oder Klick zum Starten' 18px. Halbtransparentes Overlay rgba(43,31,22,0.55) für Kontrast, Panel radius lg (#f4f1e8, opacity 0.9, padding 32px 48px).

### Screen: Game-Over-Screen

Wie Start-Screen, Overlay rgba(43,31,22,0.55). Titel 'GAME OVER' 48px/700 in #c0392b; Punktestand 24px, Highscore 24px (neuer Rekord in #d4a017 + 'NEU!'); Hinweis 'Leertaste oder Klick für Neustart' 18px.

### Readability-Regeln

Spieler (Stahl/Gold/Rot) kontrastiert gegen Himmel #8ec5d6 und Hügel-Grüntöne durch dunklen 2px-Umriss und helle Rüstung; Hindernisse (Brauntöne) heben sich durch dunklen Umriss und wärmere Farbe vom grünen Hintergrund ab; Vordergrund-Elemente (Spieler, Hindernisse, Boden) nutzen gesättigte, dunkle Töne, Hintergrund-Ebenen entsättigte, hellere Töne.

## Layout Principles

- Canvas füllt den Viewport; Spielkoordinaten in einer virtuellen Höhe von 540 px skaliert (letterboxing ohne Verzerrung).
- Spieler-Grundlinie ca. 80 % der Canvas-Höhe; Hindernisse auf gleicher Grundlinie.
- HUD-Elemente mit 16px Rand, feste Ecken oben links/rechts.
- Breakpoints: unter 640px Breite HUD-Schrift auf 18px reduzieren, ab 1024px 24px beibehalten.
- Text immer mit Schatten oder Panel für Kontrast; Anzeigewerte ausschließlich per textContent ins DOM schreiben.
