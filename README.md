# 🏰 Legends of the Realm - Fantasy Wargame

Ein browserbasiertes Echtzeit-Strategiespiel im Fantasy-Setting, inspiriert von Dungeons & Dragons.

## 🎮 Features

### Spielmodi
- **Story-Modus**: Erlebe eine epische Geschichte und rette die Prinzessin!
  - Mission 1: Die Entführung - Rette die Prinzessin aus den Klauen des Bösen
  - Mission 2: Der dunkle Wald - Kämpfe durch den verfluchten Wald
  - Mission 3: Die letzte Schlacht - Die finale Konfrontation in den Bergen

- **Battle-Modus**: Kämpfe gegen KI-Gegner in verschiedenen Szenarien
  - Scharmützel (Einfach)
  - Eroberung (Mittel)
  - Überleben (Schwer)

### 🎵 Audio & Musik
- **Dynamische Hintergrundmusik**: Synthesizer-basierte Fantasy-Musik
- **Sound-Effekte**: 
  - Klick-Sounds bei Einheiten-Auswahl
  - Angriffs-Sounds im Kampf
  - Bau-Sounds beim Trainieren neuer Einheiten
- **Lautstärke-Regler**: Separate Steuerung für Musik und Sound-Effekte

### ⚙️ Einstellungen
- **Musik-Lautstärke**: Anpassbare Hintergrundmusik (0-100%)
- **Sound-Effekte**: Anpassbare SFX-Lautstärke (0-100%)
- **Scroll-Geschwindigkeit**: Kamera-Geschwindigkeit anpassen (5-30)
- **Gitter anzeigen**: Ein/Aus für das Spielfeld-Raster
- **Rand-Scrolling**: Kamera-Bewegung an Bildschirmrändern aktivieren/deaktivieren

### Einheiten

| Einheit | Icon | Typ | Stärken |
|---------|------|-----|---------|
| **Heiliger Ritter** | 🛡️ | Nahkampf | Hohe Verteidigung, Stark im Nahkampf |
| **Zauberer** | 🧙 | Fernkampf | Mächtige Zauber, Hoher Schaden |
| **Bogenschütze** | 🏹 | Fernkampf | Große Reichweite, Schnell |
| **Zwerg** | ⛏️ | Nahkampf | Sehr robust, Ressourcensammlung |
| **Elfe** | 🧝 | Fernkampf/Support | Heilung, Schnell, Vielseitig |
| **Prinzessin** | 👸 | Support | Buffs für Verbündete, Führung |

### Fähigkeiten
Jede Einheit hat unique Fähigkeiten:
- **Ritter**: Schildstoß (Betäubung), Heiliger Schlag
- **Zauberer**: Feuerball (AoE), Eisstoß (Verlangsamung), Teleport
- **Bogenschütze**: Schnellschuss, Giftpfeil
- **Zwarf**: Bergbau (Ressourcen-Bonus), Erdschlag (AoE Betäubung)
- **Elfe**: Heilung, Segen der Natur (Buff), Flinker Schuss
- **Prinzessin**: Inspiration (Gruppen-Buff), Göttlicher Schutz, Königlicher Befehl

### Ressourcen
- 💰 **Gold**: Hauptressource für Einheiten
- 🌲 **Holz**: Benötigt für Bogenschützen und Gebäude
- ⚡ **Mana**: Für magische Einheiten und Fähigkeiten

### 🏗️ Gebäude-System
- **🏰 Burg**: Hauptgebäude, trainiert alle Einheiten
- **⚔️ Kaserne**: Trainiert Nahkämpfer (Ritter, Bogenschützen, Zwerge)
- **🧙 Magierschule**: Beschwört magische Einheiten + generiert Mana
- **🗼 Abwehrturm**: Automatische Verteidigung gegen Feinde
- **⛏️ Goldmine**: Generiert Gold (muss nahe Goldvorkommen gebaut werden)
- **🪓 Holzfällerlager**: Generiert Holz (muss nahe Wald gebaut werden)
- **⛲ Mana-Brunnen**: Generiert Mana kontinuierlich

### 🗺️ Landschafts-Elemente

**Ressourcen (sammelbar):**
- 💰 **Goldvorkommen**: Baue Goldmine in der Nähe
- 🌲 **Wald**: Baue Holzfällerlager in der Nähe
- 💎 **Mana-Kristalle**: Direkt sammelbar, hohes Mana

**Hindernisse:**
- ⛰️ **Berge**: Nicht passierbar
- 🪨 **Felsen**: Blockieren den Weg
- 🌊 **Wasser**: Nicht überquerbar
- 🌳 **Bäume**: Können zerstört werden

### 🎮 Gameplay-Features
- **Dynamische Terrain-Generierung**: Jede Mission hat unterschiedliche Ressourcen-Verteilung
- **Ressourcen-Management**: Baue Minen und Lager für kontinuierliche Ressourcen
- **Strategisches Bauen**: Platziere Gebäude taktisch
- **Automatische Verteidigung**: Türme schützen deine Basis
- **Pathfinding**: Einheiten navigieren automatisch um Hindernisse

## 🕹️ Steuerung

### Maus
- **Linksklick**: Einheit auswählen
- **Linksklick + Ziehen**: Mehrere Einheiten auswählen
- **Rechtsklick**: Bewegungs- oder Angriffsbefehl
- **Mausrad**: Zoom
- **Bildschirmränder**: Kamera bewegen (wenn aktiviert)

### Tastatur
- **Pfeiltasten / WASD**: Kamera bewegen
- **ESC**: Auswahl aufheben / Pause-Menü / Baumodus abbrechen
- **Shift + Klick**: Zur Auswahl hinzufügen
- **Strg + 1-9**: Kontrollgruppe erstellen
- **1-9**: Kontrollgruppe auswählen

### Gebäude bauen
1. Wähle deine Burg (Linksklick)
2. Klicke auf das gewünschte Gebäude unten
3. Bewege die Maus zur gewünschten Position (grün = gültig, rot = ungültig)
4. Rechtsklick zum Platzieren
5. Minen und Holzfäller müssen in der Nähe von Ressourcen gebaut werden!

## 🚀 Installation & Start

### Lokaler Start (einfachste Methode)

1. Alle Dateien in einen Ordner herunterladen
2. Doppelklick auf `index.html`
3. Das Spiel öffnet sich im Browser!

### Mit lokalem Server (empfohlen für beste Performance)

#### Option 1: Python
```bash
# Python 3
cd /Users/andynope/Documents/wargame
python3 -m http.server 8000

# Dann öffne: http://localhost:8000
```

#### Option 2: Node.js (http-server)
```bash
npm install -g http-server
cd /Users/andynope/Documents/wargame
http-server

# Dann öffne: http://localhost:8080
```

#### Option 3: PHP (für dein Plesk-Hosting)
```bash
cd /Users/andynope/Documents/wargame
php -S localhost:8000

# Dann öffne: http://localhost:8000
```

## 📤 Deployment auf Plesk Hosting

### Upload via FTP/SFTP:
1. Verbinde dich mit deinem Plesk Server
2. Lade alle Dateien in den `httpdocs` oder `public_html` Ordner
3. Stelle sicher, dass die Ordnerstruktur erhalten bleibt:
   ```
   /httpdocs/
   ├── index.html
   ├── css/
   │   └── style.css
   └── js/
       ├── config.js
       ├── units.js
       ├── ai.js
       ├── pathfinding.js
       ├── missions.js
       ├── renderer.js
       ├── game.js
       └── main.js
   ```
4. Öffne die Domain im Browser!

### Via Plesk File Manager:
1. Logge dich in Plesk ein
2. Gehe zu "Dateien" → "Dateimanager"
3. Navigiere zu `httpdocs`
4. Lade alle Dateien und Ordner hoch
5. Fertig!

## 🎯 Spielziele

### Story-Modus
- **Mission 1**: Finde und rette die entführte Prinzessin
- **Mission 2**: Zerstöre die feindliche Basis im dunklen Wald
- **Mission 3**: Besiege alle Feinde in der finalen Schlacht

### Battle-Modus
- Besiege den KI-Gegner
- Zerstöre die feindliche Burg
- Überlebe so lange wie möglich (Survival-Modus)

## 🤖 KI-Gegner

Das Spiel verfügt über eine intelligente KI mit drei Schwierigkeitsstufen:

- **Einfach**: Langsame Reaktion, niedrige Präzision
- **Mittel**: Ausgeglichene Herausforderung
- **Schwer**: Schnelle Reaktion, aggressive Strategie

Die KI passt ihre Strategie dynamisch an:
- **Aggressive**: Fokus auf Angriffe
- **Defensive**: Fokus auf Verteidigung
- **Balanced**: Ausgewogene Strategie

## 🛠️ Technischer Stack

- **HTML5**: Struktur
- **CSS3**: Styling mit Gradients und Animationen
- **JavaScript (ES6+)**: Game Engine
  - Canvas API für Rendering
  - Objektorientierte Architektur
  - A* Pathfinding Algorithmus
  - Event-basiertes System

- **Keine Dependencies**: Läuft komplett standalone im Browser!

## 📊 Systemanforderungen

- Moderner Browser (Chrome, Firefox, Safari, Edge)
- JavaScript aktiviert
- Mindestens 1280x720 Auflösung empfohlen

## 🎨 Anpassung & Erweiterung

### Neue Einheiten hinzufügen
Bearbeite `js/config.js` → `UNIT_TYPES`

### Neue Missionen erstellen
Bearbeite `js/missions.js` → `MISSIONS`

### Spielbalance anpassen
Bearbeite `js/config.js` → Verschiedene Werte anpassen

### Neue Fähigkeiten
Bearbeite `js/config.js` → `ABILITIES`

## 🐛 Bekannte Einschränkungen

- Kein Multiplayer (nur gegen KI)
- Kein Speichersystem (wird beim Neuladen zurückgesetzt)
- Einfache Grafik (Emojis statt detaillierte Sprites)

## 🔜 Mögliche Erweiterungen

- [ ] Speichersystem (LocalStorage)
- [ ] Mehr Missionen
- [ ] Weitere Einheitentypen
- [ ] Gebäude-System erweitern
- [ ] Sound-Effekte und Musik
- [ ] Bessere Grafiken
- [ ] Multiplayer (mit WebSockets)
- [ ] Level-Editor
- [ ] Achievement-System

## 📝 Lizenz

Dieses Projekt ist ein persönliches Projekt für Lernzwecke.

## 👨‍💻 Entwicklung

Erstellt als Fantasy Echtzeit-Strategiespiel im Browser.

Viel Spaß beim Spielen! 🎮⚔️🏰
