/*
 * Stardew Valley Item Finder
 * https://gucci-on-fleek.github.io/Stardew-Valley-Item-Finder/
 * SPDX-License-Identifier: MPL-2.0+
 * SPDX-FileCopyrightText: 2024 Max Chernoff
 */

const version = `
    /*!- $contents := "" -!*/
    /*!- $root := "/tools/Stardew-Valley-Item-Finder/assets/" -!*/
    /*!- range listFiles $root -!*/
        /*!- $contents := cat $contents (readFile (printf "%s%s" $root .)) -!*/
    /*!- end -!*/
    /*!- $contents | sha256sum -!*/
`
const cache_name = `stardew-valley-item-finder-${version}`
const cache = caches.open(cache_name)
const requests = [
    "..",
    "../assets/item-finder.css",
    "../assets/item-finder.js",
    "../assets/items-to-tsv.xslt",
    "../assets/items.xslt",
    "../assets/manifest.webmanifest",
    "../assets/price-adjustments.xslt",
    "../assets/service-worker.js",
    "../images/gold_star.png",
    "../images/icon.svg",
    "../images/iridium_star.png",
    "../images/silver_star.png",
]
let fetched = 0
const threshold = 1000 * 60 * 60 * 24 // 1 day in milliseconds

self.addEventListener("install", function (event) {
    event.waitUntil(cache.then(c => c.addAll(requests)))
    fetched = Date.now()
})

self.addEventListener("fetch", function (event) {
    event.waitUntil(refresh_all())
    event.respondWith(
        caches.match(event.request)
            .then(response => response ?? fetch(event.request)) // Respond with the current cache, or a network request if not present
    )
})

self.addEventListener("activate", function (event) {
    event.waitUntil(function () {
        caches.keys()
            .then(x => x.filter(y => y !== cache_name)
                .map(z => caches.delete(z))) // Delete old caches
    })
})

async function refresh(resource) {
    return cache.then(c => fetch(resource, {cache: "no-cache"})
        .then(x => c.put(resource, x)) // Fetch from the network and store in cache
    )
}

function refresh_all() {
    if (Date.now() - fetched > threshold) { // Update cache if more than `threshold` time has passed
        const promises = []
        for (let i = 0; i < requests.length; i++) {
            promises.push(refresh(requests[i]))
        }
        fetched = Date.now()

        return Promise.all(promises)
    } else {
        return Promise.resolve() // Return an empty promise otherwise
    }
}
