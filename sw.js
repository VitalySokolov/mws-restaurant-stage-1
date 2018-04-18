const version = 'v1_';

const offlineCache = [
  './',
  'css/',
  'img/',
  'js/'
];

self.addEventListener("install", function(event) {
  event.waitUntil(
      caches
          .open(`${version}restaurant`)
          .then(function(cache) {
            return cache.addAll(offlineCache);
          })
  );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
  );
});
