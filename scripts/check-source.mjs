import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {projects} from '../src/projects.js';import {siteRoutes} from '../src/routes.js';
const previews=JSON.parse(fs.readFileSync(new URL('../src/project-images.json',import.meta.url),'utf8'));
const root=path.resolve(import.meta.dirname,'..');
assert.equal(projects.length,12);assert.equal(projects.some(project=>project.id==='dresden'),false);
for(const project of projects){assert.ok(previews[project.image]?.variants.length,'Missing responsive images: '+project.image+'. Run py -3.11 scripts/prepare-project-images.py');for(const variant of previews[project.image].variants)assert.ok(fs.existsSync(path.join(root,'public',variant.src)),'Missing preview '+variant.src);assert.ok(siteRoutes.some(route=>route.path===project.href),'Missing project route '+project.href);assert.ok(fs.existsSync(path.join(root,'public',project.image)));}
for(const name of fs.readdirSync(path.join(root,'src'))){if(!/\.(jsx|js|css)$/.test(name))continue;const text=fs.readFileSync(path.join(root,'src',name),'utf8');assert.ok(!text.includes('../../portfolio/node_modules'),'Old dependency '+name);assert.ok(!/EmbedDiagnostics|DresdenArticle|PendingProject|useEmbedPolicy/.test(text),'Audit-only import '+name);}
console.log('Source check: 12 projects, independent dependencies, no Dresden or diagnostics.');
