const e="840136414",s="stardew-valley-item-finder-v840136414",t=caches.open(s),c=["..","item-finder.js","item-finder.css","items.xslt","items-to-csv.xslt","price-adjustments.xslt","service-worker.js","../assets/gold_star.png","../assets/silver_star.png","../assets/iridium_star.png","../assets/icon.svg","tablesort.js","manifest.webmanifest"];let n=0;const i=864e5;async function a(e){return t.then((s=>fetch(e,{cache:"no-cache"}).then((t=>s.put(e,t)))))}function r(){if(Date.now()-n>864e5){const e=[];for(let s=0;s<c.length;s++)e.push(a(c[s]));return n=Date.now(),Promise.all(e)}return Promise.resolve()}self.addEventListener("install",(function(e){e.t(t.then((e=>e.addAll(c)))),n=Date.now()})),self.addEventListener("fetch",(function(e){e.t(r()),e.i(caches.match(e.request).then((s=>s??fetch(e.request))))})),self.addEventListener("activate",(function(e){e.t((function(){caches.keys().then((e=>e.filter((e=>e!==s)).map((e=>caches.delete(e)))))}))}));
//# sourceMappingURL=service-worker.js.map