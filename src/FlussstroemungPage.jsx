import React from 'react';
import source from './content/flussstroemung-story-de.md?raw';
import sourceDocumentation from './content/flussstroemung-sources-de.md?raw';
import {parseStoryMarkdown} from './energieatlas-markdown.js';
import {siteUrl} from './site-paths.js';
import {Arrow} from './components.jsx';
import MapEmbed from './MapEmbed.jsx';
import ProjectNavigation from './ProjectNavigation.jsx';
import DocumentationDetails from './DocumentationDetails.jsx';
import {ManningCalculator,SectionBars,SlopeChart,SeasonChart,TemperatureChart,DeliveryFacts} from './FlussstroemungCharts.jsx';
import './full-article.css';
import './flussstroemung.css';

const application='https://kirman442.github.io/hydrorivers_v2/';
// Open the app's normal initial view directly, without its welcome dialog stealing focus.
const embeddedApplication=application+'?view=as&basin=ganges&m=7&c=t';

const blocks=parseStoryMarkdown(source);
const referenceGroups=[];
for(const block of parseStoryMarkdown(sourceDocumentation)){
 if(block.type==='heading'&&block.level===2)referenceGroups.push({title:block.text,blocks:[]});
 else if(referenceGroups.length)referenceGroups.at(-1).blocks.push(block);
}
const sections=[];let current=null;
for(const block of blocks){if(block.type==='heading'&&block.level===2){current={title:block.text,blocks:[],id:sections.length<6?(sections.length===0?'story-start':'story-'+(sections.length+1)):'sources'};sections.push(current);}else if(current)current.blocks.push(block);}
export const flowStory={title:blocks[0].text,intro:blocks.find(block=>block.type==='paragraph'&&!block.text.startsWith('*')).text,sections:sections.slice(0,6),sources:sections[6]};
function Inline({text}){return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^\s]+\)|`[^`]+`|\b[A-Za-z]\^[-]?\d+(?:,\d+)?)/g).map((token,i)=>{
 if(token.startsWith('**'))return <strong key={i}><Inline text={token.slice(2,-2)}/></strong>;
 if(token.startsWith('*'))return <em key={i}>{token.slice(1,-1)}</em>;
 if(token.startsWith('`'))return <code key={i}>{token.slice(1,-1)}</code>;
 const link=token.match(/^\[([^\]]+)\]\(([^\s]+)\)$/);if(link){const external=/^https?:/.test(link[2]);return <a key={i} href={siteUrl(link[2])} {...external?{target:'_blank',rel:'noopener noreferrer'}:{}}>{link[1]}</a>;}
 const power=token.match(/^([A-Za-z])\^([-]?\d+(?:,\d+)?)$/);if(power)return <React.Fragment key={i}>{power[1]}<sup>{power[2]}</sup></React.Fragment>;
 return token;
 });}
const datasetRows=[
 ['HydroRIVERS v1.0','Linien, NEXT_DOWN, mittlerer Abfluss, Einzugsgebietsfläche, Strahler-Ordnung und Abflussklasse ORD_FLOW','15″ (ca. 500 m)'],
 ['RiverATLAS v1.0','Höhe, Gefälle, monatlicher Niederschlag und Lufttemperatur; Abfluss im trockensten, mittleren und feuchtesten Monat','Je Flussabschnitt'],
 ['GloRiC v1.0','Flusstyp: Größe, hydraulische Eigenschaften und Klimazone','Je Flussabschnitt'],
 ['GloFAS-Reanalyse','Täglicher Abfluss 2022–2025 für 15 große Flüsse, jeder fünfte Tag','0,05° (ca. 5 km)'],
 ['Natural Earth','Flussnamen und Länder','1 : 10 Mio.']
];
function Table({headers,rows,caption}){return <div className="flow-table-scroll" role="region" tabIndex={0} aria-label={caption}><table className="flow-table">{caption&&<caption>{caption}</caption>}<thead><tr>{headers.map((header,i)=><th key={i} scope="col">{header}</th>)}</tr></thead><tbody>{rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j===0?<th scope="row" key={j}><Inline text={cell}/></th>:<td key={j}><Inline text={cell}/></td>)}</tr>)}</tbody></table></div>;}
const widgets={'{{data-table}}':()=> <Table headers={['Datensatz','Was wir daraus verwenden','Auflösung']} rows={datasetRows} caption="Fünf Datensätze, unterschiedliche Aufgaben"/>, '{{section-bars}}':SectionBars,'{{calculator}}':ManningCalculator,'{{slope-chart}}':SlopeChart,'{{season-chart}}':SeasonChart,'{{temperature-chart}}':TemperatureChart,'{{delivery-facts}}':DeliveryFacts};
function Formula({text}){
 const monthly=text.startsWith('**v_Monat');
 return <p className="flow-formula"><strong>{monthly?<>v<sub>Monat</sub> = v · (Q<sub>Monat</sub> / Q)<sup>0,2</sup></>:<>v = n<sup>-0,6</sup> · (Q / w)<sup>0,4</sup> · S<sup>0,3</sup></>}</strong><Inline text={text.slice(text.indexOf('**',2)+2)}/></p>;
}
function Blocks({items,resources=false}){return items.map((block,i)=>{
 if(block.type==='paragraph'){
  if(block.text.startsWith('*Am Beispiel des Ganges.')&&items[i-1]?.text==='{{section-bars}}')return null;
  if(block.text.startsWith('*Schema, nicht maßstäblich:')&&items[i+1]?.text==='{{slope-chart}}')return null;
  const Widget=widgets[block.text];if(Widget){const caption=block.text==='{{section-bars}}'?items[i+1]?.text:block.text==='{{slope-chart}}'?items[i-1]?.text:null;return <Widget key={i} caption={caption?<Inline text={caption.replace(/^\*|\*$/g,'')}/>:undefined}/>;}
  if(block.text.startsWith('**v =')||block.text.startsWith('**v_Monat'))return <Formula key={i} text={block.text}/>;
  return <p key={i}><Inline text={block.text}/></p>;
 }
 if(block.type==='heading')return <h3 key={i}>{block.text}</h3>;
 if(block.type==='list')return <ul key={i}>{block.items.map((item,j)=><li key={j}><Inline text={item}/></li>)}</ul>;
 if(block.type==='table')return resources?<dl className="mobile-network-resources trial-resources" key={i}>{block.rows.map((row,j)=><div className="mobile-network-resource" key={j}><dt><Inline text={row[0]}/></dt><dd>{row.slice(1).map((text,k)=><p key={k}><Inline text={text}/></p>)}</dd></div>)}</dl>:<Table key={i} headers={block.headers} rows={block.rows}/>;
 return null;
});}
export default function FlussstroemungPage(){return <div className="flow-page" lang="de">
 <section className="cover flow-cover" aria-labelledby="project-title"><img className="cover-image" src={siteUrl('/assets/flussstroemung-cover-vignette.webp')} alt="Reliefkarte des indischen Subkontinents mit dem Flussnetz von Ganges und Brahmaputra" width="2400" height="1200" fetchpriority="high"/><div className="cover-shade"/><div className="cover-grid" aria-hidden="true"/><div className="container cover-inner"><div className="cover-top"><a href={siteUrl('/#projekte')}><Arrow direction="left"/>Projektübersicht</a><span className="mono">Projektgeschichte / 2026</span></div><div className="cover-copy"><p className="eyebrow">Flussströmung / HydroSHEDS / Web-GIS</p><h1 id="project-title">{flowStory.title}</h1><p className="cover-intro">{flowStory.intro}</p><div className="flow-cover-actions"><a className="button" href="#map">Karte öffnen <Arrow direction="down"/></a><a className="quiet-link" href="#story-start">So funktioniert es ↓</a></div></div><div className="cover-foot mono"><span>Von den Rohdaten bis zur animierten Karte</span><span>HydroRIVERS · RiverATLAS · GloRiC · GloFAS</span></div></div></section>
 <section className="container overview flow-overview" aria-label="Projekt auf einen Blick"><dl className="project-facts"><div><dt>Projekt</dt><dd>Flussströmung<br/>Globale Flussnetze in Bewegung</dd></div><div><dt>Werkzeuge</dt><dd>Python / GeoParquet / xarray<br/>MapLibre GL / deck.gl / GLSL</dd></div><div><dt>Umfang</dt><dd>261 Flüsse<br/>Sechs Schritte von den Daten zur Karte</dd></div></dl></section>
 <div className="container full-layout"><aside className="full-contents" aria-label="Inhaltsverzeichnis"><span className="eyebrow">In dieser Geschichte</span>{flowStory.sections.map((section,i)=><a key={section.id} href={'#'+section.id}><span className="mono contents-number">{String(i+1).padStart(2,'0')}</span>{section.title.replace(/^\d+ · /,'')}</a>)}<a href="#map">Anwendung ↗</a><a href="#sources">Quellen und Dokumentation</a></aside><article className="full-reading"><div className="mobile-network-article migrated-article flow-article">
 {flowStory.sections.map(section=>{const [heading,...body]=section.blocks;return <section className="flow-story-section" key={section.id} aria-labelledby={section.id}><h2 id={section.id}>{heading.text}</h2><Blocks items={body}/></section>;})}
 <h2 id="map">Die Flussströmung erkunden</h2><MapEmbed url={embeddedApplication} title="Flussströmung" caption="HydroSHEDS / Globale Flussnetze und saisonaler Abfluss"/>
 <div className="sources-container flow-sources"><h2 id="sources">Quellen und Dokumentation</h2>{referenceGroups.map((group,i)=><DocumentationDetails key={group.title} title={group.title}><div className={i>0?'flow-reference-list':undefined}><Blocks items={group.blocks} resources={i===1}/></div></DocumentationDetails>)}<Blocks items={flowStory.sources.blocks}/></div>
 </div></article></div><ProjectNavigation projectId="flussstroemung"/>
 </div>;}
