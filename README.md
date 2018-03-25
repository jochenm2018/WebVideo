# Benutzerdokumentation
  
  
## Anforderungen

Folgende Programme werden für die Ausführung des Tools benötigt:

* NodeJS
* NPM
* FFmpeg
* Google Chrome

Die Installationsanleitungen für genannte Programme können über deren öffentliche Dokumentation eingesehen werden.  
  
## Installationsanweisung

Das Projekt kann mit Hilfe von Git geklont werden.

> *git clone git@git.office.sevenval.de:jochen.meier/WebVideo.git*

Im Projekt benötigte Abhängigkeiten können mit Projektverzeichnis mit Hilfe von NPM installiert werden.

> *npm install*  
  
## Bedienung

### Vergleichsvideo erstellen

Das WebVideo Tool kann mittels Bash-Script gesteuert werden.
Um ein Vergleichs-Video anlegen zu können, welches die Ladevorgänge von zwei Webseiten einander gegenüber stellt, müssen dem Tool mindestens zwei gültige URL’s als Argumente übergeben werden.

> *./WebVideo.sh `<URL1>` `<URL2>`*


**Hinweis**: Gibt man eine URL ohne Protokoll an, so wird automatisch “http” verwendet.

Die dabei entstandenen Bild- und Videodateien standardmäßig in den Ordnern “videos” und “images” abgelegt.  

### Einzelnes Video erstellen

Möchte man den Ladevorgang einer einzelnen Seite festhalten, so entfällt das Argument der zweiten URL. Jedoch muss man eine Umgebungsvariable mit dem Namen “COMPARE_OFF” setzen.

> *COMPARE_OFF=1 ./WebVideo.sh `<URL1>`*

**Hinweis**: Verwendet man die COMPARE_OFF Umgebungsvariable und gibt zusätzlich eine zweite URL an, so führt dies zu Fehlern.

### Netzwerk- und Geräteeinstellungen

Netzwerk- und Geräteeinstellungen können über festgelegte Presets bestimmt werden. Mit der Netzwerkeinstellung legt man die Internetverbindungsqualität fest, welche für das Laden der Webseite verwendet wird. Mit dem Gerätepreset kann bestimmt werden, mit welchen Geräteeigenschaften der Browser die Seite lädt. Presets werden ebenfalls als Argument übergeben.
Das Netzwerkpreset kann mit dem dritten Argument übergeben werden, das Gerätepreset mit dem vierten.

> *./WebVideo.sh `<URL1>` `<URL2>` `<NETWORK>` `<DEVICE>`*

Folgende Presets sind verfügbar:

*Netzwerk-Presets*:
* cable
* dsl
* 3g

*Geräte-Presets*:
* desktop
* mobile

### Konfigurationsdatei

Im Projektordner befindet sich zudem eine Konfigurationsdatei mit dem Namen “config.json”. Diese enthält notwendige Konfigurationsinformationen sowie Eigenschaften für vorhandene Presets.
