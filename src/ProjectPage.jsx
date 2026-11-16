import { siteUrl } from "./site-paths.js";import React, { useEffect } from 'react';
import { Arrow, Contours } from './components.jsx';
import { projects } from './projects.js';
import ProjectNavigation from './ProjectNavigation.jsx';
import './full-article.css';
import {projectStories} from './project-stories.js';

export default function ProjectPage({ projectId, Article, contents }) {
  const project = projects.find((p) => p.id === projectId);
  const story = projectStories[projectId];
  useEffect(() => {document.title = project.title + ' - Karten & Code';}, [project.title]);
  return <>
    <section className={'cover project-cover project-cover-' + projectId} aria-labelledby="project-title"><img className="cover-image" src={siteUrl("/assets/" + projectId + "-cover.webp")} alt={project.title + ': Projektvisualisierung'} width="1200" height="800" /><div className="cover-shade" /><Contours className="cover-contours" /><div className="cover-grid" aria-hidden="true" /><div className="container cover-inner"><div className="cover-top"><a href={siteUrl("/home#projekte")}><Arrow direction="left" /> Projektübersicht</a><span className="mono">Projektgeschichte / {project.year}</span></div><div className="cover-copy"><p className="eyebrow">{project.category} / Datenvisualisierung</p><p className="project-name">{project.title}</p><h1 id="project-title">{story.title}</h1><p className="cover-intro">{story.intro}</p></div><div className="cover-foot mono"><span>{story.dataset}</span><span>{story.date}</span></div></div></section>
    <section className="container overview" aria-label="Projekt auf einen Blick"><dl className="project-facts"><div><dt>Mein Beitrag</dt><dd>Programmierung<br />Datenbearbeitung & Visualisierung</dd></div><div><dt>Werkzeuge</dt><dd>{story.tools}</dd></div><div><dt>Veröffentlicht</dt><dd>{story.date}</dd></div></dl><div className="full-project-actions"><a className="button" href={siteUrl("#" + (story.target || "map"))}>{story.action || "Karte entdecken"} <Arrow direction="down" /></a></div></section>
    <div className="container full-layout"><aside className="full-contents" aria-label="In dieser Projektgeschichte"><span className="eyebrow">In dieser Geschichte</span>{contents.map(({ id, title }, i) => <a key={id} href={siteUrl('#' + id)}><span className="mono contents-number">{String(i + 1).padStart(2, '0')}</span>{title}</a>)}{story.contributors && <p className="project-authors"><span className="eyebrow">Projektteam</span>{story.contributors}</p>}</aside><article className={'full-reading article-' + projectId}><Article /></article></div>
    <ProjectNavigation projectId={projectId} />
  </>;
}
