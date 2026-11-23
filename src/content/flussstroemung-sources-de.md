## Daten und Methodik

**[HydroRIVERS v1.0](https://www.hydrosheds.org/products/hydrorivers)** - Flussnetz, Fließrichtung und modellierter mittlerer Abfluss. Lehner & Grill (2013), [Publikation](https://doi.org/10.1002/hyp.9740). CC BY 4.0.

**[RiverATLAS v1.0](https://www.hydrosheds.org/hydroatlas)** - Höhe, Gefälle, Klima und Abflusskennwerte je Abschnitt. Linke et al. (2019), [Publikation](https://doi.org/10.1038/s41597-019-0300-6). CC BY 4.0.

**[GloRiC v1.0](https://www.hydrosheds.org/products/gloric)** - Flusstypen nach Größe, Hydraulik und Klima. Ouellet Dallaire et al. (2019), [Publikation](https://doi.org/10.1088/1748-9326/aad8e9). CC BY 4.0.

**[GloFAS-Reanalyse](https://ewds.climate.copernicus.eu/datasets/cems-glofas-historical)** - Monatlicher Jahresverlauf für 15 große Flüsse aus der Reanalyse 2022–2025. Copernicus EMS; Nutzungsbedingungen von Copernicus.

**[Natural Earth](https://www.naturalearthdata.com/)** - Flussnamen, Länder und Kontinente. Gemeinfrei.

**Vergleichswerte** - Abfluss nach [Dai et al. (2009)](https://doi.org/10.1175/2008JCLI2592.1), Flusslängen nach Encyclopaedia Britannica; Nachschlagewerte, keine Kartenwerte.

**Methodische Grundlagen** - Gerinnebreite nach [Leopold & Maddock (1953)](https://doi.org/10.3133/pp252), Wassertemperatur nach [Mohseni et al. (1998)](https://doi.org/10.1029/98WR01877). Berechnungen und Grenzen erläutert die [Methode in der Anwendung](https://gis.krmn.app/hydrorivers_v2/methode.html).

**[CARTO](https://carto.com/attributions) / [OpenStreetMap](https://www.openstreetmap.org/copyright)** - Grundkarte Dark Matter; ODbL für OSM-Daten.

**[Terrain Tiles](https://registry.opendata.aws/terrain-tiles/)** - Relief aus Mapzen-Höhenkacheln (AWS Open Data); Bedingungen der jeweiligen Höhenquellen.

Die Nutzungsbedingungen gelten jeweils für die einzelne Quelle.

## Pakete und Bibliotheken

| Paket / Bibliothek | Verwendung |
|---|---|
| [Python](https://www.python.org/), [pandas](https://pandas.pydata.org/), [NumPy](https://numpy.org/), [PyArrow](https://arrow.apache.org/docs/python/) | Einlesen und Umformen von Tabellen, Parquet, numerische Berechnungen |
| [GeoPandas](https://geopandas.org/), [pyogrio](https://pyogrio.readthedocs.io/), [Shapely](https://shapely.readthedocs.io/) | Einlesen der FileGDB-Quellen, Geometrien, Aufbau der Flussnetze und Einzugsgebiete |
| [GeoParquet](https://geoparquet.org/) | Zwischenformat für Geometrien und Attribute, aufgeteilt nach Regionen |
| [xarray](https://docs.xarray.dev/), [netCDF4](https://unidata.github.io/netcdf4-python/) | Einlesen der GloFAS-Raster |
| [cdsapi](https://github.com/ecmwf/cdsapi) | Abruf der GloFAS-Reanalyse aus dem Copernicus Early Warning Data Store |
| [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) 5.24 | Grundkarte, Relief und Interaktion mit der Karte (MapLibre, BSD-3-Clause) |
| [deck.gl](https://deck.gl/) 9.3 | Flussnetz (PathLayer), Beschriftungen (TextLayer) und Teilchen: FlowLayer als Erweiterung von [TripsLayer](https://deck.gl/docs/api-reference/geo-layers/trips-layer) mit eigenem GLSL-Shader (OpenJS Foundation / vis.gl, MIT) |
| [MDN – DecompressionStream](https://developer.mozilla.org/en-US/docs/Web/API/DecompressionStream) | Entpacken der gzip-komprimierten Binärdateien im Browser |
| Ohne Build-Schritt | Die Seite besteht aus ES-Modulen und wird über GitHub Pages ausgeliefert; MapLibre und deck.gl liegen im Repository. |

## Dokumentation und weiterführende Materialien

**[HydroRIVERS – technische Dokumentation](https://data.hydrosheds.org/file/technical-documentation/HydroRIVERS_TechDoc_v10.pdf)** (PDF)
Aufbau des Flussnetzes, Attribute und Grenzen der Genauigkeit

**[HydroATLAS / RiverATLAS – technische Dokumentation](https://data.hydrosheds.org/file/technical-documentation/HydroATLAS_TechDoc_v10_1.pdf)** (PDF)
Bedeutung und Herkunft aller Merkmale je Abschnitt

**[GloRiC – technische Dokumentation](https://data.hydrosheds.org/file/technical-documentation/GloRiC_TechDoc_v10.pdf)** (PDF)
Klassen der Flusstypen und ihre Ableitung

**[GloFAS-Reanalyse im Early Warning Data Store](https://ewds.climate.copernicus.eu/datasets/cems-glofas-historical)**
Beschreibung des Datensatzes, Variablen und Zugang

**[Methode in der Anwendung](https://gis.krmn.app/hydrorivers_v2/methode.html)**
Wie jede Zahl der Karte berechnet wird und wo sie von Atlaswerten abweicht

**[Quellcode und Anleitung auf GitHub](https://github.com/Kirman442/hydrorivers_v2)**
Lokaler Start der Website und Aufbau des Repositorys
