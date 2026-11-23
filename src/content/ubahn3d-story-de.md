## Wie alles begann
Im Dezember 2023 habe ich eine interaktive Karte zur Geschichte der Berliner U-Bahn fertiggestellt ([Berliner U-Bahn Geschichte](/projects/ubahn/)). Sie zeigt, wie das Netz seit 1902 Bahnhof für Bahnhof gewachsen ist: Linien und Bahnhöfe erscheinen und verschwinden je nach dem Datum, das man am Zeitregler einstellt. Damals entstand die Karte mit dem ArcGIS Maps SDK; die Daten habe ich in QGIS zusammengetragen und bereinigt.

Diese Karte hatte zwei Grenzen. Die erste war technisch: Sie war von ArcGIS-Diensten und einem API-Schlüssel abhängig. Die zweite war inhaltlich: Die U-Bahn war auf ihr flach. Die Karte zeigte, wo und wann ein Bahnhof entstanden ist, aber nicht, wie tief er unter der Erde liegt. Gerade das unterscheidet die U-Bahn aber von Straßenbahn und S-Bahn: Unter manchen Stadtteilen fahren die Züge zwei Meter unter dem Straßenpflaster, unter anderen drei Ebenen tief, und an manchen Stellen kommen sie auf einen Viadukt.

Im November 2026 habe ich das Projekt mit zwei Zielen wieder aufgenommen:

- die alte 2D-Karte auf eine offene Technik ohne ArcGIS umzustellen;
- eine neue Anwendung zu bauen, die die U-Bahn im Schnitt und räumlich zeigt - und nicht nur für Berlin.

## Zuerst Ordnung in den Daten: die neue 2D-Karte

Bevor etwas in 3D entstehen konnte, mussten die Bahnhofsdaten neu aufgebaut werden. Die ursprüngliche Ebene von 2023 war von Hand bearbeitet: zwei Punkte für jedes Paar «Bahnhof × Linie», und die Daten bezogen sich stellenweise auf Umbauten statt auf die erste Eröffnung.
Für die neue Karte habe ich drei Grundsätze festgelegt:

- Das Eröffnungsdatum ist der Tag, an dem an dieser Stelle der erste Bahnhof eröffnet wurde - unabhängig davon, ob der Bahnhof später umbenannt wurde. Ein Beispiel ist Knie auf der heutigen U2, benannt nach der Biegung der historischen Straße zwischen Berlin und Charlottenburg, der heutigen Straße des 17. Juni. Der Bahnhof wurde am 14.12.1902 eröffnet, trug diesen Namen bis 1953 und heißt seitdem Ernst-Reuter-Platz.
- Umbenennungen sind getrennt und mit Datum erfasst. Deshalb wechselt ein Bahnhof am Zeitregler genau in dem Jahr seinen Namen, in dem das tatsächlich geschah (Oranienstraße am 18. Februar 1902 → Görlitzer Bahnhof am 14. Februar 1926).
- Geisterbahnhöfe - Bahnhöfe, durch die die Züge während der Teilung Berlins ohne Halt fuhren - sind als leere Kreise dargestellt.

Auch die Hintergrundkarte ist jetzt eine eigene. Statt ArcGIS-Kacheln wird eine einzige Datei `berlin.pmtiles` (Protomaps) verwendet, die zusammen mit der Anwendung ausgeliefert wird. Die Karte läuft jetzt mit MapLibre GL und hängt von keinem externen Dienst mehr ab. Die neue 2D-Version ist hier erreichbar: https://gis.krmn.app/berlinmetro/

## Die Hauptfrage: Woher kommt die Tiefe?

Kein offener Datensatz liefert die Tiefe aller Bahnhöfe. Sie musste aus mehreren Quellen zusammengetragen werden, und bei jedem Wert ist offen gekennzeichnet, woher er stammt:

| Quelle | Was sie liefert | Kennzeichnung in der Anwendung |
| --- | --- | --- |
| Wikipedia | Für einen Teil der Bahnhöfe gibt es eine genaue Angabe («Bahnsteig 19 m unter Straßenniveau») | Kreis, Zahl ohne «≈» |
| Berechnung | Höhenunterschied zwischen benachbarten Bahnhöfen, «ca.»/«rund» in der Quelle | Quadrat, «≈» |
| OpenStreetMap | Tags `tunnel`, `layer`, `level` (−1 … −5), Bauart | hohler Kreis, «≈», Modellschätzung |
| Bauregeln | Typische Tiefe für Tunnel in offener Bauweise und für Viadukte | hohler Kreis, «≈» |

Verlässlich gemessene Tiefenangaben gibt es nur wenige: für etwa 30 Bahnhöfe in Berlin, 9 in Hamburg und 18 in München. Für Nürnberg gibt es keinen einzigen genau angegebenen amtlichen Wert; dort ist alles aus den OSM-Ebenen und der mittleren Bauwerkstiefe (Median) abgeleitet. Deshalb war von Anfang an klar: Die Anwendung muss nicht nur die Tiefe zeigen, sondern auch, wie sehr man ihr trauen kann. Daher die drei Markerformen (Kreis, Quadrat, hohler Kreis) und das Zeichen «≈».

## Gelände: «Tiefe» - bezogen worauf?

«Ein Bahnhof in 12 Metern Tiefe» ergibt nur dann Sinn, wenn man weiß, wo die Oberfläche liegt. Berlin ist fast eben, in München dagegen ergibt der Hang des Isartals bei Thalkirchen rund fünf Meter Höhenunterschied auf wenigen Dutzend Metern. Deshalb ist jede Strecke an ein digitales Geländemodell (DGM, 1-m-Raster) gebunden:

- Berlin: Geoportal Berlin (WMS/WCS);
- Hamburg: LGV Hamburg, außerhalb der Stadtgrenze (Norderstedt, Ahrensburg, Großhansdorf) EU-DEM mit 25 m;
- München und Nürnberg: Bayerische Vermessungsverwaltung.

Was aufbereitet werden musste: Das rohe DGM entlang der U-Bahn-Strecken erwies sich als sehr unruhig. Unterführungen, Dämme und Senken unter Brücken erzeugten Höhensprünge von mehreren Metern auf wenigen Metern Streckenlänge. In Hamburg kamen mehr als 7.600 leere Werte hinzu. Würde man das Profil direkt aus diesen Daten berechnen, sprünge der Tunnel unter einer ebenen Straße auf und ab. Die Lösung besteht aus zwei Schritten:

- Das Gelände wird entlang der Strecke geglättet: zuerst mit dem Median über ±75 m, danach mit dem Mittelwert über ±50 m.
- Die Trasse wird von Bahnhof zu Bahnhof mit einer Steigung von höchstens 40 ‰ (die reale Grenze für U-Bahnen) aufgebaut und anschließend über 120 m geglättet. Die Bahnhöfe liegen auf einem waagerechten Abschnitt von 45 m Länge.

Nach jedem Neuaufbau läuft eine rechnerische Prüfung der Daten, nicht nur eine Sichtkontrolle der Strecke in der Anwendung: Steigung über 40 ‰, Überdeckung des Tunnels unter 3 m, Geländesprünge. Am Ende betrug der größte Geländesprung in Berlin 7,2 m auf 436 m, und die fünf Meter bei Thalkirchen in München erwiesen sich als echter Hang und nicht als Fehler.

## Vier Städte, vier Sammlungen von Besonderheiten

Drei weitere Städte zu Berlin hinzuzufügen hieß nicht einfach, Daten wie für Berlin zu sammeln, sondern war für jede Stadt eine eigene Arbeit:

- Hamburg. U2 und U4 fahren zwischen Jungfernstieg und Berliner Tor auf demselben Gleis. Damit beide Linien sichtbar sind, sind die Röhren, die für die U-Bahn-Tunnel stehen, dort nebeneinander gezeichnet. Die historische «Zweigbahn Rothenburgsort» (1915-1943) ist grau dargestellt. Das Netz beginnt 1912.
- München. Mehrere Linien teilen sich Tunnel (die «Stammstrecken»), deshalb sind auch ihre Röhren nebeneinander gezeichnet. Die Liniennummern haben sich geändert (zum Beispiel heißt die U8 von 1980-1988 heute U2).
- Nürnberg/Fürth. Plärrer ist ein «Richtungsbahnhof»: Für jede Linie liegt eine Fahrtrichtung auf Ebene −2, die andere auf −3. Deshalb sind hier, anders als überall sonst, beide Richtungen berücksichtigt. Muggenhof und Stadtgrenze waren von 1970 bis 1981 Straßenbahnhaltestellen, seit 1982 sind sie U-Bahnhöfe.
- Strecken im Bau. Hamburg U4 (Horner Geest) und U5 (Bramfeld - City Nord), München U5 (Pasing) und U6 (Martinsried) sowie Nürnberg U3 (Gebersdorf) sind als gestrichelte Röhre in der Linienfarbe mit eigenen Hinweisen dargestellt. Wo die Tiefe unbekannt ist (München, Am Knie und Pasing), sagt die Anwendung das auch so und zeichnet die Röhre auf der Modellhöhe des Nachbarbahnhofs.

Jede Stadt durchläuft ihr eigenes Aufbereitungsskript und erhält dasselbe Format: `network3d.json` (Strecken, Bahnhöfe, Baustellen), `stations.geojson` (Geschichte und Namen) und `basemap.json` (Stadtschema).

## Wie man das darstellt

Der erste Prototyp bestand nur aus Röhren im leeren Raum; sich darin zu orientieren war unmöglich. Auch auf eine Kartengrundlage unter den Tunneln habe ich verzichtet: MapLibre-Kacheln sind in einer 3D-Szene schlecht lesbar und bringen unnötige Abhängigkeiten mit. Am Ende ist Folgendes entstanden:

- Das Stadtschema (Wasser, Parks, Hauptstraßen, Eisenbahnen) wird direkt als three.js-Geometrie aus OpenStreetMap erzeugt, ohne Kacheln. Von oben ist es als Stadtplan zu sehen, von unten als Schnitt durch das Erdreich.
- Die Überhöhung lässt sich von 1× bis 200× einstellen, voreingestellt ist 50×. Ohne sie wären 10 Meter Tiefe bei 20 Kilometern Netz einfach nicht zu sehen. Alle angegebenen Meterwerte bleiben dabei echt.
- Zwei Höhenmodi: «unter Straße» (Tiefe bezogen auf das Gelände) und «über Normalhöhennull» (NHN), bei dem das ganze Relief der Stadt sichtbar wird.
- Die Bahnhofskarte zeigt Tiefe, Quelle, Geländehöhe und Umstiege mit Liniensymbolen. Die Linienkarte zeigt das Längsprofil: Gelände und Modelltrasse in einer SVG-Grafik.
- Der Zeitregler funktioniert wie in der 2D-Version: Eröffnungen, Umbenennungen, Geisterbahnhöfe, Betriebsunterbrechungen.
- Beschriftungen verschwinden nicht, wenn sie sich überlagern - verschwindende Beschriftungen stören mehr als überlagerte -, im Linienprofil sind sie aber kompakt.
- Zwei Designs: hell «Glas» und dunkel «Nacht», dunkel ist voreingestellt. Zoom und Kartenausschnitt werden für jede Stadt während der Sitzung gespeichert.

## Prüfung und Ergebnis

Jeder größere Block von Änderungen und jede Ergänzung von Daten in der Anwendung wurde in verschiedenen Szenarien geprüft: echte Klicks in der Oberfläche, Messungen im DOM und in den SVG-Grafiken, künstliche Netzwerkfehler (HTTP 503 bei Daten und Hintergrundkarte) und die Prüfung aller 24 Längsprofile auf Einbrüche und auf fehlende Werte (NaN).

Entstanden ist eine Anwendung, mit der man den unterirdischen Teil einer Infrastruktur ansehen und erkunden kann, die täglich sehr viele Menschen nutzen. Das sind vier Netze, 422 Bahnhöfe, Geschichte ab 1902 (Berlin), 1912 (Hamburg), 1971 (München) und 1972 (Nürnberg) sowie Strecken im Bau bis 2034. Die Anwendung ist statisch: ohne Cookies, ohne Tracking, ohne Schriften und Skripte von Drittanbietern.


## Quellen und Werkzeuge

### Daten

| Quelle | Verwendung und Lizenz |
| --- | --- |
| [OpenStreetMap](https://www.openstreetmap.org/copyright) | Lage von Strecken und Bahnhöfen sowie das Stadtschema. © OpenStreetMap-Mitwirkende, ODbL 1.0. |
| [Wikipedia](https://de.wikipedia.org/) | Geschichte der Bahnhöfe und Tiefenangaben. CC BY-SA 4.0. |
| [Wikidata](https://www.wikidata.org/) | Ergänzende Angaben zur Geschichte und zu Bahnhöfen. CC0. |
| [DGM1 Berlin](https://gdi.berlin.de/) | Geländemodell für Berlin. © Geoportal Berlin, dl-de/zero-2-0. |
| [DGM1 Hamburg](https://geoportal-hamburg.de/) | Geländemodell für Hamburg. © LGV Hamburg, dl-de/by-2-0. |
| [DGM1 Bayern](https://geodaten.bayern.de/) | Geländemodell für München und Nürnberg. © Bayerische Vermessungsverwaltung, CC BY 4.0. |
| [EU-DEM / Copernicus](https://land.copernicus.eu/en/products/eu-dem) | Geländemodell mit 25-m-Raster außerhalb der Hamburger Stadtgrenze. |

### Code und Bibliotheken

| Paket / Bibliothek | Verwendung |
| --- | --- |
| [React 18](https://react.dev/) | Aufbau der Benutzeroberfläche. |
| [three.js 0.169](https://threejs.org/) | Dreidimensionale Szene, Tunnel, Bahnhöfe und Stadtschema. |
| [@react-three/fiber](https://r3f.docs.pmnd.rs/) | Einbindung der three.js-Szene in React. |
| [@react-three/drei](https://drei.docs.pmnd.rs/) | Hilfskomponenten für die 3D-Szene. |
| [Vite 6](https://vite.dev/) | Entwicklungsumgebung und Build. |
| [MapLibre GL](https://maplibre.org/) | Kartendarstellung in der 2D-Version. |
| [Protomaps / PMTiles](https://protomaps.com/) | Hintergrundkarte der 2D-Version als PMTiles-Datei. |
| [Node.js](https://nodejs.org/) | Aufbereitung und Zusammenführung der Daten. |
| [Python](https://www.python.org/) | Vorbereitung und Prüfung der Geodaten. |
| [GitHub Pages](https://pages.github.com/) | Statisches Hosting der Anwendung. |

### Dokumentation

| Material | Inhalt |
| --- | --- |
| [Das Berliner U-Bahn-Archiv](http://www.u-bahn-archiv.de/index.html) | Historische Karten und Dokumente für die ursprüngliche 2D-Version von 2023. |
| [Berliner U-Bahn Geschichte](/projects/ubahn/) | Die Projektgeschichte der 2D-Karte im Portfolio. |
| [Tiefenangaben und Gelände](#ubahn3d-story-3) | Herkunft und Kennzeichnung der Tiefenwerte; die folgenden Abschnitte erläutern das Geländemodell und seine Aufbereitung. |

### Mitwirkende

- Kirill Lisochenko: Idee, Entwicklung, ursprüngliche Karte 2023, Daten und Design, Prüfung
- Richard Sorge: Oberflächendesign, UI/UX
- Claude: Analyse, Datenaufbereitung, Entwicklung und Dokumentation
- Codex: Audit des Prototyps
