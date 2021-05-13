const version="837878168";const cache_name=`stardew-valley-item-finder-v${version}`;const cache=caches.open(cache_name);const requests=[".","dist/item-finder.js","dist/item-finder.css","dist/items.xslt","dist/items-to-csv.xslt","dist/price-adjustments.xslt","dist/service-worker.js","assets/gold_star.png","assets/silver_star.png","assets/iridium_star.png","assets/icon.svg","libraries/tablesort.min.js","dist/manifest.webmanifest"];let fetched=0;const threshold=1e3*60*60*24;self.addEventListener("install",(function(event){event.waitUntil(cache.then((c=>c.addAll(requests))));fetched=Date.now()}));self.addEventListener("fetch",(function(event){event.waitUntil(refresh_all());event.respondWith(caches.match(event.request).then((response=>response??fetch(event.request))))}));self.addEventListener("activate",(function(event){event.waitUntil((function(){caches.keys().then((x=>x.filter((y=>y!==cache_name)).map((z=>caches.delete(z)))))}))}));async function refresh(resource){return cache.then((c=>fetch(resource,{cache:"no-cache"}).then((x=>c.put(resource,x)))))}function refresh_all(){if(Date.now()-fetched>threshold){const promises=[];for(let i=0;i<requests.length;i++){promises.push(refresh(requests[i]))}fetched=Date.now();return Promise.all(promises)}else{return Promise.resolve()}}
//# sourceMappingURL=dist/service-worker.js.map