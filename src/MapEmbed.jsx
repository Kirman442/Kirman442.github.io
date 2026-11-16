import {siteUrl} from './site-paths.js';
import React,{useEffect,useRef,useState} from 'react';
import {labels,useLocale} from './locale.jsx';

export default function MapEmbed(props){return <InteractiveEmbed key={props.url} {...props}/>;}
function InteractiveEmbed({url='https://mobile-network-map.netlify.app/',title='MobileNetwork',caption='Current Arrow IPC + Brotli version'}) {
  const t=labels[useLocale()];
  const [expanded,setExpanded]=useState(false),[attempt,setAttempt]=useState(0),[loadState,setLoadState]=useState('loading');
  const dialog=useRef(null),frame=useRef(null),expandButton=useRef(null),wasExpanded=useRef(false);
  useEffect(()=>{
    const document=frame.current?.contentDocument;
    if(document===null||(document&&document.URL!=='about:blank')){
      setLoadState(state=>state==='loading'?'document':state);
    }
    const timeout=window.setTimeout(()=>setLoadState(state=>state==='loading'?'slow':state),20000);
    return ()=>window.clearTimeout(timeout);
  },[url,attempt]);
  useEffect(()=>{
    const origin=new URL(siteUrl(url),window.location.href).origin;
    function receive(event){
      if(event.origin!==origin||event.source!==frame.current?.contentWindow)return;
      if(event.data?.type!=='karten-code:app-status')return;
      if(event.data.status==='ready')setLoadState('ready');
      else if(event.data.status==='error')setLoadState('error');
    }
    window.addEventListener('message',receive);
    return ()=>window.removeEventListener('message',receive);
  },[url,attempt]);
  useEffect(()=>{
    const element=dialog.current;
    if(expanded){if(element.open)element.close();element.showModal();}
    else {if(element.matches(':modal'))element.close();element.setAttribute('open','');if(wasExpanded.current)expandButton.current?.focus({preventScroll:true});}
    wasExpanded.current=expanded;
    const previous=document.body.style.overflow;
    if(expanded)document.body.style.overflow='hidden';
    return ()=>{document.body.style.overflow=previous;};
  },[expanded]);
  function reload(){setLoadState('loading');setAttempt(value=>value+1);}
  function documentLoaded(){
    // A queued about:blank event must not masquerade as the external document.
    try{if(frame.current?.contentWindow?.location.href==='about:blank')return;}catch{/* Cross-origin document: its location is intentionally inaccessible. */}
    setLoadState(state=>['ready','error'].includes(state)?state:'document');
  }
  const pending=['loading','slow','error'].includes(loadState);
  return <dialog ref={dialog} open={!expanded} className={`map-embed ${expanded?'map-expanded':''}`} data-layout="wide" data-load-state={loadState} aria-modal={expanded?'true':undefined} aria-label={t.application(title)} onCancel={event=>{event.preventDefault();setExpanded(false);}} onKeyDown={event=>{if(expanded&&event.key==='Escape'){event.preventDefault();setExpanded(false);}}}>
    <div className="embed-header"><div><span className="eyebrow">{t.live}</span><strong>{title}</strong></div><div className="embed-actions"><a href={siteUrl(url)} target="_blank" rel="noopener noreferrer">{t.separate} ↗</a><button ref={expandButton} onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>{expanded?t.closeFullscreen+' ×':t.fullscreen+' ⛶'}</button></div></div>
    <div className="embed-stage" aria-busy={loadState==='loading'}>
      <iframe ref={frame} key={`${url}-${attempt}`} src={siteUrl(url)} data-app-src={siteUrl(url)} title={t.map(title)} loading="eager" allow="fullscreen" onLoad={documentLoaded}/>
      {pending&&<div className="embed-status" role="status"><div><strong>{loadState==='loading'?t.appLoading:loadState==='error'?t.appError:t.appSlow}</strong><p>{loadState==='loading'?t.appLoadingHint:t.appRetryHint}</p>{loadState!=='loading'&&<button type="button" onClick={reload}>{t.appReload} ↻</button>}</div></div>}
    </div>
    <div className="embed-caption"><span>{caption}</span><button type="button" className="embed-reload" onClick={reload}>{t.appReload} ↻</button><span>{expanded?t.closeCaption:loadState==='document'?t.appDocumentHint:t.explore}</span></div>
  </dialog>;
}
