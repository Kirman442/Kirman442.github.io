const pageModules={home:'HomePage',about:'AboutPage',mobile:'FullProject',charging:'LadeinfrastrukturPage',unfallatlas:'UnfallatlasTrial',legal:'LegalPage',energieatlas:'EnergieatlasPage',flow:'FlussstroemungPage',story:'ProjectPage'};
const articleModules={accidents:'AccidentsArticle',bayern:'BayernArticle',art:'KunstkartenArticle',rivers:'FlusssystemArticle',metro:'UbahnArticle',mining:'BergbauArticle',clusters:'ClusteringArticle'};
const loaders={
  HomePage:()=>import('./HomePage.jsx'),AboutPage:()=>import('./AboutPage.jsx'),
  FullProject:()=>import('./FullProject.jsx'),ProjectPage:()=>import('./ProjectPage.jsx'),
  LadeinfrastrukturPage:()=>import('./LadeinfrastrukturPage.jsx'),UnfallatlasTrial:()=>import('./UnfallatlasTrial.jsx'),
  LegalPage:()=>import('./LegalPage.jsx'),EnergieatlasPage:()=>import('./EnergieatlasPage.jsx'),
  FlussstroemungPage:()=>import('./FlussstroemungPage.jsx'),NotFoundPage:()=>import('./NotFoundPage.jsx'),
  AccidentsArticle:()=>import('./AccidentsArticle.jsx'),BayernArticle:()=>import('./BayernArticle.jsx'),
  KunstkartenArticle:()=>import('./KunstkartenArticle.jsx'),FlusssystemArticle:()=>import('./FlusssystemArticle.jsx'),
  UbahnArticle:()=>import('./UbahnArticle.jsx'),BergbauArticle:()=>import('./BergbauArticle.jsx'),ClusteringArticle:()=>import('./ClusteringArticle.jsx')
};
export function routeModuleNames(route){
  const names=[pageModules[route?.kind]||'NotFoundPage'];
  if(route?.kind==='story')names.push(articleModules[route.projectId]);
  return names;
}
export async function loadPage(route){
  const [page,article]=await Promise.all(routeModuleNames(route).map(name=>loaders[name]()));
  const props=route?.kind==='story'?{projectId:route.projectId,Article:article.default,contents:article.contents}:route?.kind==='legal'?{type:route.legalType}:{};
  return {Page:page.default,props};
}
