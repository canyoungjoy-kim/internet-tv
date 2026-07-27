/* 인터넷·TV 장비교체 앱 전용 서비스워커
   scope: /internet-TV/  — 루트 시설일지 앱(sw.js, scope '/')과 캐시가 완전히 분리됩니다. */
const CACHE = 'ittv-v1';
const ASSETS = [
  './',
  './index.html',
  './book.html',
  './manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Firebase / gstatic 등 외부 요청은 캐시하지 않고 그대로 통과 (실시간 동기화 보장)
  if (url.origin !== location.origin) return;
  if (e.request.method !== 'GET') return;

  // 앱 HTML은 네트워크 우선 → 배포 직후 최신본이 바로 반영됨
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return res;
    }))
  );
});
