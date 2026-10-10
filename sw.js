import { rangeResponse } from './range-response.js';
const CACHE='lectura-shell-3934750d32cf';
const SHELL=["./","index.html","vendor/pdf_viewer.css","vendor/pdf.min.js","vendor/jszip.min.js","vendor/mammoth.min.js","vendor/marked.js","vendor/purify.min.js","manifest.webmanifest","icon.svg","assets/index-CxaLCdpd.js","assets/index-BfJBO8kj.css","vendor/pdf.worker.min.js","icon-192.png","icon-512.png","range-response.js","books/library.json"];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('lectura-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  // HF models and voice styles own their caches; never duplicate them in the shell cache.
  if(event.request.method!=='GET' || url.origin!==self.location.origin || !url.pathname.startsWith(new URL(self.registration.scope).pathname))return;
  if(url.pathname.endsWith('/sw.js'))return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.open(CACHE).then(cache=>cache.match('index.html'))));return;
  }
  const isBook=url.pathname.includes('/books/')&&!url.pathname.endsWith('/books/library.json');
  if(isBook){event.respondWith(caches.open('lectura-books').then(async cache=>{
    const cached=await cache.match(event.request.url);if(cached)return rangeResponse(cached,event.request.headers.get('Range'));
    return fetch(event.request);
  }));return;}
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request);if(cached)return cached;
    const response=await fetch(event.request);if(response.ok && response.status===200)await cache.put(event.request,response.clone());return response;
  }));
});
