const CACHE_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

self.addEventListener("install", e => {
	e.waitUntil(
    // Save basics data (images, javascript...) in cache
		caches.open("account").then(cache => {
			return cache.addAll([
					"/favicon.webp",
					"/sw.js",
					"/manifest.json",
					"/favicon.png",
					"/scaled.png",
					"/"
				])
				.then(() => self.skipWaiting());
		})
	);
});

self.addEventListener("activate", event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.map(cacheName => {
					if (cacheName !== "gravitalia") {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener("fetch", event => {
  // If not HTTP request, don't save it
  if(!event.request.url.startsWith('http')) return;

  // If it is a request API, also save it
  if(event.request.url.startsWith("https://countries.trevorblades.com")) {
    event.respondWith(
      caches.open("gravitalia")
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              // If request in cache, return it
              if (response) {
                // Check if the resource has expired
                const cacheDate = new Date(response.headers.get("date"));
                const currentTime = new Date();
                if (cacheDate && (currentTime - cacheDate) <= CACHE_EXPIRATION_TIME) {
                  return response;
                }
              }

              // Else, save it in cache
              return fetch(event.request)
                .then(networkResponse => {
                  if (networkResponse && networkResponse.status === 200) {
                    // Cache API request
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(error => {
                  console.error(error)
                });
            });
        })
    );
  } else {
    event.respondWith(
      caches.open("gravitalia").then(cache => {
        return cache.match(event.request).then(response => {
          // If the resource is cached and has not expired, return it
          if (response) {
            // Check if the resource has expired
            const cacheDate = new Date(response.headers.get("date"));
            const currentTime = new Date();
            if (cacheDate && (currentTime - cacheDate) <= CACHE_EXPIRATION_TIME) {
              return response;
            }
          }
  
          // Otherwise, retrieve a new version from the network
          return fetch(event.request).then(networkResponse => {
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              // Update the cache with the new version
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
  }
});