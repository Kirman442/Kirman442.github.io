import React from 'react';
import {Arrow} from './components.jsx';
import source from './content/ubahn3d-story-de.md?raw';
import {parseStoryMarkdown} from './energieatlas-markdown.js';
import {siteUrl} from './site-paths.js';
import MapEmbed from './MapEmbed.jsx';
import {LocaleProvider} from './locale.jsx';
import ProjectSources,{SourceBlocks} from './ProjectSources.jsx';
import ProjectNavigation from './ProjectNavigation.jsx';
import './full-article.css';
import './ubahn3d.css';

const blocks=parseStoryMarkdown(source);
const sections=[];
for(const block of blocks){
  if(block.type==='heading'&&block.level===2)sections.push({id:sections.length<7?'ubahn3d-story-'+(sections.length+1):'sources',title:block.text,blocks:[]});
  else if(sections.length)sections.at(-1).blocks.push(block);
}
const story=sections.slice(0,7);
const groups=[];
for(const block of sections[7].blocks){if(block.type==='heading'&&block.level===3)groups.push({title:block.text,blocks:[]});else if(groups.length)groups.at(-1).blocks.push(block);}
function Inline({text}){return text.split(/(\[[^\]]+\]\([^\s)]+\)|`[^`]+`|https?:\/\/[^\s)]+[\w/])/g).map((part,i)=>{
 const link=part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
 if(link)return <a key={i} href={siteUrl(link[2])} {...(/^https?:/.test(link[2])?{target:"_blank",rel:"noopener noreferrer"}:{})}>{link[1]}</a>;
 if(part.startsWith('`'))return <code key={i}>{part.slice(1,-1)}</code>;
 if(/^https?:\/\//.test(part))return <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>;
 return part;
});}
function Blocks({items}){return items.map((block,i)=>{
 if(block.type==='paragraph')return <p key={i}><Inline text={block.text}/></p>;
 if(block.type==='list')return <ul key={i}>{block.items.map((item,j)=><li key={j}><Inline text={item}/></li>)}</ul>;
 if(block.type==='table')return <div key={i} className="ubahn3d-table-wrap" role="region" aria-label="Herkunft der Tiefenangaben und Kennzeichnung" tabIndex={0}><table><caption>Tiefenangaben: Quellen und Kennzeichnung</caption><thead><tr>{block.headers.map((cell,j)=><th scope="col" key={j}>{cell}</th>)}</tr></thead><tbody>{block.rows.map((row,j)=><tr key={j}>{row.map((cell,k)=>k===0?<th scope="row" key={k}><Inline text={cell}/></th>:<td key={k}><Inline text={cell}/></td>)}</tr>)}</tbody></table></div>;
 return null;
});}
export default function Ubahn3dPage(){return <div className="ubahn3d-page" lang="de">
 <section className="cover project-cover ubahn3d-cover" aria-labelledby="project-title"><img className="cover-image" src={siteUrl('/assets/ubahn-3d-cover.webp')} alt="Schematischer Querschnitt durch das Erdreich mit farbigen U-Bahn-Linien in unterschiedlicher Tiefe und Schildern für vier Städte" width="2400" height="1200" fetchpriority="high"/><div className="cover-shade"/><div className="container cover-inner"><div className="cover-top"><a href={siteUrl('/')}>← Zur Projektübersicht</a><span className="mono">Projektgeschichte / 2026</span></div><div className="cover-copy"><h1 id="project-title">U-Bahn<br/>in der Tiefe</h1><p className="cover-intro">Vier Städte.<br/>U-Bahn räumlich erkunden: unter der Erde, an der Oberfläche und im Lauf der Zeit.</p></div><div className="cover-foot mono"><span>Berlin · Hamburg · München · Nürnberg</span><span>2026</span></div></div></section>
 <section className="container overview" aria-label="Über das Projekt"><dl className="project-facts"><div><dt>Aufgabe</dt><dd>Tiefen und Gelände der U-Bahn-Strecken visualisieren<br/>Die Entstehungsgeschichte von vier U-Bahn-Netzen</dd></div><div><dt>Werkzeuge</dt><dd>React / three.js / R3F<br/>Python / Node.js / DGM</dd></div><div><dt>Umfang</dt><dd>4 Städte · 422 Bahnhöfe<br/>Strecken im Bau bis 2034</dd></div></dl><div className="full-project-actions"><a className="button" href="#map">Anwendung öffnen <Arrow direction="down"/></a></div></section>
 <div className="container full-layout"><aside className="full-contents" aria-label="Inhaltsverzeichnis"><span className="eyebrow">In dieser Geschichte</span>{story.map(section=><a key={section.id} href={'#'+section.id}>{section.title}</a>)}<a href="#map">Anwendung ↗</a><a href="#sources">Quellen und Dokumentation</a></aside><article className="full-reading"><div className="mobile-network-article migrated-article ubahn3d-article">{story.map(section=><React.Fragment key={section.id}><h2 id={section.id}>{section.title}</h2><Blocks items={section.blocks}/></React.Fragment>)}
 <h2 id="map">Die U-Bahn räumlich erkunden</h2><div lang="de"><LocaleProvider locale="de"><MapEmbed url="https://gis.krmn.app/ubahn-3d/" title="U-Bahn in der Tiefe" caption="Berlin / Hamburg / München / Nürnberg"/></LocaleProvider></div>
 <div className="sources-container ubahn3d-sources"><ProjectSources
   credits={<SourceBlocks blocks={groups.find(group=>group.title==='Mitwirkende')?.blocks||[]} Inline={Inline} credits/>}
   data={<SourceBlocks blocks={groups.find(group=>group.title==='Daten')?.blocks||[]} Inline={Inline}/>}
   libraries={<SourceBlocks blocks={groups.find(group=>group.title==='Code und Bibliotheken')?.blocks||[]} Inline={Inline}/>}
   documentation={<SourceBlocks blocks={groups.find(group=>group.title==='Dokumentation')?.blocks||[]} Inline={Inline}/>}
 /></div>
 </div></article></div>
 <ProjectNavigation projectId="ubahn3d"/>
 </div>;}
