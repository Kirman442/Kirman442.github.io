import React from 'react';
import CodeBlock from './CodeBlock.jsx';
import MapEmbed from './MapEmbed.jsx';
import ProjectSources, {SourceResources} from './ProjectSources.jsx';

export const contents = [
  {id: 'story-start', title: 'Einleitung'},
  {id: 'section-2', title: 'Kepler.gl vs. Deck.gl: Analytisches Werkzeug vs. Programmierplattform'},
  {id: 'section-3', title: 'Datensatz: Umfang und Struktur'},
  {id: 'section-4', title: 'Entwicklungsphasen: Von den Daten zur Visualisierung'},
  {id: 'section-5', title: 'Performance und Kartendarstellung'},
  {id: 'bedienung', title: 'Bedienung: So funktioniert die Karte'},
  {id: 'section-6', title: 'Was seitdem dazukam (2026)'},
  {id: 'map', title: 'Web-App'},
  {id: 'sources', title: 'Quellen und Dokumentation'},
];

const hoverExample = `new GeoJsonLayer({
  id: 'districts',
  data: districts,
  getFillColor: district => {
    if (district.properties.id === selectedDistrictId) return SELECTED_COLOR;
    if (district.properties.id === hoveredId) return HOVER_COLOR;
    return DENSITY_COLOR_SCALE(density(district));
  },
  updateTriggers: {
    getFillColor: [selectedDistrictId, hoveredId],
  },
});`;

function SourceLink({href, children}) {
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
}

const dataSources = [
  {
    name: <SourceLink href="https://www.destatis.de/DE/Themen/Laender-Regionen/Regionales/Gemeindeverzeichnis/_inhalt.html">Destatis · Gemeindeverzeichnis GV-ISys</SourceLink>,
    paragraphs: ['Einwohnerzahlen und Fläche zum 31.12.2025. Die Bevölkerungszahlen beruhen auf dem Zensus 2022.'],
  },
  {
    name: <SourceLink href="https://www.statistik.bayern.de/">Bayerisches Landesamt für Statistik</SourceLink>,
    paragraphs: ['Statistische Berichte und Daten zu Bayern.'],
  },
  {
    name: <SourceLink href="https://carto.com/basemaps">CARTO Positron</SourceLink>,
    paragraphs: [<>Vektor-Grundkarte. Kartendaten © <SourceLink href="https://www.openstreetmap.org/copyright">OpenStreetMap-Mitwirkende</SourceLink>.</>],
  },
];

const libraries = [
  {
    name: <SourceLink href="https://deck.gl/">deck.gl</SourceLink>,
    paragraphs: ['Darstellung und Interaktion der Flächen und Punkte.'],
  },
  {
    name: <SourceLink href="https://maplibre.org/">MapLibre GL JS</SourceLink>,
    paragraphs: [<>Vektor-Grundkarte, eingebunden über <SourceLink href="https://www.npmjs.com/package/@vis.gl/react-maplibre">@vis.gl/react-maplibre</SourceLink>.</>],
  },
  {
    name: <SourceLink href="https://react.dev/">React</SourceLink>,
    paragraphs: ['Benutzeroberfläche und Verwaltung der Kartenauswahl.'],
  },
  {
    name: <>GeoPandas · <SourceLink href="https://github.com/mbloch/mapshaper">mapshaper</SourceLink> · d3-scale</>,
    paragraphs: ['Python und GeoPandas dienten der ersten Vorbereitung der Geometrien. Das Node.js-Skript vereinfacht die Polygone mit mapshaper und verknüpft die Geodaten mit den amtlichen Zahlen. d3-scale berechnet die Farbskalen.'],
  },
];

const documentation = [
  {
    name: <SourceLink href="https://deck.gl/docs/api-reference/core/layer#updatetriggers">deck.gl · updateTriggers</SourceLink>,
    paragraphs: ['Wann deck.gl die von einem Accessor berechneten Attribute aktualisiert.'],
  },
  {
    name: <SourceLink href="https://deck.gl/docs/developer-guide/base-maps/using-with-maplibre">deck.gl mit MapLibre</SourceLink>,
    paragraphs: ['Gemeinsames Rendern von Fachlayern und Vektor-Grundkarte.'],
  },
];

export default function BayernArticle() {
  return <div className="mobile-network-article migrated-article">
    <h2 id="story-start">Einleitung</h2>
    <p>Ich interessiere mich schon seit Langem für geografische Visualisierungswerkzeuge. Besonders neugierig wurde ich, als ich Kepler.gl kennenlernte. Uber entwickelte das Werkzeug, um die Bewegungen Tausender Fahrzeuge in verschiedenen Metropolen zu analysieren und daraus ein Bild des Stadtverkehrs zu gewinnen.</p>
    <p>Zu einer Datenvisualisierung gehören normalerweise die Erfassung, Aufbereitung und Analyse der Daten sowie ihre Darstellung. Kepler.gl erleichtert die Arbeit mit bereits erfassten Geodaten. Mit dem Werkzeug lässt sich schnell eine interaktive Karte aus eigenen Daten erstellen und für die Analyse nutzen.</p>

    <h2 id="section-2">Kepler.gl vs. Deck.gl: Analytisches Werkzeug vs. Programmierplattform</h2>
    <p>Kepler.gl richtet sich vor allem an Menschen, die Daten erkunden und analysieren. Als Programmierer wollte ich genauer verstehen, wie solche Visualisierungen entstehen und wie weit ich sie selbst gestalten kann. So kam ich auf deck.gl. Die ebenfalls bei Uber entstandene Bibliothek nutzt WebGL für individuell entwickelte Karten und Visualisierungen. Das setzt technisches Wissen voraus und bietet viel Spielraum bei der Gestaltung. Ihre React-Anbindung machte sie für mich zu einem passenden Werkzeug für dieses Experiment.</p>

    <h2 id="section-3">Datensatz: Umfang und Struktur</h2>
    <p>Die Karte zeigt 7 Regierungsbezirke und 96 Kreise als Flächen. Zu den Kreisen zählen 71 Landkreise und 25 kreisfreie Städte. Die 2.031 kreisangehörigen Gemeinden sind als Punkte dargestellt. Eine Kontur markiert die Landesgrenze Bayerns.</p>
    <p>Für jede dieser Einheiten enthält der Datensatz die Einwohnerzahl insgesamt sowie die Zahl der Männer und Frauen und die Fläche. Aus Einwohnerzahl und Fläche berechnet die Anwendung die Bevölkerungsdichte. Bei den Gemeinden wird zusätzlich der Grad der Verstädterung angezeigt.</p>
    <p>Die Bevölkerungszahlen haben den Stand <time dateTime="2025-12-31">31.12.2025</time> und beruhen auf dem Zensus 2022. Bayern hatte zu diesem Stichtag 13.245.503 Einwohner, München 1.505.036. Rund 36 Prozent der bayerischen Bevölkerung lebten in Oberbayern.</p>

    <h2 id="section-4">Entwicklungsphasen: Von den Daten zur Visualisierung</h2>
    <p>Für die erste Fassung habe ich offene Geodaten aus verschiedenen Quellen zusammengeführt und für die Karte aufbereitet. Die Anwendung ist in React geschrieben, die Oberfläche nutzt Tailwind CSS.</p>
    <p>Heute erzeugt ein Node.js-Skript mit <code>npm run data</code> die Datendateien für die Karte. Es vereinfacht die Polygone mit mapshaper für die verwendeten Zoomstufen und rundet die Koordinaten auf ungefähr einen Meter. Das Skript lädt außerdem das Gemeindeverzeichnis von Destatis und ordnet Einwohnerzahlen und Flächen über den Amtlichen Gemeindeschlüssel (AGS) zu. Für Landkreise und Regierungsbezirke summiert es die Gemeindedaten. Gemeindefreie Gebiete gehen mit ihrer Fläche in die Berechnung ein.</p>

    <h2 id="section-5">Performance und Kartendarstellung</h2>
    <p>Die vereinfachten Polygone brauchen weniger Stützpunkte. Die kreisfreie Stadt Augsburg wird mit 92 Stützpunkten gezeichnet, der Landkreis Ansbach mit 283. Der Browser fordert die vier Dateien für Landesgrenze, Regierungsbezirke, Kreise und Gemeinden parallel an. Die erste Gebietsansicht kann angezeigt werden, sobald die Regierungsbezirke geladen sind. Kreise und Gemeinden stehen bereit, sobald ihre jeweiligen Dateien eingetroffen sind.</p>
    <p>Die Vektor-Grundkarte CARTO Positron läuft in MapLibre GL JS. deck.gl zeichnet im selben WebGL-Kontext wie MapLibre. In diesem interleaved-Modus liegen die eingefärbten Flächen unter den Orts- und Gewässernamen der Grundkarte.</p>
    <p>Beim Überfahren eines Kreises mit der Maus ändert sich seine Füllfarbe. Mit <code>updateTriggers</code> teilt die Anwendung deck.gl mit, wann es die Füllfarben neu berechnen soll. Die Geometrie bleibt bei dieser Änderung gleich. Der gekürzte Ausschnitt zeigt außerdem, wie der ausgewählte Kreis seine Hervorhebung behält.</p>
    <CodeBlock code={hoverExample} language="javascript" />

    <h2 id="bedienung">Bedienung: So funktioniert die Karte</h2>
    <p>Die Karte führt von Bayern über den Regierungsbezirk und den Kreis bis zur Gemeinde. Ein Klick auf ein Gebiet oder auf einen Eintrag in der Seitenleiste wählt es aus. Die Karte richtet ihre Ansicht auf das gewählte Gebiet aus. Über die Pfadnavigation in der Seitenleiste, die Esc-Taste oder einen Klick auf eine freie Kartenfläche geht es eine Ebene zurück.</p>
    <p>Die Seitenleiste zeigt Kennzahlen zur aktuellen Auswahl. Dazu gehören Einwohnerzahl, Fläche, Dichte und die Anteile von Männern und Frauen. Je nach Ebene zeigt sie auch den Bevölkerungsanteil an Bayern oder am Landkreis sowie den Rang nach Einwohnerzahl und Dichte. Die Liste darunter lässt sich nach Einwohnerzahl, Dichte oder Name sortieren. Ab 13 Einträgen erscheint ein Suchfeld. Das Überfahren mit der Maus hebt den zugehörigen Eintrag auf der Karte und in der Liste hervor.</p>
    <p>Die Auswahl steht in der URL, zum Beispiel als <code>#bezirk=091&amp;kreis=09171</code>. So lässt sich dieselbe Ansicht als Lesezeichen speichern oder als Link weitergeben. Auf dem Smartphone sitzt die Seitenleiste am unteren Rand und lässt sich auf drei Höhen einstellen. Die Legende kann eingeklappt werden.</p>

    <h2 id="section-6">Was seitdem dazukam (2026)</h2>
    <p>Mit der ersten Karte wollte ich ausprobieren, wie sich bayerische Geodaten mit deck.gl im Browser darstellen lassen. Seitdem habe ich Datenaufbereitung, Darstellung und Bedienung weiterentwickelt.</p>
    <ul>
      <li>Die Bevölkerungsdaten zum 31.12.2025 werden bei der Aufbereitung aus dem Gemeindeverzeichnis übernommen.</li>
      <li>Die neu gestaltete Seitenleiste bündelt Kennzahlen, Rangfolgen, Suche und Sortierung.</li>
      <li>Die Flächen sind eben und ihre Farbe zeigt die Bevölkerungsdichte. Die Beschriftungen der Vektor-Grundkarte liegen darüber.</li>
      <li>Ansichten lassen sich per URL teilen. Auf Smartphones passt sich die Seitenleiste an die verfügbare Höhe an.</li>
    </ul>

    <h2 id="map">Web-App</h2>
    <MapEmbed url="https://gis.krmn.app/bayern/" title="Bayern auf einen Blick" caption="React / MapLibre / deck.gl" />

    <ProjectSources
      data={<SourceResources rows={dataSources} />}
      libraries={<SourceResources rows={libraries} />}
      documentation={<SourceResources rows={documentation} />}
    />
  </div>;
}
