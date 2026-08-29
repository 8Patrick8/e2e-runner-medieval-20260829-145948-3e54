VERDICT: CHANGES_REQUESTED

## Sicherheitsprüfung RITTER-RUN

**Bewertungsbasis:** Sichtbarer Produktcode in `src/`, `index.html`, `vite.config.js` sowie der beigefügte `npm audit`-Report. `semgrep` wurde laut Scanner-Ausgabe übersprungen — diese Lücke wird unten dokumentiert, aber nicht als Befund gewertet.

### Prüfbereiche

1. **Secrets:** Keine hartkodierten Schlüssel, Passwörter, Token oder URLs gefunden. LocalStorage-Schlüssel `highscore` ist unbedenklich. **Keine Befunde.**

2. **Injection/Inputs:** 
   - Highscore aus LocalStorage wird in `src/game/scoring.js` über `Number(raw)` + `Number.isFinite(value)` + `value < 0` validiert. Akzeptiert werden nur endliche Zahlen >= 0. **Erfüllt AC-10.**
   - Alle dynamischen DOM-Ausgaben (`score`, `highscore`) erfolgen über `textContent`; `innerHTML`/`insertAdjacentHTML` kommen im Produktcode nicht vor. **Erfüllt AC-11.**
   - Keine SQL-, Command-, Pfad-Injection, kein unsicheres Deserialisieren, kein SSRF/XSS. Canvas-Eingaben sind numerisch aus dem Spielzustand; keine benutzerkontrollierten Strings. **Keine Befunde.**

3. **AuthN/AuthZ:** Nicht zutreffend — rein clientseitiges Spiel ohne Authentifizierung oder Sitzungsverwaltung. **Keine Befunde.**

4. **Dependencies:** Siehe separater Befund unten.

5. **Konfiguration/Transport:** 
   - Keine Netzwerkaufrufe (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`) vorhanden. **Erfüllt AC-12.**
   - Vite-Konfiguration ist minimal; kein offener Debug-/CORS-Modus.
   - Kein PII, nur Highscore als Zahl im LocalStorage.

---

## Befunde

### 1. Veraltete Dev-/Build-/Test-Toolchain mit bekannten Advisories
**Severität: mittel**  
**Betrifft:** `package.json`, `package-lock.json` (direkte Abhängigkeiten `vite`, `vitest`; transitive `esbuild`, `@vitest/mocker`, `vite-node`)

**Befund aus `npm audit`:**
- `vitest` (direkt, installierte Version ≤ 3.2.5): kritische Advisory **GHSA-5xrq-8626-4rwp** — bei laufendem Vitest-UI-Server kann eine beliebige Datei gelesen und ausgeführt werden (CVSS 9.8). Fix: `vitest` ≥ 4.1.11 (Major-Update).
- `vite` (direkt, installierte Version ≤ 6.4.2): hohe Advisory **GHSA-fx2h-pf6j-xcff** — `server.fs.deny`-Bypass auf Windows für alternative Pfade (CVSS 7.5); außerdem moderate Advisories zu Path-Traversal und NTLMv2-Hash-Disclosure. Fix: `vite` ≥ 8.2.2 (Major-Update).
- `esbuild` (transitiv über Vite) und `@vitest/mocker`/`vite-node` (transitiv über Vitest): moderate Advisories, werden durch die Major-Updates von Vite/Vitest mitbehoben.

**Risikobewertung:**  
Vite und Vitest sind reine Dev-/Test-Werkzeuge und nicht Teil des ausgelieferten statischen Browser-Builds. Das Produkt selbst ist nicht betroffen. Das Risiko besteht für Entwickler/CI, wenn `npm run dev`, `npm run test` oder der Vitest-UI-Server mit Netzwerkzugriff betrieben werden. Eine öffentlich erreichbare Dev-Server-Instanz wäre ausnutzbar; das ist hier nicht die Produktionsumgebung.

**Konkreter Fix:**
```bash
npm install --save-dev vite@^8.2.2 vitest@^4.1.11
```
Anschließend `npm test` und `npm run build` ausführen; Major-Updates auf Breaking Changes in `vite.config.js` und Testlauf prüfen.

---

### 2. Global exponierte Test-API im Produktions-Bundle
**Severität: niedrig**  
**Betrifft:** `src/main.js` ca. Zeile 18–28

**Befund:**  
```js
Object.defineProperty(window, '__TEST_API__', {
  configurable: false,
  writable: false,
  value: Object.freeze({
    get scene() { return state.scene; },
    get player() { return Object.freeze({ x: state.player.x, y: state.player.y }); },
    get score() { return state.score; },
  }),
});
```
Die API ist **lesend** und verrät nur Spielzustand (`scene`, Spielerposition, Punktzahl). Sie ist nicht schreibbar und stellt kein direkt ausnutzbares Sicherheitsrisiko dar. Sie bleibt aber im Produktions-Bundle erhalten und ist eine unnötige, nach außen sichtbare Testfläche.

**Konkreter Fix:**  
Die Test-API nur im Entwicklungsmodus definieren:
```js
if (import.meta.env.DEV) {
  Object.defineProperty(window, '__TEST_API__', { /* ... */ });
}
```
Alternativ die QA-Anbindung über eine bedingte Test-Hilfsfunktion realisieren und im Build nicht ausliefern. Dadurch wird die Angriffsfläche im Kundenprodukt entfernt, ohne die Funktion im Testbetrieb zu verlieren.

---

### 3. Fehlende Content-Security-Policy-Härtung (Empfehlung)
**Severität: niedrig (Härtung)**  
**Betrifft:** `index.html`

**Befund:**  
Das Spiel verwendet keine externen Ressourcen und injiziert keine Skripte; dennoch gibt es keine CSP. Eine restriktive Meta-CSP würde zusätzliche Defense-in-Depth gegen eventuelle XSS bieten.

**Konkreter Fix:**  
In `index.html` im `<head>` ergänzen:
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'">
```
Diese Policy ist mit dem Produkt kompatibel: Vite-Builds laden Skripte und Styles aus dem eigenen Ursprung, es gibt keine externen Skripte, Styles, Bilder oder Netzwerkverbindungen. Die lokal genutzten Canvas-Zeichenoperationen bleiben unberührt.

---

### 4. Nicht gelaufener SAST-Scan (semgrep)
**Severität: keine (Lücke dokumentiert)**  
**Betrifft:** Scanner-Ausgabe `semgrep`

**Befund:**  
`semgrep` wurde mit `[skipped] semgrep not installed` markiert. Das ist kein Befund, sondern eine Analyse-Lücke. Die manuelle Code-Analyse hat keine zusätzlichen Schwachstellen ergeben, aber ein vollständiger automatisierter SAST-Lauf sollte nachgeholt werden.

**Konkreter Fix:**  
`semgrep` in der Pipeline installieren und ausführen, z. B. `semgrep scan --config=auto` im CI-Schritt. Dadurch werden künftige statische Muster (z. B. versehentliche `innerHTML`-Nutzung) automatisiert erkannt.

---

## Fazit

**Keine blockierenden Schwachstellen** im Produktcode. Die Security-Akzeptanzkriterien AC-10, AC-11 und AC-12 sind erfüllt. Die `npm audit`-Advisories betreffen ausschließlich Dev-/Test-Werkzeuge und sind im statischen Kundenprodukt nicht vorhanden; dennoch sollten die veralteten Werkzeuge aktualisiert werden, um die Entwicklungs-/CI-Umgebung abzusichern. Die globale Test-API sollte im Build entfernt werden. Da es sich um Härtungsmaßnahmen und eine nicht produktive Dev-Abhängigkeit handelt, lautet das Urteil **CHANGES_REQUESTED** statt **BLOCKED**.