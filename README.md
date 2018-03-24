# Benutzerdokumentation

## Vorraussetzungen

Folgende Programme werden für die Ausführung des Tools benötigt:

* NodeJS
* NPM
* FFmpeg
* Google Chrome

## Installationsanweisung

Das Projekt kann mit Hilfe von Git geklont werden.

> *git clone git@git.office.sevenval.de:jochen.meier/WebVideo.git*

Im Projekt benötigte Abhängigkeiten können mit Projektverzeichnis mit Hilfe von NPM installiert werden.

> *npm install*

## Bedienung

Das WebVideo Tool kann mittels Bash-Script gesteuert werden.
Um ein Vergleichs-Video anlegen zu können, welches die Ladevorgänge von zwei Webseiten einander gegenüber stellt, müssen dem Tool mindestens zwei gültige URL’s als Argumente übergeben werden.

> *./WebVideo.sh `<URL1>` `<URL2>`*


**Hinweis**: Gibt man eine URL ohne Protokoll an, so wird automatisch “http” verwendet.

Die dabei entstandenen Bild- und Videodateien standardmäßig in den Ordnern “videos” und “images” abgelegt.

Netzwerk- und Geräteeinstellungen können über festgelegte Presets bestimmt werden. Mit der Netzwerkeinstellung legt man die Internetverbindungsqualität fest, welche für das Laden der Webseite verwendet wird. Mit dem Gerätepreset kann bestimmt werden, mit welchen Geräteeigenschaften der Browser die Seite lädt. Presets werden ebenfalls als Argument übergeben.
Das Netzwerkpreset kann mit dem dritten Argument übergeben werden, das Gerätepreset mit dem vierten.

> *./WebVideo.sh `<URL1>` `<URL2>` `<NETWORK>` `<DEVICE>`*


### Presets

*Netzwerk-Presets*:
* cable
* dsl
* 3g

*Geräte-Presets*:
* desktop
* mobile

### Konfigurationsdatei

Im Projektordner befindet sich zudem eine Konfigurationsdatei mit dem Namen “config.json”. Diese enthält notwendige Konfigurationsinformationen sowie Eigenschaften für vorhandene Presets.