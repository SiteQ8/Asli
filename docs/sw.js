/*
  Asli service worker.

  Someone checking a suspicious message is often on a weak connection, or on a
  phone with no data left, or standing in a shop being rushed. The check has to
  work anyway, so the whole thing is kept on the device after the first visit.

  Three rules:

    pages and code   cache first, refreshed in the background
    data files       network first, falling back to the copy already held
    anything else    left alone, including the fonts

  The data rule matters. A registry that is a day old is still right about which
  domains belong to the Ministry of Interior, and a stale answer beats no answer
  when someone is deciding whether to pay.
*/
const VERSION = "asli-v0.5.1";
const SHELL = VERSION + "-shell";
const DATA = VERSION + "-data";

const PRECACHE = [
  "./",
  "index.html",
  "check.html",
  "report.html",
  "help.html",
  "style.css",
  "check.css",
  "content.js",
  "engine.js",
  "seal.js",
  "app.js",
  "checker.js",
  "check.js",
  "report.js",
  "help.js",
  "redact.js",
  "favicon.svg",
  "manifest.webmanifest",
  "data/registry.json",
  "data/feed.json",
  "data/meta.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isData(url) {
  return url.pathname.includes("/data/");
}

async function networkFirst(request) {
  const cache = await caches.open(DATA);
  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (error) {
    const held = await cache.match(request) || await caches.match(request);
    if (held) return held;
    throw error;
  }
}

async function cacheFirst(request) {
  const held = await caches.match(request);
  if (held) {
    /* Refresh quietly for next time, and never fail the page over it. */
    fetch(request)
      .then((fresh) => fresh && fresh.ok && caches.open(SHELL).then((cache) => cache.put(request, fresh)))
      .catch(() => {});
    return held;
  }
  const fresh = await fetch(request);
  if (fresh && fresh.ok && new URL(request.url).origin === self.location.origin) {
    const cache = await caches.open(SHELL);
    cache.put(request, fresh.clone());
  }
  return fresh;
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isData(url)) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      cacheFirst(request).catch(() => caches.match("check.html") || caches.match("index.html"))
    );
    return;
  }

  event.respondWith(cacheFirst(request).catch(() => caches.match(request)));
});
