import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {JSDOM,VirtualConsole} from 'jsdom';import {siteRoutes} from '../src/routes.js';
import {siteConfig} from '../site.config.mjs';
import vm from 'node:vm';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const checks=[];
for(const route of siteRoutes){
 const filename=path.join(dist,route.path==='/'?'index.html':route.path.slice(1)+'/index.html');
 const html=fs.readFileSync(filename,'utf8'),errors=[];
 const console=new VirtualConsole();console.on('error',(...args)=>errors.push(args.join(' ')));console.on('jsdomError',error=>errors.push(error.message));
 const dom=new JSDOM(html,{url:siteConfig.origin+siteConfig.base+route.path.slice(1),runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:console});
 const {window}=dom;
 let scrollPosition=0,scrollReads=0;
 Object.defineProperty(window,'scrollY',{configurable:true,get(){scrollReads++;return scrollPosition;}});
 window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 window.fetch=async url=>{const asset=new URL(url,dom.window.location.href);assert.ok(asset.pathname.startsWith(siteConfig.base));assert.ok(fs.existsSync(path.join(dist,asset.pathname.slice(siteConfig.base.length))));return {};};
 window.HTMLElement.prototype.scrollIntoView=()=>{};
 const matches=window.HTMLElement.prototype.matches;
 window.HTMLElement.prototype.matches=function(selector){return selector===':modal'?this.dataset.modal==='true':matches.call(this,selector);};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;this.dataset.modal='true';};
 window.HTMLDialogElement.prototype.close=function(){this.open=false;delete this.dataset.modal;};
 const before=window.document.querySelector('h1').textContent;
 const scriptUrl=window.document.querySelector('script[type=module]').getAttribute('src');
 assert.ok(scriptUrl.startsWith(siteConfig.base),'Client script escapes site base');
 // Execute the actual production module graph, including dynamic route imports.
 const modules=new Map();let linking=Promise.resolve();
 function moduleFor(url){
  if(modules.has(url))return modules.get(url);
  const filename=path.join(dist,new URL(url).pathname.slice(siteConfig.base.length));
  const module=new vm.SourceTextModule(fs.readFileSync(filename,'utf8'),{
   context:dom.getInternalVMContext(),identifier:url,
   initializeImportMeta(meta){meta.url=url;},
   importModuleDynamically:async(specifier,referencing)=>{
    const dependency=moduleFor(new URL(specifier,referencing.identifier).href);
    linking=linking.then(()=>dependency.status==='unlinked'?dependency.link(resolveModule):undefined);
    await linking;
    if(dependency.status!=='evaluated')await dependency.evaluate();
    return dependency;
   }
  });modules.set(url,module);return module;
 }
 function resolveModule(specifier,referencing){return moduleFor(new URL(specifier,referencing.identifier).href);}
 const entry=moduleFor(new URL(scriptUrl,dom.window.location.href).href);
 await entry.link(resolveModule);await entry.evaluate();
 await new Promise(resolve=>setTimeout(resolve,500));
 assert.equal(window.document.querySelector('h1').textContent,before,route.path+' changed route during hydration');
 assert.deepEqual(errors,[],route.path+' client errors');
 // Shared source descriptions use the same paragraph structure as the article renderers.
 for(const description of window.document.querySelectorAll('.project-sources dl[data-source-renderer="shared"] .mobile-network-resource dd')){
  assert.ok(description.querySelector(':scope > p'),route.path+' source description needs a paragraph');
  assert.ok([...description.childNodes].every(node=>node.nodeType!==3||!node.textContent.trim()),route.path+' source description has unwrapped text');
 }

 assert.equal(window.document.body.style.overflow,'');
 if(window.document.querySelector('iframe')){
  const frame=window.document.querySelector('iframe'),embed=window.document.querySelector('.map-embed');
  // External URL is present from HTML parsing, without scrolling or an observer.
  assert.equal(frame.getAttribute('src'),frame.getAttribute('data-app-src'));
  frame.dispatchEvent(new window.Event('load'));await new Promise(resolve=>setTimeout(resolve,20));assert.equal(embed.dataset.loadState,'document');
  const data={type:'karten-code:app-status',status:'ready'},origin=new URL(frame.src).origin;
  window.dispatchEvent(new window.MessageEvent('message',{data,origin:'https://untrusted.example',source:frame.contentWindow}));
  window.dispatchEvent(new window.MessageEvent('message',{data,origin,source:window}));
  await new Promise(resolve=>setTimeout(resolve,20));assert.equal(embed.dataset.loadState,'document');
  window.dispatchEvent(new window.MessageEvent('message',{data,origin,source:frame.contentWindow}));
  await new Promise(resolve=>setTimeout(resolve,20));assert.equal(embed.dataset.loadState,'ready');
  frame.dispatchEvent(new window.Event('load'));await new Promise(resolve=>setTimeout(resolve,20));assert.equal(embed.dataset.loadState,'ready');
  if(route.path==='/projects/ladeinfrastruktur'){
   window.dispatchEvent(new window.MessageEvent('message',{data:{...data,status:'error'},origin,source:frame.contentWindow}));
   await new Promise(resolve=>setTimeout(resolve,20));assert.equal(embed.dataset.loadState,'error');
   window.document.querySelector('.embed-reload').click();await new Promise(resolve=>setTimeout(resolve,20));
   assert.notEqual(window.document.querySelector('iframe'),frame);
   window.dispatchEvent(new window.MessageEvent('message',{data,origin,source:frame.contentWindow}));
   await new Promise(resolve=>setTimeout(resolve,20));assert.notEqual(embed.dataset.loadState,'ready');
  }
 }
 if(route.path==='/'){
  assert.equal(scrollReads,0,'Header must not force an initial layout by reading scrollY during hydration');
  const header=window.document.querySelector('.site-header');
  const scroll=async y=>{scrollPosition=y;window.dispatchEvent(new window.Event('scroll'));await new Promise(resolve=>setTimeout(resolve,20));};
  await scroll(0);await scroll(120);
  assert.ok(header.classList.contains('site-header-hidden'),'Header should hide on downward scroll');
  await scroll(80);await new Promise(resolve=>setTimeout(resolve,320));
  assert.ok(!header.classList.contains('site-header-hidden'),'Header should reveal after upward scroll');
  await scroll(140);await scroll(100);await scroll(180);await new Promise(resolve=>setTimeout(resolve,320));
  assert.ok(header.classList.contains('site-header-hidden'),'Downward scroll should cancel pending reveal');
  await scroll(0);assert.ok(!header.classList.contains('site-header-hidden'),'Header should remain visible at the top');
  assert.equal(window.document.querySelectorAll('.home-project-card').length,12);
  assert.equal(window.document.querySelector('.home-project-card').dataset.projectId,'ubahn3d');
  assert.equal(window.document.querySelector('.home-featured .featured-map').getAttribute('href'),siteConfig.base+'projects/ladeinfrastruktur');
  const button=[...window.document.querySelectorAll('.project-filters button')].find(item=>item.textContent==='3D & Geodaten');button.click();await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(window.document.querySelector('.project-count').textContent,'2 Projekte');
  const trigger=window.document.querySelector('.projects-trigger');trigger.click();await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(window.document.querySelector('.projects-panel').hidden,false);assert.equal(window.document.querySelectorAll('.projects-panel li').length,13);
 }
 if(route.path==='/projects/ladeinfrastruktur'){
  const frame=window.document.querySelector('iframe');window.document.querySelector('.embed-actions button').click();await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(window.document.querySelector('iframe'),frame);assert.equal(window.document.body.style.overflow,'hidden');
  window.document.querySelector('dialog').dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(window.document.querySelector('iframe'),frame);assert.equal(window.document.body.style.overflow,'');
 }
 if(['/projects/ladeinfrastruktur','/projects/unfallatlas','/projects/mobile-network'].includes(route.path)){
  const sources=window.document.querySelector('.project-sources');
  assert.equal(sources.children[1].tagName,'SECTION');
  assert.ok(sources.children[1].textContent.includes('Kirill Lisochenko'));
  const disclosures=[...sources.querySelectorAll('details')];
  assert.equal(disclosures.length,3);assert.ok(disclosures.every(node=>!node.open));
  assert.ok(!/final decisions|abschließenden? Entscheidungen/.test(sources.children[1].textContent));
  if(route.lang==='de')assert.ok(sources.children[1].textContent.includes('Richard Sorge'));
  assert.deepEqual(disclosures.map(node=>node.querySelector('summary').textContent),route.lang==='en'?['Data and methodology','Packages and libraries','Documentation and background reading']:['Daten und Methodik','Pakete und Bibliotheken','Dokumentation und weiterführende Materialien']);
  for(const disclosure of disclosures){assert.ok(disclosure.querySelector('a'),'Empty sources group');disclosure.querySelector('summary').click();assert.equal(disclosure.open,true);disclosure.querySelector('summary').click();assert.equal(disclosure.open,false);}
 }
 if(route.path==='/projects/flussstroemung'){
  const doc=window.document;
  const click=text=>[...doc.querySelectorAll('button')].find(button=>button.textContent===text).click();
  click('Unterer Ganges');await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(doc.getElementById('flow-q').value,Math.log10(40393).toString());
  assert.equal(doc.getElementById('flow-s').value,Math.log10(.05).toString());
  const firstVelocity=doc.getElementById('flow-velocity').textContent;
  click('Gebirgsbach');await new Promise(resolve=>setTimeout(resolve,20));assert.notEqual(doc.getElementById('flow-velocity').textContent,firstVelocity);
  click('Ob');await new Promise(resolve=>setTimeout(resolve,20));assert.equal(doc.querySelector('[data-flow-river]').dataset.flowRiver,'ob');
  assert.equal(doc.querySelectorAll('.flow-year').length,4);
  doc.querySelector('.flow-year-toggle input').click();await new Promise(resolve=>setTimeout(resolve,20));assert.equal(doc.querySelectorAll('.flow-year').length,0);
  click('Langes Messfenster');await new Promise(resolve=>setTimeout(resolve,20));assert.equal(doc.querySelectorAll('.flow-steep').length,0);
  assert.equal(doc.querySelectorAll('.flow-story-section').length,6);
  assert.equal(doc.querySelector('meta[name=robots]'),null);
  assert.ok(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8').includes('/projects/flussstroemung'));
 }
 if(route.path==='/projects/energieatlas'){
  const link=window.document.querySelector('.energy-article>.appendix-reference a');
  const target=link.getAttribute('href').slice(1);link.click();await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(window.document.querySelectorAll('.appendix-note-content:not([hidden])').length,1);
  assert.equal(window.document.getElementById(target+'-content').hidden,false);
  window.document.querySelector('.appendix-introduction .appendix-return').click();await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(window.document.querySelectorAll('.appendix-note-content:not([hidden])').length,0);
  assert.equal(window.document.activeElement.id,link.id);
  assert.equal(window.document.querySelector('.embed-actions a').textContent,'Separat öffnen ↗');
 }
 assert.deepEqual(errors,[],route.path+' interaction errors');
 checks.push({path:route.path,hydration:'passed'});dom.window.close();
}
fs.mkdirSync(path.join(root,'.build'),{recursive:true});fs.writeFileSync(path.join(root,'.build/client-check.json'),JSON.stringify({environment:'Production JavaScript in jsdom; no GPU, external apps or visual layout checks',checks},null,2)+'\n');
console.log(`Production client hydration passed for ${checks.length} pages; catalogue/menu/full-screen interactions passed.`);process.exit(0);
