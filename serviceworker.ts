// https://developers.google.com/web/ilt/pwa/introduction-to-service-worker

// @ts-ignore (can't assign FetchEvent type to event otherwise)
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(caches.open('gridpointgb').then(cache =>
    cache.match(event.request).then(response =>
      response ?? fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        return response;
      })
    )
  ));
});
