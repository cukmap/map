// cukmap 스피드런 공유 기록 서버 (Cloudflare Pages advanced mode: 이 파일을 사이트 맨 위 폴더에 둠)
// 필요한 설정(한 번만): Cloudflare 대시보드 → Workers & Pages → D1 → 데이터베이스 만들기(이름 자유)
//   → Pages 프로젝트 cukmap → Settings → Bindings → Add → D1 database: 변수 이름 DB, 방금 만든 데이터베이스 선택 → 다시 배포
// 표는 첫 요청 때 자동으로 만들어진다(SQL 콘솔 작업 불필요).
const RUN = 6.5;              // 게임의 달리기 속도(m/s) — game_v27.js와 같아야 함
const MAX_BODY = 600000, MAX_SAMPLES = 15000, TOP = 20;
let ready = false;
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS runs (id INTEGER PRIMARY KEY AUTOINCREMENT, pair TEXT NOT NULL, nick TEXT NOT NULL, t REAL NOT NULL, at INTEGER NOT NULL, len INTEGER, path TEXT NOT NULL, ip TEXT, dev TEXT)`,
  `CREATE INDEX IF NOT EXISTS runs_pair_t ON runs(pair, t)`,
  `CREATE INDEX IF NOT EXISTS runs_ip_at ON runs(ip, at)`,
  `CREATE TABLE IF NOT EXISTS nicks (nick TEXT PRIMARY KEY, dev TEXT NOT NULL, created INTEGER NOT NULL)`
];
async function ensure(db) { if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s))); ready = true; }
const J = (o, st = 200, extra = {}) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra } });
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].slice(0, 12).map(x => x.toString(16).padStart(2, '0')).join(''); }
const PAIR_RE = /^[A-Za-z0-9_:.\-]{1,64}>[A-Za-z0-9_:.\-]{1,64}$/;
function cleanNick(n) { return String(n || '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim(); }

// 궤적 검사: 게임 화면의 '기록 무효' 판정과 같은 기준 + 형식·시간 일관성
function checkPath(path, t, len) {
  if (!Array.isArray(path) || path.length < 2 || path.length > MAX_SAMPLES) return '궤적 형식 오류';
  let prev = null, dist = 0, bad = 0;
  for (const q of path) {
    if (!Array.isArray(q) || q.length < 4 || typeof q[0] !== 'number' || (q[1] !== 'o' && q[1] !== 'i') || !isFinite(q[2]) || !isFinite(q[3])) return '궤적 형식 오류';
    if (Math.abs(q[2]) > 2000 || Math.abs(q[3]) > 2000) return '궤적 좌표 범위 오류';
    if (prev) {
      if (q[0] < prev[0] - 1e-6) return '궤적 시간 순서 오류';
      if (q[1] === prev[1]) {
        const dt = Math.max(.05, q[0] - prev[0]), d = Math.hypot(q[2] - prev[2], q[3] - prev[3]);
        const floorChange = q[1] === 'i' && prev[4] !== q[4];
        if (!floorChange) { dist += d; if (d > RUN * 1.4 * dt + 2) bad++; }
      }
    }
    prev = q;
  }
  if (Math.abs(path[0][0]) > .5) return '궤적 시작 시간 오류';
  if (Math.abs(path[path.length - 1][0] - t) > 1.5) return '기록 시간과 궤적이 맞지 않음';
  if (bad) return `순간이동 구간 ${bad}곳`;
  if (len != null && (len > dist * 1.3 + 60)) return '이동 거리 불일치';
  return null;
}
// 조합별 순위: 한 사람은 가장 빠른 기록 1개만
const BEST_SQL = `SELECT id,pair,nick,t,at,len FROM (SELECT id,pair,nick,t,at,len,ROW_NUMBER() OVER (PARTITION BY pair,nick ORDER BY t,at) rn FROM runs WHERE pair=?1) WHERE rn=1 ORDER BY t,at LIMIT ?2`;

async function api(req, env, url) {
  const db = env.DB;
  if (url.pathname === '/api/health') return J({ ok: true, db: !!db });
  if (!db) return J({ error: 'no_db', message: '서버 데이터베이스(D1)가 연결되지 않았습니다.' }, 503);
  await ensure(db);
  if (req.method === 'GET' && url.pathname === '/api/summary') {
    // 조합별 도전자 수 + 상위 3명, 닉네임별 추천 루트(1위) 보유 수
    const rows = (await db.prepare(`SELECT pair,nick,t,at,len,id FROM (SELECT pair,nick,t,at,len,id,ROW_NUMBER() OVER (PARTITION BY pair,nick ORDER BY t,at) rn FROM runs) WHERE rn=1 ORDER BY pair,t,at`).all()).results || [];
    const pairs = {}; for (const r of rows) { const p = pairs[r.pair] || (pairs[r.pair] = { n: 0, top: [] }); p.n++; if (p.top.length < 3) p.top.push({ id: r.id, nick: r.nick, t: r.t, at: r.at, len: r.len }); }
    const tally = {}; for (const r of rows) { const k = r.nick; (tally[k] = tally[k] || { nick: k, firsts: 0, pairs: 0 }).pairs++; }
    for (const k in pairs) { const b = pairs[k].top[0]; if (b) tally[b.nick].firsts++; }
    const nicks = Object.values(tally).sort((a, b) => b.firsts - a.firsts || b.pairs - a.pairs).slice(0, 20);
    const total = (await db.prepare('SELECT COUNT(*) c FROM runs').first()).c;
    return J({ pairs, nicks, total, now: Date.now() });
  }
  if (req.method === 'GET' && url.pathname === '/api/pair') {
    const k = url.searchParams.get('k') || ''; if (!PAIR_RE.test(k)) return J({ error: 'bad_pair' }, 400);
    const best = (await db.prepare(BEST_SQL).bind(k, TOP).all()).results || [];
    if (!best.length) return J({ pair: k, recs: [] });
    const ids = best.map(r => r.id), ph = ids.map((_, i) => '?' + (i + 1)).join(',');
    const paths = (await db.prepare(`SELECT id,path FROM runs WHERE id IN (${ph})`).bind(...ids).all()).results || [];
    const pm = Object.fromEntries(paths.map(r => [r.id, r.path]));
    return J({ pair: k, recs: best.map(r => ({ ...r, path: JSON.parse(pm[r.id] || '[]') })) });
  }
  if (req.method === 'POST' && url.pathname === '/api/runs') {
    const raw = await req.text(); if (raw.length > MAX_BODY) return J({ error: 'too_big', message: '궤적이 너무 깁니다.' }, 413);
    let b; try { b = JSON.parse(raw) } catch (e) { return J({ error: 'bad_json' }, 400) }
    const nick = cleanNick(b.nick), pair = String(b.pair || ''), t = +b.t, len = b.len == null ? null : Math.round(+b.len), dev = String(b.dev || '');
    if (!PAIR_RE.test(pair)) return J({ error: 'bad_pair', message: '출발·도착 정보가 잘못되었습니다.' }, 400);
    const [s, d] = pair.split('>'); if (s === d) return J({ error: 'bad_pair' }, 400);
    if (nick.length < 2 || nick.length > 12) return J({ error: 'bad_nick', message: '닉네임은 2~12자로 정해 주세요.' }, 400);
    if (/^예시/.test(nick)) return J({ error: 'bad_nick', message: '「예시」로 시작하는 닉네임은 쓸 수 없어요.' }, 400);
    if (!/^[A-Za-z0-9]{16,64}$/.test(dev)) return J({ error: 'bad_dev' }, 400);
    if (!(t >= 3 && t <= 3600)) return J({ error: 'bad_time', message: '기록 시간이 범위를 벗어났습니다.' }, 400);
    const why = checkPath(b.path, t, len); if (why) return J({ error: 'invalid', message: `기록 무효: ${why}` }, 422);
    const ip = await sha((req.headers.get('cf-connecting-ip') || 'local') + '|cukmap'), devh = await sha(dev + '|cukmap'), now = Date.now();
    const recent = (await db.prepare('SELECT COUNT(*) c FROM runs WHERE ip=?1 AND at>?2').bind(ip, now - 10000).first()).c;
    if (recent >= 3) return J({ error: 'rate', message: '잠시 후 다시 등록해 주세요.' }, 429);
    // 닉네임 주인: 처음 그 닉네임으로 등록한 기기만 계속 쓸 수 있음
    const own = await db.prepare('SELECT dev FROM nicks WHERE nick=?1').bind(nick).first();
    if (own && own.dev !== devh) return J({ error: 'nick_taken', message: '이미 다른 사람이 쓰고 있는 닉네임이에요. 다른 닉네임을 정해 주세요.' }, 409);
    const stmts = [];
    if (!own) stmts.push(db.prepare('INSERT OR IGNORE INTO nicks(nick,dev,created) VALUES(?1,?2,?3)').bind(nick, devh, now));
    stmts.push(db.prepare('INSERT INTO runs(pair,nick,t,at,len,path,ip,dev) VALUES(?1,?2,?3,?4,?5,?6,?7,?8)').bind(pair, nick, +t.toFixed(2), now, len, JSON.stringify(b.path), ip, devh));
    await db.batch(stmts);
    const best = (await db.prepare(BEST_SQL).bind(pair, 1000).all()).results || [];
    const rank = best.findIndex(r => r.nick === nick) + 1, mineBest = best[rank - 1];
    return J({ ok: true, rank, personalBest: mineBest && mineBest.at === now, n: best.length });
  }
  return J({ error: 'not_found' }, 404);
}
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname.startsWith('/api/')) {
      try { return await api(req, env, url) } catch (e) { return J({ error: 'server', message: '서버 오류: ' + (e && e.message || e) }, 500) }
    }
    return env.ASSETS.fetch(req);
  }
};
