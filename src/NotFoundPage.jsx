import React from 'react';
import {siteUrl} from './site-paths.js';
export default function NotFoundPage(){return <section className="container pending-project"><p className="eyebrow">404</p><h1>Diese Seite wurde nicht gefunden.</h1><a className="button" href={siteUrl('/')}>Zur Projektübersicht ↗</a></section>;}
