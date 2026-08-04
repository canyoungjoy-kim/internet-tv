/* 인터넷·TV 장비교체 앱 전용 서비스워커
   scope: /internet-TV/  — 루트 시설일지 앱(sw.js, scope '/')과 캐시가 완전히 분리됩니다. */
const CACHE = 'ittv-v3';   // 이름을 바꾸면 옛 캐시(고정돼 있던 fbconfig.js 포함)가 지워집니다
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

  /* 앱 HTML과 Firebase 접속설정은 네트워크 우선 → 배포 직후 최신본이 바로 반영됨.
     fbconfig.js 를 캐시에 고정해 두면, Firebase 설정을 바꿨을 때 이미 다녀간 기기가
     옛 주소로만 연결을 시도해 "연결에 실패했습니다" 에서 영영 못 빠져나옵니다.
     (입주민은 브라우저 캐시를 직접 지우지 않는 한 고칠 방법이 없습니다) */
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')
      || url.pathname.endsWith('/fbconfig.js')) {
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request).then(r => r
        // 접속설정을 못 받았을 때 HTML 을 대신 내주면 안 되므로 빈 스크립트로 넘깁니다
        || (url.pathname.endsWith('/fbconfig.js')
              ? new Response('', { headers: { 'Content-Type': 'text/javascript' } })
              : caches.match('./index.html'))))
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
