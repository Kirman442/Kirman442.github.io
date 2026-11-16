import React from 'react';
import {createRoot,hydrateRoot} from 'react-dom/client';
import AppShell,{resolveRoute} from './AppShell.jsx';
import {loadPage} from './page-loaders.js';
import {currentPath} from './site-paths.js';
const root=document.getElementById('root');
const pathname=currentPath();
// Keep prerendered content visible while fetching only this page's code.
loadPage(resolveRoute(pathname).route).then(({Page,props})=>{
  const application=<React.StrictMode><AppShell pathname={pathname}><Page {...props}/></AppShell></React.StrictMode>;
  if(root.hasChildNodes())hydrateRoot(root,application);
  else createRoot(root).render(application);
}).catch(error=>console.error('Page interaction code could not be loaded; the static article remains available.',error));
