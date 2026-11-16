# Wie das Wasser auf die Karte kommt

*Flussströmung · Wie es gemacht ist*

Eine Karte, auf der die großen Flüsse der Welt fließen: Jedes Teilchen bewegt sich so schnell, wie das Wasser an dieser Stelle fließen würde, Monat für Monat. Hier steht, wie sie aufgebaut ist, von den Rohdaten bis zur animierten Karte.

[Karte öffnen](#map) · [So funktioniert es](#story-start)

---

## 01 · Wie alles anfing

### Von statischen Karten zu fließendem Wasser

Ich hatte bereits ein kleines Hobbyprojekt, „Die Wege des Wassers“. Dort habe ich mit der Aufbereitung und Visualisierung von Flussdaten aus HydroSHEDS experimentiert, um Karten einzelner Flüsse oder der Flüsse eines ganzen Kontinents zu erstellen, ähnlich wie beim Projekt „Städte als Kunstkarten“. Abgeschlossen habe ich es im Mai 2024.

Vor Kurzem habe ich auf LinkedIn [einen Beitrag von Mashford Mahute](https://www.linkedin.com/posts/mashfordmahute_gis-remotesensing-hydrology-ugcPost-7525566084314296320-rlg4/) entdeckt und dachte sofort, dass sich etwas Ähnliches umsetzen lässt. Angefangen habe ich mit dem Orinoco in Südamerika, zunächst nur mit HydroRIVERS aus HydroSHEDS. Dazu kamen RiverATLAS mit Höhe, Gefälle und Klima, die Global River Classification (GloRiC) mit dem Flusstyp (Größe, Hydraulik, Klima), das Global Flood Awareness System (GloFAS) mit einer Reanalyse des täglichen Abflusses auf einem Raster von etwa 5 km und Natural Earth für Flussnamen und Länder. Insgesamt sind es fünf offene Datensätze.

{{data-table}}

---

## 02 · Aufbereitung

### Aus 8,5 Millionen Abschnitten wird ein Flusssystem

Sind die Daten beisammen, müssen sie aufbereitet werden. Dafür nehmen wir das bewährte Python mit den Paketen pyarrow, geopandas, pyogrio und xarray. Die FileGDB- und Shapefile-Quellen werden einmal in GeoParquet umgewandelt und nach Regionen aufgeteilt (die erste Ziffer der Abschnitts-ID ist die Region). Das Einlesen wird dadurch um ein Vielfaches schneller als aus den Originalformaten.

Ein Einzugsgebiet umfasst alle Abschnitte mit demselben Wert im Feld MAIN_RIV. Für die Flusskataloge wählen wir je Kontinent die großen Einzugsgebiete; die Mindestgröße reicht von 20.000 km² in Europa bis 100.000 km² in Asien und Sibirien. Insgesamt sind es 261 Flüsse. Das Land bestimmen wir nach Natural Earth; Russland und Kasachstan werden bei 60° Ost in Europa und Asien/Sibirien geteilt.

Kleine Zuflüsse ausdünnen: Damit Browser und Grafikkarte mitkommen, lassen wir bei großen Einzugsgebieten die kleinsten Bäche nach Abflussklasse weg, bis höchstens etwa 120.000 Abschnitte übrig bleiben.

{{section-bars}}

*Am Beispiel des Ganges. Lineare Skala: Das Einzugsgebiet ist knapp ein Fünfzigstel des Datensatzes, auf der Karte sind 40 % seiner Abschnitte.*

---

## 03 · Geschwindigkeit und Gefälle

### Wie schnell fließt das Wasser?

Für eine stimmige Darstellung müssen Geschwindigkeit und Gefälle berücksichtigt werden. Die Fließgeschwindigkeit berechnen wir nach der Manning-Formel; die Gerinnebreite schätzen wir als w = 7,2·√Q, die Rauheit ist n = 0,035. Je steiler das Gefälle und je mehr Wasser, desto schneller fließt der Strom.

**v = n^-0,6 · (Q / w)^0,4 · S^0,3**, mit w = 7,2 · √Q, n = 0,035

{{calculator}}

*Zum Ausprobieren: Die Abflüsse in den Schaltflächen stammen aus den Kartendaten, die Gefälle sind typische Werte, keine Messungen. Auf der Karte ist die Geschwindigkeit auf 0,1–4 m/s begrenzt.*

### Das Gefälle ist die Schwachstelle

Misst man das Gefälle je Abschnitt auf einem groben Höhenmodell, ergeben sich selbst bei Flachlandflüssen wie Petschora und Yukon absurde 4–7 m/km. Deshalb nehmen wir den Höhenunterschied auf einer Strecke flussabwärts von 3·√Q km Länge (10 bis 300 km).

Fließzeit: Wir summieren die Zeit jedes Abschnitts von der Mündung flussaufwärts. So bekommt jeder Punkt eine Angabe, „nach wie vielen Stunden dieses Wasser die Mündung erreicht“.

*Schema, nicht maßstäblich: Ein grobes Höhenmodell macht aus einem gleichmäßigen Gefälle eine Treppe. Misst man je Abschnitt, sind die Stufen zu steil; der Mittelwert über ein langes Fenster ergibt das wirkliche Gefälle.*

{{slope-chart}}

---

## 04 · Jahreszeiten und Wetter

### Der Regen fällt im Juli, das Wasser kommt im August

{{season-chart}}

### Wo es GloFAS gibt

Zu jedem Abschnitt suchen wir in der Nähe eine GloFAS-Zelle mit ähnlichem mittlerem Abfluss. Von ihr übernehmen wir nur den Jahresverlauf (Monat / Mittel) und skalieren ihn auf den Abfluss aus HydroRIVERS. So stimmen die absoluten Zahlen mit dem Atlas überein, und der Jahresgang stammt aus einer echten Wetter-Reanalyse. Die Jahre 2022–2025 werden einzeln gespeichert, deshalb sieht man Hochwasser- und Dürrejahre.

### Wo es GloFAS nicht gibt: ein eigenes Modell

Für jedes kleine Teileinzugsgebiet berechnen wir die Schneedecke (sie wächst unter -1 °C und schmilzt mit 60 mm pro Grad und Monat), einen Bodenspeicher von 150 mm und die Verdunstung. Das ist ein einfaches Gradtagverfahren. Der Abfluss wird flussabwärts aufsummiert, mit einer Verzögerung (linearer Speicher, 0,3–2,5 Monate, länger bei großen Flüssen), und an die Atlaswerte für Minimum, Mittel und Maximum angepasst. Am Orinoco stimmt der Verlauf mit GloFAS mit einer Korrelation von etwa 0,92 überein, und die Spitzenmonate sind plausibel: Petschora Juni, Donau April–Mai, Nil September, Ganges August.

### Geschwindigkeit nach Monaten

**v_Monat = v · (Q_Monat / Q)^0,2**: Bei Hochwasser fließt das Wasser also tatsächlich schneller. Die Fließzeit wird für jeden Monat und jedes Jahr neu von der Mündung aus berechnet.

### Wassertemperatur

Wir schätzen sie mit der Mohseni-Kurve aus der Lufttemperatur im Einzugsgebiet. Das ist ein statistischer Zusammenhang zwischen Wasser- und Lufttemperatur:

- bei Frost sinkt das Wasser nicht unter etwa 0 °C: Es gefriert, und unter dem Eis bleibt es bei etwa null;
- im mittleren Bereich folgt das Wasser der Luft fast linear;
- bei Hitze flacht der Anstieg ab, weil die Verdunstung das Wasser kühlt.

{{temperature-chart}}

---

## 05 · Datenformat

### 51 Mb JSON, 6.6 Mb binär

Für die Karte eignet sich ein eigenes Binärformat besser: ein JSON-Kopf mit den Statistiken und Arrays mit Koordinaten, Zeiten und Monatswerten. Andere Programme können es zwar nicht lesen, aber hier zählt die Größe. Koordinaten werden als ganzzahlige Differenzen gespeichert, Monate in einem Byte als Anteil am Maximum, und alles ist mit gzip komprimiert. Südamerika schrumpfte so von 51 Mb JSON auf 6.6 Mb. Jeder Fluss ist in zwei Dateien aufgeteilt: Die großen Flüsse werden sofort geladen, die kleinen Bäche danach.

{{delivery-facts}}
---

## 06 · Darstellung

### Kometen, die sich wiederholen

Für die Darstellung habe ich die bereits bekannten und bewährten MapLibre GL und deck.gl verwendet.

MapLibre GL zeichnet die dunkle Grundkarte von CARTO und das Relief: Die Schummerung aus den Terrarium-Höhenkacheln berechnet der Browser selbst.

deck.gl legt eine eigene Ebene darüber: das feine Flussnetz (PathLayer), die Beschriftungen (TextLayer) und die wandernden Teilchen. Das ist unser FlowLayer, eine Erweiterung von TripsLayer mit eigenem Shader: Entlang jeder Linie wiederholt sich alle N Stunden Fließzeit ein „Komet“, und der Fluss scheint zu fließen. Die Teilchen bewegen sich nach der Fließzeit: Im Gebirge rennen sie, in der Ebene kriechen sie.

Die Linienstärke hängt vom Abfluss ab (Q^0,22), sodass man ein Hochwasser mit bloßem Auge sieht. Die Farbe zeigt den Abfluss auf logarithmischer Skala oder die Wassertemperatur.

Das Panel enthält den Steckbrief des Flusses mit Diagrammen zu Niederschlag, Temperatur und Längsprofil, den Vergleich zweier Flüsse, die Zeitleiste mit dem Abflussverlauf nach Monaten und GloFAS-Jahren und die Beschreibung der Berechnungen. Der Zustand steht in der URL, deshalb lässt sich jede Ansicht als Link verschicken.


---

## Quellen und Dokumentation

*Geschwindigkeiten, Fließzeiten, Temperaturen und modellierte Monatswerte sind Schätzungen.*
