VERDICT: CHANGES_REQUESTED

## Prüfbericht — Mittelalter-Endless-Runner (`web-vite`, öffentliche Browser-UI)

Bewertet wurden nur die sichtbaren Produktdateien und die Sprint-Spec. `README.md`, `AGENTS.md`, `DESIGN.md` und weitere Dateien existieren laut Branchliste, ihre Inhalte waren aber nicht vollständig sichtbar; nutzerzugängliche Pflichttexte müssen im Produkt-UI verankert sein, nicht nur in einer Repository-Datei.

---

## 1. DSGVO / TTDSG / Datenschutz

**Positiv:**
- `src/game/scoring.js` speichert ausschließlich einen numerischen Highscore im `localStorage`.
- `loadHighScore()` validiert gemäß AC-10: endliche Zahlen `>= 0`, sonst `0`.
- `saveHighScore()` und `loadHighScore()` fangen Speicherfehler ab.
- Keine Netzwerkaufrufe (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`) im sichtbaren Produktcode.
- Anzeigewerte werden per `textContent` geschrieben (`src/game/hud.js`, `src/game/scenes.js`), kein `innerHTML`.
- Ein numerischer lokaler Highscore ist ohne weitere Identifikatoren kein personenbezogenes Datum; eine Einwilligung für den `localStorage`-Zugriff ist nicht erforderlich, weil die Speicherung für den ausdrücklich gewünschten Spielfortschritt technisch erforderlich ist (TTDSG § 25 Abs. 2 Nr. 2).

**Befund DS-1 — hoch**  
Es fehlt eine nutzerzugängliche Datenschutzerklärung. Selbst wenn lokal keine personenbezogenen Daten verarbeitet werden, ist für eine öffentlich erreichbare Website transparent darzulegen, dass der Highscore nur lokal bleibt und beim Hosting übliche Server-/Zugriffsdaten anfallen können.

**Abhilfe:**  
Neue Datei `privacy.html` im Wurzelverzeichnis erstellen und aus `index.html` verlinken, z. B. im Start-Overlay und im Game-over-Overlay. Textbaustein:

> „Dieses Spiel überträgt keine Spielstände oder personenbezogenen Daten an den Betreiber. Der Highscore wird ausschließlich im LocalStorage deines Browsers gespeichert. Beim Aufruf der Website können durch den Hosting-Provider technisch notwendige Zugriffsdaten wie IP-Adresse, Datum und Uhrzeit verarbeitet werden (Art. 6 Abs. 1 lit. f DSGVO).“

**Befund DS-2 — niedrig**  
Es fehlt ein Hinweis zur Löschung des gespeicherten Highscores.

**Abhilfe:**  
In `privacy.html` aufnehmen:  
„Der Eintrag `highscore` im LocalStorage kann jederzeit über die Browser-Einstellungen oder ‚Website-Daten löschen‘ entfernt werden.“

**Befund DS-3 — kein Mangel**  
Kein Cookie- oder Consent-Banner erforderlich, da keine Cookies, Tracker oder sonstige einwilligungspflichtige Speicherungen sichtbar sind.

---

## 2. Impressum / Anbieterkennzeichnung

**Befund IM-1 — hoch**  
Im sichtbaren UI und in den sichtbaren Produktdateien ist keine Anbieterkennzeichnung vorhanden. Für eine öffentliche deutsche Website ist ein Impressum erforderlich, sobald sie nicht rein privat betrieben wird; die Marktreife-Logik verlangt einen absichernden Link.

**Abhilfe:**  
Neue Datei `impressum.html` erstellen und aus `index.html` in beiden Overlays verlinken. Erforderlich sind mindestens Name/Anschrift des Anbieters, schnelle Kontaktmöglichkeit (E-Mail), ggf. Vertretungsberechtigter.

```html
<a href="/impressum.html">Impressum</a>
<a href="/privacy.html">Datenschutz</a>
```

Die Links sollten im Start-Overlay und im Game-over-Overlay sichtbar sein, nicht nur auf einer separaten Seite.

---

## 3. EU Cyber Resilience Act (CRA)

**Positiv:**
- Das Produkt hat keine Laufzeit-Abhängigkeiten; `vite` und `vitest` sind reine Dev-Dependencies.
- Die sichtbaren Lizenzen der Dev-Dependencies sind MIT-kompatibel, kein Lizenzrisiko.
- `package-lock.json` ist vorhanden, was die Nachvollziehbarkeit der Abhängigkeiten fördert.
- Sicherheitskritische Eingaben werden validiert; es gibt kein Plaintext-Logging von Daten.

**Befund CRA-1 — mittel**  
Dokumentierte Sicherheitseigenschaften fehlen. Der CRA verlangt für Produkte mit digitalen Elementen dokumentierte sicherheitsrelevante Eigenschaften und sichere Grundeinstellungen.

**Abhilfe:**  
`SECURITY.md` oder ein Abschnitt in `README.md` ergänzen:

- Zweck: rein clientseitiges Browserspiel ohne Serverkommunikation.
- Sicherheitseigenschaften: keine Netzwerkaufrufe, kein Logging, keine Cookies/Tracker, LocalStorage-Validierung (`Number.isFinite`, `>= 0`), Ausgaben ausschließlich per `textContent`.
- Unterstützte Browser/Plattformen.
- Update-/Patch-Weg: „Bereitstellung und Aktualisierung erfolgen als statische Web-App über das Hosting; Sicherheitsupdates werden durch erneutes Deployment ausgeliefert.“

**Befund CRA-2 — mittel**  
Es fehlt eine SBOM-artige Übersicht der Abhängigkeiten und eine Projektlizenzangabe.

**Abhilfe:**  
In `package.json` ein Lizenzfeld ergänzen, z. B.:

```json
"license": "MIT"
```

Falls eine andere Lizenz gewünscht ist, entsprechend anpassen. Im `README.md` einen Abschnitt „Abhängigkeiten / SBOM“ anlegen: Laufzeit-Abhängigkeiten: keine; Dev-Dependencies: `vite`, `vitest` (MIT). `package-lock.json` verweist auf die exakte Auflösung.

---

## 4. EU AI Act

**Nicht anwendbar.**  
Es ist keine KI-Funktion sichtbar. Die prozedurale Hinderniserzeugung und Spielmechanik fällt nicht unter den AI Act.

---

## 5. Barrierefreiheit (WCAG / BITV / EAA / BFSG)

**Befund A11Y-1 — mittel**  
Das `<canvas>`-Element hat keinen zugänglichen Namen.

**Abhilfe in `index.html`:**

```html
<canvas id="game-canvas" role="img"
        aria-label="Ritter-Run: Endless-Runner-Spielfläche. Steuerung mit Leertaste oder Klick.">
</canvas>
```

**Befund A11Y-2 — mittel**  
Die Start- und Game-over-Overlays sind rein visuelle `div`-Overlays ohne Dialog-Semantik oder Fokusmanagement.

**Abhilfe:**  
In `index.html` den Overlays `role="dialog"`, `aria-modal="true"` und `aria-labelledby` geben:

```html
<div id="start-screen" class="overlay" hidden
     role="dialog" aria-modal="true" aria-labelledby="start-title">
  <h1 id="start-title" class="panel-title">RITTER-RUN</h1>
</div>
```

In `src/game/scenes.js` beim Einblenden des Start-Screens den Fokus auf den Titel setzen, beim Start auf das Canvas zurückgeben. Das verhindert, dass Tastaturnutzer:innen im unsichtbaren Overlay hängen bleiben.

**Befund A11Y-3 — niedrig**  
Der Punktestand ändert sich dynamisch, wird aber nicht für Screenreader angekündigt.

**Abhilfe in `index.html`:**

```html
<div id="hud-score" class="hud-score" aria-live="polite">0</div>
```

**Befund A11Y-4 — niedrig**  
Die sichtbare Steuerungshilfe („Leertaste oder Klick“) ist vorhanden, aber es gibt keine sichtbare Fokusmarkierung für Overlay-Links, sobald Pflichttexte ergänzt werden.

**Abhilfe:**  
In `src/style.css` einen sichtbaren Fokus-Stil ergänzen, z. B.:

```css
a:focus-visible,
button:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

---

## 6. Zusammenfassung

Keine blockierenden DSGVO-Verstöße oder Sicherheitslücken im Produktcode. Die ACs 10–12 sind im sichtbaren Code erfüllt. Für die Marktreife einer öffentlichen Browser-UI fehlen jedoch nutzerzugängliche Pflichttexte, CRA- und Accessibility-Nachrüstungen. Deshalb: `CHANGES_REQUESTED`.