import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {siteRoutes,legacyRoutes} from '../src/routes.js';
import {siteConfig} from '../site.config.mjs';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const {origin,base}=siteConfig;
const previewOrigin='https://portfolio.test';
const routeUrl=pathname=>pathname==='/'?'/':pathname+'/';
const canonical=pathname=>origin+routeUrl(pathname);
let checkedLinks=0,checkedFiles=0;const pages=[];
function existsWithExactCase(filename){
 let current=dist;
 for(const part of path.relative(dist,filename).split(path.sep).filter(Boolean)){
  if(!fs.readdirSync(current).includes(part))return false;
  current=path.join(current,part);
 }
 return true;
}
for(const route of siteRoutes){
 const filename=path.join(dist,route.path==='/'?'index.html':route.path.slice(1)+'/index.html');
 const html=fs.readFileSync(filename,'utf8');
 const deployedPath=base+routeUrl(route.path).slice(1);
 const dom=new JSDOM(html,{url:previewOrigin+deployedPath}),document=dom.window.document;
 assert.equal(document.querySelectorAll('h1').length,1,route.path+' must have one h1');
 assert.equal(document.documentElement.lang,route.lang);
 for(const image of document.querySelectorAll('.article-figure img,.author-photo img')){
  assert.ok(Number(image.getAttribute('width'))>0&&Number(image.getAttribute('height'))>0,route.path+' image has no reserved dimensions');
 }
 for(const frame of document.querySelectorAll('iframe[data-app-src]')){
  assert.equal(frame.getAttribute('src'),frame.dataset.appSrc,route.path+' must start its app immediately');
  assert.ok(frame.dataset.appSrc.startsWith('https://'));
  assert.equal(frame.getAttribute('loading'),'eager');
  assert.equal(frame.hasAttribute('aria-hidden'),false);
 }
 const expectedCanonical=canonical(route.path);
 assert.equal(document.querySelector('link[rel=canonical]')?.href,expectedCanonical);
 assert.equal(document.querySelector('meta[property="og:url"]')?.content,expectedCanonical);
 const shareImage=new URL(document.querySelector('meta[property="og:image"]')?.content);
 assert.equal(shareImage.origin,origin);
 assert.ok(existsWithExactCase(path.join(dist,shareImage.pathname)),route.path+' missing share image');
 assert.ok(document.querySelector('meta[name=description]')?.content);
 assert.ok(!/Dresden|\/diagnostics\//.test(html),route.path+' includes excluded content');
 assert.equal(document.querySelector('meta[name=robots]')?.content==='noindex',Boolean(route.draft),route.path+' indexing status');
 assert.equal(document.querySelector(`.footer-legal [href="${base}datenschutz/"]`)?.textContent,'Datenschutz');
 assert.equal(document.querySelector(`.footer-legal [href="${base}impressum/"]`)?.textContent,'Impressum');
 if(route.kind==='legal'){
  assert.equal(document.querySelectorAll('iframe').length,0);
  assert.equal(document.querySelectorAll('.legal-draft,.legal-pending').length,0);
  if(route.legalType==='privacy'){
   assert.ok(document.querySelector('a[href="https://www.lda.bayern.de/de/beschwerde.html"]'));
   assert.ok(document.querySelector('a[href="https://www.edpb.europa.eu/about-edpb/our-members_en"]'));
  }
 }
 for(const element of document.querySelectorAll('[href],[src],[poster]')){
  const value=element.getAttribute('href')||element.getAttribute('src')||element.getAttribute('poster');
  if(!value||/^(mailto:|tel:|data:|blob:)/.test(value))continue;
  if(value.startsWith('#')){assert.ok(document.getElementById(decodeURIComponent(value.slice(1))),route.path+' missing anchor '+value);continue;}
  const url=new URL(value,dom.window.location.href);if(url.origin!==previewOrigin)continue;
  assert.ok(url.pathname.startsWith(base),'URL escapes '+base+': '+value);checkedLinks++;
  const relative=decodeURIComponent(url.pathname.slice(base.length));let target=path.join(dist,relative);
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  assert.ok(fs.existsSync(target),route.path+' missing file '+value);
  assert.ok(existsWithExactCase(target),route.path+' wrong filename case '+value);checkedFiles++;
  if(url.hash&&target.endsWith('.html')){
   const targetDocument=target===filename?document:new JSDOM(fs.readFileSync(target,'utf8')).window.document;
   assert.ok(targetDocument.getElementById(decodeURIComponent(url.hash.slice(1))),route.path+' missing target anchor '+value);
  }
 }
 pages.push({path:route.path,language:route.lang,title:document.title,iframes:document.querySelectorAll('iframe').length});dom.window.close();
}
for(const [alias,route] of Object.entries(legacyRoutes)){
 const html=fs.readFileSync(path.join(dist,alias.slice(1),'index.html'),'utf8');
 const dom=new JSDOM(html);
 assert.equal(dom.window.document.querySelector('link[rel=canonical]')?.href,canonical(route));
 assert.equal(dom.window.document.querySelector('p a')?.getAttribute('href'),base+routeUrl(route).slice(1));
 dom.window.close();
}
for(const file of ['404.html','.nojekyll','robots.txt','sitemap.xml'])assert.ok(fs.existsSync(path.join(dist,file)));
assert.ok(fs.readFileSync(path.join(dist,'robots.txt'),'utf8').includes('Sitemap: '+origin+'/sitemap.xml'));
const sitemap=new JSDOM(fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8'),{contentType:'text/xml'});
assert.deepEqual([...sitemap.window.document.querySelectorAll('loc')].map(entry=>entry.textContent),siteRoutes.filter(route=>!route.draft).map(route=>canonical(route.path)));
sitemap.window.close();
assert.ok(!fs.existsSync(path.join(dist,'projects/dresden')));
const report={base,pages,legacyRedirects:Object.keys(legacyRoutes).length,checkedLinks,checkedFiles,diagnosticsExcluded:true,dresdenExcluded:true};
fs.writeFileSync(path.join(dist,'release-check.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
