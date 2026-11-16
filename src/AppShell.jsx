import React from 'react';
import {SiteHeader,Footer} from './components.jsx';
import {LocaleProvider} from './locale.jsx';
import {currentPath} from './site-paths.js';
import {siteRoutes,legacyRoutes} from './routes.js';
import './theme.css';
import './identity.css';
export function resolveRoute(pathname=currentPath()) {
  const path=legacyRoutes[pathname]||pathname;
  return {path,route:siteRoutes.find(item=>item.path===path)};
}
export default function AppShell({pathname,children}) {
  const {path,route}=resolveRoute(pathname);
  return <LocaleProvider locale={route?.lang||'de'}><a lang="de" className="skip-link" href="#main">Zum Inhalt</a><SiteHeader path={path}/><main id="main">{children}</main><Footer/></LocaleProvider>;
}
