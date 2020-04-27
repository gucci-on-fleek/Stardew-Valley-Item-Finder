'use strict';
/* Stardew Valley Item Finder
 * https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
 * Licensed under MPL 2.0 or greater. See URL for more information.
 */

const version="88668669"
const cache_name = `stardew-valley-item-finder-v${version}`
const cache = caches.open(cache_name)

self.addEventListener('install', function (event) {
  event.waitUntil(cache.then(c => c.addAll([
    '.',
    'index.html',
    'item-finder.min.js',
    'item-finder.min.css',
    'items.min.xslt',
    'items-to-csv.min.xslt',
    'service-worker.min.js',
    'assets/gold_star.png',
    'assets/silver_star.png',
    'assets/iridium_star.png',
    'assets/icon.svg',
    'assets/icon-32.png',
    'libraries/tablesort.min.js'
  ])))
})

self.addEventListener('fetch', function (event) {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)))
})

self.addEventListener('activate', function (event) {
  event.waitUntil(function () {
    caches.keys()
      .then(x =>
        x.filter(y => y !== cache_name)
          .map(z => caches.delete(z)))
  })
})
