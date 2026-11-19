// cukmap 메인 Worker
// - 지도 화면(dist/)은 정적 파일로 보낸다(이 코드를 거치지 않음).
// - /indoor.json, /private/* : 비공개 Worker(cukmap-indoor)에서 받아 와 같은 주소로 건넨다.
// - /api/reports : 오류 제보(게스트 가능, 글자만). 내용 검사는 하지 않고, 「부적절해요」 신고가 모이면 자동으로 숨긴다.
//   표는 첫 요청 때 자동으로 만든다.

const CATS = ['building', 'path', 'entrance', 'indoor', 'name', 'other'];
const HIDE_AT = 3;   // "부적절해요" 이만큼 모이면 자동으로 숨김
const FIXED_AT = 2;  // "고쳐졌어요" 이만큼 모이면 해결됨
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS reports (id INTEGER PRIMARY KEY AUTOINCREMENT, created INTEGER NOT NULL, x REAL NOT NULL, z REAL NOT NULL, y REAL, view TEXT, bcode TEXT, bname TEXT, floor TEXT, cat TEXT NOT NULL, text TEXT NOT NULL, nick TEXT, status TEXT NOT NULL DEFAULT 'open', agree INTEGER NOT NULL DEFAULT 0, disagree INTEGER NOT NULL DEFAULT 0, fixed INTEGER NOT NULL DEFAULT 0, flag INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, hide_reason TEXT, who TEXT)`,
  `CREATE INDEX IF NOT EXISTS reports_created ON reports(created)`,
  `CREATE INDEX IF NOT EXISTS reports_who ON reports(who, created)`,
  `CREATE TABLE IF NOT EXISTS report_votes (rid INTEGER NOT NULL, who TEXT NOT NULL, kind TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (rid, who, kind))`,
  `CREATE TABLE IF NOT EXISTS project_visits (name TEXT NOT NULL, day TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (name, day))`,
  `CREATE TABLE IF NOT EXISTS projects_seen (name TEXT PRIMARY KEY, first INTEGER NOT NULL)`
];
let ready = false;
async function ensure(db) { if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s))); ready = true; }

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32); }
// 같은 사람(기기)을 구분하는 익명 값 — IP 원문은 저장하지 않는다
const whoOf = (req, env) => sha((req.headers.get('cf-connecting-ip') || '') + '|' + (env.HASH_SALT || 'cukmap'));
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, n);
const PUB = 'id, created, x, z, y, view, bcode, bname, floor, cat, text, nick, status, agree, disagree, fixed';

async function listReports(env) {
  const r = await env.DB.prepare(`SELECT ${PUB} FROM reports WHERE hidden = 0 ORDER BY created DESC LIMIT 1000`).all();
  return json({ reports: r.results });
}

async function createReport(req, env) {
  let b; try { b = await req.json(); } catch { return json({ error: '잘못된 요청이에요.' }, 400); }
  const x = +b.x, z = +b.z, y = b.y == null ? null : +b.y;
  if (!isFinite(x) || !isFinite(z) || Math.abs(x) > 2000 || Math.abs(z) > 2000) return json({ error: '위치를 지도에서 찍어 주세요.' }, 400);
  const cat = CATS.includes(b.cat) ? b.cat : 'other';
  const text = clean(b.text, 1000), nick = clean(b.nick, 30);
  if (text.length < 3) return json({ error: '내용을 조금 더 적어 주세요.' }, 400);
  const who = await whoOf(req, env), now = Date.now();
  // 사람이 아닌 프로그램의 도배만 막는다(10분에 30건 넘게)
  const recent = await env.DB.prepare('SELECT COUNT(*) AS n FROM reports WHERE who = ? AND created > ?').bind(who, now - 600000).first();
  if (recent && recent.n >= 30) return json({ error: '잠시 후 다시 시도해 주세요.' }, 429);
  const r = await env.DB.prepare(`INSERT INTO reports (created, x, z, y, view, bcode, bname, floor, cat, text, nick, who) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING ${PUB}, hidden`)
    .bind(now, x, z, isFinite(y) ? y : null, clean(b.view, 10), clean(b.bcode, 20), clean(b.bname, 60), clean(b.floor, 10), cat, text, nick, who).first();
  return json({ report: r }, 201);
}

async function vote(req, env, id) {
  let b; try { b = await req.json(); } catch { return json({ error: '잘못된 요청이에요.' }, 400); }
  const kind = b.kind; if (!['agree', 'disagree', 'fixed', 'flag'].includes(kind)) return json({ error: '잘못된 요청이에요.' }, 400);
  const rep = await env.DB.prepare('SELECT id, hidden FROM reports WHERE id = ?').bind(id).first();
  if (!rep || rep.hidden) return json({ error: '없는 제보예요.' }, 404);
  const who = await whoOf(req, env);
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO report_votes (rid, who, kind, at) VALUES (?,?,?,?)').bind(id, who, kind, Date.now()).run();
  if (ins.meta.changes) {
    await env.DB.prepare(`UPDATE reports SET ${kind} = ${kind} + 1 WHERE id = ?`).bind(id).run();
    await env.DB.prepare(`UPDATE reports SET hidden = 1, hide_reason = 'flag' WHERE id = ? AND flag >= ?`).bind(id, HIDE_AT).run();
    await env.DB.prepare(`UPDATE reports SET status = 'fixed' WHERE id = ? AND fixed >= ?`).bind(id, FIXED_AT).run();
  }
  const r = await env.DB.prepare(`SELECT ${PUB}, hidden FROM reports WHERE id = ?`).bind(id).first();
  return json({ report: r, counted: !!ins.meta.changes });
}

// 기여자 목록: GitHub에서 받아 1시간 동안 저장해 두고 건넨다(방문자 브라우저가 GitHub에 직접 묻지 않게)
const REPO = 'cukmap/map';
async function contributors(env, ctx) {
  const cache = caches.default, key = new Request('https://cukmap.internal/contributors-v1');
  const hit = await cache.match(key); if (hit) return hit;
  const h = { 'user-agent': 'cukmap-worker', accept: 'application/vnd.github+json' };
  if (env.GITHUB_TOKEN) h.authorization = 'Bearer ' + env.GITHUB_TOKEN;
  const r = await fetch(`https://api.github.com/repos/${REPO}/contributors?per_page=100`, { headers: h });
  if (!r.ok) return json({ error: '목록을 불러오지 못했어요.' }, 502);
  const list = (await r.json()).filter(u => u.type !== 'Bot').map(u => ({ login: u.login, commits: u.contributions, avatar: u.avatar_url ? u.avatar_url + (u.avatar_url.includes('?') ? '&' : '?') + 's=72' : null }));
  const res = new Response(JSON.stringify({ contributors: list, at: Date.now() }), { headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
  ctx && ctx.waitUntil ? ctx.waitUntil(cache.put(key, res.clone())) : await cache.put(key, res.clone());
  return res;
}
async function stats(env) {
  const r = await env.DB.prepare(`SELECT COUNT(*) AS total, SUM(status = 'fixed') AS fixed, SUM(created > ?) AS month FROM reports WHERE hidden = 0`).bind(Date.now() - 30 * 86400000).first();
  const total = r.total || 0, fixed = r.fixed || 0;
  return json({ total, fixed, open: total - fixed, month: r.month || 0 });
}

// ---------- 하위 주소(이름.cukmap.com): subdomains/*.json 으로 신청된 프로젝트로 연결
const HOSTS = ['.github.io', '.pages.dev', '.workers.dev', '.vercel.app', '.netlify.app'];
let subsCache = null, subsAt = 0;
async function subsList(env) {
  if (subsCache && Date.now() - subsAt < 60000) return subsCache;
  const r = await env.ASSETS.fetch(new Request('https://assets.internal/_subdomains.json'));
  subsCache = r.ok ? await r.json() : { subdomains: {}, pinned: [] }; subsAt = Date.now(); return subsCache;
}
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const page = (title, body, status = 404) => new Response(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head><body style="font-family:system-ui,'Malgun Gothic',sans-serif;max-width:560px;margin:60px auto;padding:0 20px;color:#26392f;line-height:1.7">${body}</body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
async function subdomain(request, env, ctx, name) {
  const { subdomains } = await subsList(env), e = subdomains[name];
  if (!e) return page('등록되지 않은 주소', `<h2>${esc(name)}.cukmap.com 은 아직 등록되지 않았어요</h2><p>cukmap 지도를 활용한 프로젝트라면 누구나 이 주소를 신청할 수 있어요.</p><p><a href="https://github.com/cukmap/map/tree/main/subdomains">하위 주소 신청 방법</a> · <a href="https://cukmap.com/projects/">활용 프로젝트 목록</a></p>`);
  const t = new URL(e.target);
  if (t.protocol !== 'https:' || !HOSTS.some(h => t.hostname.endsWith(h))) return page('연결할 수 없는 주소', '<h2>연결할 수 없는 주소예요</h2>', 502);
  const url = new URL(request.url), up = new URL(t.origin);
  up.pathname = t.pathname.replace(/\/$/, '') + url.pathname; up.search = url.search;
  const h = new Headers(request.headers); h.delete('host');
  const r = await fetch(up.toString(), { method: request.method, headers: h, body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body, redirect: 'manual' });
  const out = new Headers(r.headers); out.set('x-cukmap-project', name);
  const loc = out.get('location');
  if (loc) { try { const L = new URL(loc, up); const pre = t.origin + t.pathname.replace(/\/$/, ''); if ((L.origin + L.pathname).startsWith(pre)) out.set('location', `https://${name}.cukmap.com` + (L.pathname.slice(pre.length - t.origin.length) || '/') + L.search); } catch (_) {} }
  const res = new Response(r.body, { status: r.status, headers: out });
  // 하위 주소는 손대지 않고 그대로 전달한다(표시·꾸밈은 각 프로젝트 몫). 활용 프로젝트 목록의 인기순을 위해 방문 수만 센다
  if ((out.get('content-type') || '').includes('text/html') && request.method === 'GET' && env.DB)
    ctx.waitUntil((async () => { await ensure(env.DB); const day = new Date().toISOString().slice(0, 10);
      await env.DB.prepare('INSERT INTO project_visits (name, day, n) VALUES (?, ?, 1) ON CONFLICT(name, day) DO UPDATE SET n = n + 1').bind(name, day).run(); })().catch(() => {}));
  return res;
}
async function projects(env) {
  const { subdomains, pinned } = await subsList(env), names = Object.keys(subdomains), now = Date.now();
  for (const n of names) await env.DB.prepare('INSERT OR IGNORE INTO projects_seen (name, first) VALUES (?, ?)').bind(n, now).run();
  const since = new Date(now - 7 * 86400000).toISOString().slice(0, 10);
  const v = (await env.DB.prepare('SELECT name, SUM(n) AS n FROM project_visits WHERE day >= ? GROUP BY name').bind(since).all()).results;
  const seen = (await env.DB.prepare('SELECT name, first FROM projects_seen').all()).results;
  const V = Object.fromEntries(v.map(r => [r.name, r.n])), S = Object.fromEntries(seen.map(r => [r.name, r.first]));
  return json({ projects: names.map(n => ({ name: n, url: `https://${n}.cukmap.com/`, ...subdomains[n], target: undefined, visits7: V[n] || 0, since: S[n] || now, pinned: (pinned || []).includes(n) })) });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url), p = url.pathname, BASE = env.BASE_HOST || 'cukmap.com';
    if (url.hostname.endsWith('.' + BASE) && url.hostname !== 'www.' + BASE) return subdomain(request, env, ctx, url.hostname.slice(0, -BASE.length - 1).toLowerCase());
    // 비공개 자료: 실내 묶음(/indoor.json), 학교 도면·사진(/private/*)
    if (p === '/indoor.json' || p.startsWith('/private/')) {
      if (!env.INDOOR) return new Response('indoor not configured', { status: 404 });
      const r = await env.INDOOR.fetch(new Request(new URL(p, 'https://indoor.internal'), request));
      const h = new Headers(r.headers); h.set('cache-control', 'public, max-age=86400, stale-while-revalidate=604800');
      // 진행률 표시용: 압축 전 크기(브라우저가 풀어서 세는 바이트와 같은 기준)
      const len = r.headers.get('content-length'); if (len) h.set('x-cuk-size', len);
      return new Response(r.body, { status: r.status, headers: h });
    }
    if (p === '/api/contributors') { try { return await contributors(env, ctx); } catch (e) { return json({ error: '목록을 불러오지 못했어요.' }, 502); } }
    if (p.startsWith('/api/')) {
      if (!env.DB) return json({ error: '제보 저장소가 연결되지 않았어요.' }, 503);
      try {
        await ensure(env.DB);
        if (p === '/api/reports' && request.method === 'GET') return await listReports(env);
        if (p === '/api/stats') return await stats(env);
        if (p === '/api/projects') return await projects(env);
        if (p === '/api/reports' && request.method === 'POST') return await createReport(request, env);
        const m = p.match(/^\/api\/reports\/(\d+)\/vote$/);
        if (m && request.method === 'POST') return await vote(request, env, +m[1]);
        return json({ error: 'not found' }, 404);
      } catch (e) { return json({ error: '서버 오류가 났어요. 잠시 후 다시 시도해 주세요.' }, 500); }
    }
    // 자료 바로 받기(/data/*): 다른 사이트에서도 불러 쓸 수 있게 허용
    if (p.startsWith('/data/')) { const r = await env.ASSETS.fetch(request); const h = new Headers(r.headers); h.set('access-control-allow-origin', '*'); return new Response(r.body, { status: r.status, headers: h }); }
    return env.ASSETS.fetch(request);
  }
};
