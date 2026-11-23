import assert from 'node:assert/strict';
import {legalDetails,legalOpenItems,legalDraft} from '../src/legal-details.js';
import {siteConfig} from '../site.config.mjs';
import {siteRoutes} from '../src/routes.js';
assert.ok(!siteRoutes.some(route=>route.localOnly),'Publication blocked: a local review page has not been approved for release.');
assert.ok(legalDetails.postalAddress.length>=2,'Publication blocked: complete postal address is missing.');
const repository=process.env.GITHUB_REPOSITORY;
if(repository){
 const allowed=siteConfig.publicationRepositories.some(target=>target.toLowerCase()===repository.toLowerCase());
 assert.ok(allowed,'This workflow may publish only from the Karten & Code repository.');
}
if(legalDraft)console.warn('Datenschutz has unresolved review items; see src/legal-details.js (reviewed 2026-11-22).\n'+legalOpenItems.join('\n'));
console.log('Publication targets: '+siteConfig.publicationRepositories.join(', ')+'. This command does not publish or record owner approval.');
