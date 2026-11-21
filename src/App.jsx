import React from 'react';
import Ubahn3dPage from './Ubahn3dPage.jsx';
import AppShell,{resolveRoute} from './AppShell.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import {storyArticles} from './story-articles.jsx';
import HomePage from './HomePage.jsx';
import AboutPage from './AboutPage.jsx';
import FullProject from './FullProject.jsx';
import ProjectPage from './ProjectPage.jsx';
import LadeinfrastrukturPage from './LadeinfrastrukturPage.jsx';
import UnfallatlasTrial from './UnfallatlasTrial.jsx';
import LegalPage from './LegalPage.jsx';
import EnergieatlasPage from './EnergieatlasPage.jsx';
import FlussstroemungPage from './FlussstroemungPage.jsx';
import {currentPath} from './site-paths.js';
export function App({pathname=currentPath()}){
  const {route}=resolveRoute(pathname);
  let page;
  if(!route)page=<NotFoundPage/>;
  else if(route.kind==='ubahn3d')page=<Ubahn3dPage/>;
  else if(route.kind==='home')page=<HomePage/>;
  else if(route.kind==='about')page=<AboutPage/>;
  else if(route.kind==='mobile')page=<FullProject/>;
  else if(route.kind==='charging')page=<LadeinfrastrukturPage/>;
  else if(route.kind==='unfallatlas')page=<UnfallatlasTrial/>;
  else if(route.kind==='legal')page=<LegalPage type={route.legalType}/>;
  else if(route.kind==='energieatlas')page=<EnergieatlasPage/>;
  else if(route.kind==='flow')page=<FlussstroemungPage/>;
  else {const article=storyArticles[route.projectId];page=<ProjectPage projectId={route.projectId} Article={article.default} contents={article.contents}/>;}
  return <AppShell pathname={pathname}>{page}</AppShell>;
}
