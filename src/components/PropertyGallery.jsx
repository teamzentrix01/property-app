"use client";
import { useEffect, useState } from "react";

export default function PropertyGallery({ photos = [], title }) {
  const [active,setActive]=useState(null);
  useEffect(()=>{const close=e=>e.key==="Escape"&&setActive(null);window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);
  if(!photos.length)return <div className="grid h-72 place-items-center rounded-3xl bg-paper-dim text-sm text-ink-soft md:h-[460px]">No property photos available</div>;
  const count=photos.length;
  return <><div className={`relative grid overflow-hidden rounded-3xl bg-paper-dim ${count===1?"grid-cols-1":count===2?"grid-cols-[1.35fr_1fr] gap-1":"grid-cols-2 gap-1"}`}>
    <button type="button" onClick={()=>setActive(0)} className={`${count===1?"h-[360px] md:h-[520px]":count===2?"h-[360px] md:h-[500px]":"row-span-2 h-[360px] md:h-[500px]"} overflow-hidden bg-paper-dim text-left`}><img src={photos[0].url} alt={title} className="h-full w-full object-cover transition duration-500 hover:scale-[1.02]"/></button>
    {count===2&&<button type="button" onClick={()=>setActive(1)} className="h-[360px] overflow-hidden md:h-[500px]"><img src={photos[1].url} alt={`${title} photo 2`} className="h-full w-full object-cover"/></button>}
    {count>=3&&photos.slice(1,3).map((p,i)=><button type="button" key={p.id||p.url} onClick={()=>setActive(i+1)} className="hidden h-[248px] overflow-hidden md:block"><img src={p.url} alt={`${title} photo ${i+2}`} className="h-full w-full object-cover"/></button>)}
    <button type="button" onClick={()=>setActive(0)} className="absolute bottom-4 right-4 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-ink shadow-lg">▧ View all {count} photo{count!==1?"s":""}</button>
  </div>{active!==null&&<div className="fixed inset-0 z-[80] flex flex-col bg-black/95" role="dialog" aria-modal="true"><div className="flex items-center justify-between p-4 text-white"><p className="text-sm">{active+1} / {count}</p><button type="button" onClick={()=>setActive(null)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-2xl">×</button></div><div className="relative flex flex-1 items-center justify-center overflow-hidden p-4"><img src={photos[active].url} alt={`${title} fullscreen`} className="max-h-full max-w-full object-contain"/>{count>1&&<><button type="button" onClick={()=>setActive((active-1+count)%count)} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white">‹</button><button type="button" onClick={()=>setActive((active+1)%count)} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-2xl text-white">›</button></>}</div></div>}</>;
}
