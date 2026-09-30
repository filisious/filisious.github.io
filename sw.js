/* Increment VERSION when publishing edits. Network first keeps the card current. */
const PREFIX='ak-card-'+self.registration.scope+'-';
const VERSION=PREFIX+'v2';
const ASSETS=['./','./index.html','./styles.css','./config.js','./script.js','./qrcode.js','./favicon.svg','./manifest.webmanifest','./icon-192.png','./icon-512.png','./contact.vcf'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith(PREFIX)&&key!==VERSION).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||url.origin!==location.origin||!url.href.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{const cache=await caches.open(VERSION);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),3500);try{const response=await fetch(event.request,{signal:controller.signal});if(response.ok)await cache.put(event.request,response.clone());return response;}catch{const cached=await cache.match(event.request,{ignoreSearch:true});return cached||(event.request.mode==='navigate'?await cache.match('./index.html'):null)||Response.error();}finally{clearTimeout(timeout);}})());
});
