// via: https://developers.google.com/web/ilt/pwa/introduction-to-service-worker

// @ts-ignore (can't assign FetchEvent type to event otherwise)
self.addEventListener('fetch', function (event) {
    event.respondWith(caches.open('gridpointgb').then(function (cache) {
        return cache.match(event.request).then(function (response) {
            return response !== null && response !== void 0 ? response : fetch(event.request).then(function (response) {
                cache.put(event.request, response.clone());
                return response;
            });
        });
    }));
});
