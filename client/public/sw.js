importScripts("https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js");

if (typeof workbox !== "undefined") {
  console.log("[Monaco Service Worker] Workbox loaded successfully.");

  // Force immediate activation
  workbox.core.skipWaiting();
  workbox.core.clientsClaim();

  // Define precise Monaco Editor core CDN URLs for pre-caching
  const MONACO_VERSION = "0.43.0";
  const MONACO_CDN_BASE = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

  const MONACO_PRECACHE_URLS = [
    `${MONACO_CDN_BASE}/loader.js`,
    `${MONACO_CDN_BASE}/editor/editor.main.nls.js`,
    `${MONACO_CDN_BASE}/editor/editor.main.js`,
    `${MONACO_CDN_BASE}/editor/editor.main.css`,
    `${MONACO_CDN_BASE}/basic-languages/javascript/javascript.js`,
    `${MONACO_CDN_BASE}/basic-languages/typescript/typescript.js`,
    `${MONACO_CDN_BASE}/language/typescript/tsMode.js`,
    `${MONACO_CDN_BASE}/language/typescript/tsWorker.js`,
  ];

  // Precache Monaco assets on Service Worker installation
  self.addEventListener("install", (event) => {
    console.log("[Monaco Service Worker] Pre-caching core Monaco JS/CSS library chunks...");
    event.waitUntil(
      caches.open("monaco-editor-cdn-assets").then((cache) => {
        return Promise.all(
          MONACO_PRECACHE_URLS.map((url) => {
            return fetch(url, { mode: "cors" })
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
                throw new Error(`Failed to fetch Monaco chunk: ${url}`);
              })
              .catch((err) => {
                console.error("[Monaco Service Worker] Pre-cache chunk failed:", err);
              });
          })
        );
      })
    );
  });

  // Intercept and serve Monaco Editor CDN requests using a CacheFirst strategy
  workbox.routing.registerRoute(
    ({ url }) =>
      url.origin === "https://cdn.jsdelivr.net" &&
      url.pathname.includes(`/npm/monaco-editor@${MONACO_VERSION}/min/vs/`),
    new workbox.strategies.CacheFirst({
      cacheName: "monaco-editor-cdn-assets",
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 120,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days Cache Retention
        }),
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Cache Google Font references
  workbox.routing.registerRoute(
    ({ url }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com",
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "google-fonts-cache",
    })
  );
} else {
  console.warn("[Monaco Service Worker] Workbox failed to load. Caching disabled.");
}
