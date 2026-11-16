// cukmap 메인 Worker: 지도 화면(dist/)을 보내 주고, 실내 데이터는 비공개 Worker(cukmap-indoor)에서 받아 와 같은 주소로 건넨다.
// 앞으로 로그인·오류 제보 API도 여기에 붙는다.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/indoor.json') {
      if (!env.INDOOR) return new Response('indoor not configured', { status: 404 });
      const r = await env.INDOOR.fetch(new Request(new URL('/indoor.json', 'https://indoor.internal'), request));
      const h = new Headers(r.headers); h.set('cache-control', 'public, max-age=3600');
      return new Response(r.body, { status: r.status, headers: h });
    }
    return env.ASSETS.fetch(request);
  }
};
