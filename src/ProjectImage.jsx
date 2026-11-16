import React from 'react';
import manifest from './project-images.json';
import {siteUrl} from './site-paths.js';

// Match the existing object-fit:cover slots. For wide source images, enough
// source pixels must remain after the sides are cropped by CSS.
function imageSizes(kind, ratio) {
  const needed = height => Math.ceil(height * ratio);
  if (kind === 'featured') return `(max-width: 360px) max(calc(100vw - 130px), ${needed(180)}px), (max-width: 700px) max(calc(100vw - 138px), ${needed(210)}px), max(600px, ${needed(300)}px)`;
  if (kind === 'hero-1') return `(max-width: 700px) max(280px, ${needed(270)}px), max(360px, ${needed(320)}px)`;
  if (kind === 'hero-2') return `max(230px, ${needed(150)}px)`;
  if (kind === 'hero-3') return `max(320px, ${needed(140)}px)`;
  return `(max-width: 700px) max(100px, ${needed(140)}px), (max-width: 800px) max(330px, ${needed(190)}px), max(165px, ${needed(150)}px)`;
}

export default function ProjectImage({src, kind='card', ...props}) {
  const image = manifest[src];
  const variants = image?.variants || [];
  const fallback = variants.find(variant => variant.width >= (kind === 'featured' ? 960 : 640)) || variants.at(-1);
  return <img {...props} src={siteUrl(fallback?.src || src)}
    srcSet={variants.length ? variants.map(variant => `${siteUrl(variant.src)} ${variant.width}w`).join(', ') : undefined}
    sizes={image ? imageSizes(kind, image.width / image.height) : undefined}
    width={image?.width} height={image?.height}/>;
}
