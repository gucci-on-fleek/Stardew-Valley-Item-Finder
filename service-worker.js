var cache_name = 'stardew-valley-item-finder-v0.5'
var cache = caches.open(cache_name)

self.addEventListener('install', function (event) {
  event.waitUntil(cache.then(c => c.addAll([
    '/',
    'index.html',
    'item-finder.js',
    'item-finder.css',
    'items.xslt',
    'items-to-csv.xslt',
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