const version="82545562"
const cache_name = `stardew-valley-item-finder-v${version}`
const cache = caches.open(cache_name)

self.addEventListener('install', function (event) {
  event.waitUntil(cache.then(c => c.addAll([
    '.',
    'index.html',
    'item-finder.min.js',
    'item-finder.min.css',
    'items.xslt',
    'items-to-csv.xslt',
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
