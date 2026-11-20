self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (self.registration.navigationPreload) {
          await self.registration.navigationPreload.disable()
        }
      } catch (_) {}
      await self.clients.claim()
    })(),
  )
})

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") {
    return
  }

  event.respondWith(
    (async () => {
      try {
        const preloadResponse = await event.preloadResponse
        if (preloadResponse) {
          return preloadResponse
        }
      } catch (_) {}

      try {
        return await fetch(event.request)
      } catch (_) {
        return new Response(
          "<!doctype html><html lang=\"ko\"><head><meta charset=\"utf-8\"/><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"/><title>연결 실패</title></head><body style=\"font-family:sans-serif;padding:2rem;\"><h1>서버에 연결할 수 없습니다</h1><p>개발 서버가 재시작 중이거나 중지된 상태일 수 있습니다. 잠시 후 새로고침해 주세요.</p><button onclick=\"location.reload()\">새로고침</button></body></html>",
          {
            status: 503,
            headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
          },
        )
      }
    })(),
  )
})
