const s="848202955",e="stardew-valley-item-finder-v848202955",t=caches.open(e),c=[".","dist/item-finder.js","dist/item-finder.css","dist/items.xslt","dist/items-to-csv.xslt","dist/price-adjustments.xslt","service-worker.js","assets/gold_star.png","assets/silver_star.png","assets/iridium_star.png","assets/icon.svg","dist/tablesort.js","dist/manifest.webmanifest"];let n=0;const r=864e5;async function i(s){return t.then((e=>fetch(s,{cache:"no-cache"}).then((t=>e.put(s,t)))))}function a(){if(Date.now()-n>864e5){const s=[];for(let e=0;e<c.length;e++)s.push(i(c[e]));return n=Date.now(),Promise.all(s)}return Promise.resolve()}self.addEventListener("install",(function(s){s.waitUntil(t.then((s=>s.addAll(c)))),n=Date.now()})),self.addEventListener("fetch",(function(s){s.waitUntil(a()),s.respondWith(caches.match(s.request).then((e=>e??fetch(s.request))))})),self.addEventListener("activate",(function(s){s.waitUntil((function(){caches.keys().then((s=>s.filter((s=>s!==e)).map((s=>caches.delete(s)))))}))}));
//# sourceMappingURL=service-worker.js.map