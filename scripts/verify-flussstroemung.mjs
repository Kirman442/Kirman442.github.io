import fs from 'node:fs';import assert from 'node:assert/strict';import {JSDOM} from 'jsdom';import {parseStoryMarkdown} from '../src/energieatlas-markdown.js';import {seasonalRivers} from '../src/flussstroemung-data.js';
const source=fs.readFileSync(new URL('../src/content/flussstroemung-story-de.md',import.meta.url),'utf8');
const d=new JSDOM(fs.readFileSync(new URL('../dist/projects/flussstroemung/index.html',import.meta.url),'utf8')).window.document;
const normalize=s=>s.replace(/\s+/g,' ').trim();const plain=s=>s.replace(/\[([^\]]+)\]\([^\s]+\)/g,'$1').replace(/\*|`/g,'').replace(/\^/g,'').replaceAll('_Monat','Monat');const actual=normalize(d.querySelector('.flow-page').textContent);
let fragments=0;
for(const block of parseStoryMarkdown(source)){
 if(block.type!=='paragraph'||block.text.startsWith('{{')||block.text.startsWith('[Karte öffnen] ·')||block.text.startsWith('[Karte öffnen](#map)')||block.text==='*Flussströmung · Wie es gemacht ist*')continue;
 assert.ok(actual.includes(normalize(plain(block.text))),'Missing story paragraph: '+block.text.slice(0,100));fragments++;
}
assert.equal(d.querySelectorAll('.flow-story-section').length,6);
assert.equal(d.querySelector('.flow-table').querySelectorAll('tbody tr').length,5);
const references=fs.readFileSync(new URL('../src/content/flussstroemung-sources-de.md',import.meta.url),'utf8');
for(const block of parseStoryMarkdown(references))if(block.type==='paragraph')assert.ok(actual.includes(normalize(plain(block.text))),'Missing reference paragraph: '+block.text.slice(0,100));
assert.equal(d.querySelectorAll('.flow-sources details').length,3);
assert.ok([...d.querySelectorAll('.flow-sources details')].every(details=>!details.open));
assert.equal(d.querySelectorAll('.flow-sources a[href="https://kirman442.github.io/hydrorivers_v2/"]').length,0);
assert.ok(!/[А-Яа-яЁё]|\{\{/.test(actual),'Unresolved editorial marker or Russian text');
assert.equal(d.querySelector('meta[name=robots]'),null);
assert.ok(fs.readFileSync(new URL('../dist/sitemap.xml',import.meta.url),'utf8').includes('/projects/flussstroemung'));
assert.equal(d.querySelector('.flow-cover img').getAttribute('src'),'/kc/assets/flussstroemung-cover-vignette.webp');
assert.equal(d.querySelector('.flow-cover img').getAttribute('width'),'2400');
for(const r of Object.values(seasonalRivers)){assert.equal(r.q.length,12);assert.equal(r.pre.length,12);assert.ok(r.yrs.every(year=>year.length===12));}
console.log(`Flussströmung: ${fragments} prose fragments preserved, 6 sections, 5 dataset rows, 3 collapsed reference groups with complete source text, monthly series, cover and published route verified.`);

assert.ok(!actual.includes('Der Code liegt mit Anleitung auf GitHub.'));
assert.ok(d.querySelector('#project-navigation a[rel=next]'));
