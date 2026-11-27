// cats.cukmap.com 서버 — 「고양이가 되어 츄르 모으기」 한 판 기록과 랭킹.
// 메인 Worker(index.js)가 /api/cats/* 를 이리로 넘긴다. 표는 첫 요청 때 만든다.
//
// 하루에 한 판(오늘의 판): 츄르 자리는 아래 SPOTS 중에서 날짜(한국 시각)로 정해져 모두 같다.
// 한 판 = 제한 시간(R.ROUND_S) 안에 츄르를 최대한 많이. 같은 개수면 마지막 츄르를 먼저 먹은 사람이 앞.
// 기록에는 지나간 길(path)이 붙어 온다. 서버는 그 길로 ① 너무 빠르지 않은지 ② 먹었다는 츄르 자리를 실제로 지나갔는지 확인한다.
// 오늘 1등의 길은 다른 사람 화면에 「고스트 고양이」로 나온다.
// 사람 구분: canvas와 같은 방식(브라우저가 만든 무작위 값 x-cats-id 의 해시). 가입 없음.

const R = {
  ROUND_S: 180,        // 한 판 3분
  PER_DAY: 10,         // 오늘의 츄르 개수
  NEAR: 2.6,           // 이만큼(m) 다가가면 먹음
  MIN_GAP: 30,         // 츄르끼리 최소 거리(m)
  PATH_DT: 0.5,        // 길은 0.5초마다 한 점 [x, y, z]
  MAX_SPEED: 14,       // 두 점 사이 이보다 빠르면(m/s) 기록 거절(달리기 7, 점프·내리막 여유)
  RUNS_PER_DAY: 40,    // 한 사람이 하루에 올릴 수 있는 판 수
  TOP: 20,
  START: [298, 89]    // 시작 자리(정문 앞). 이 근처 40m 안엔 츄르를 두지 않음
};

// 츄르를 둘 수 있는 곳(실제 지도 좌표 x, z). 실내·건물 출입구는 빼고 길·광장·계단·언덕 같은 바깥 장소만
const SPOTS = [
  { id: 'cat-road', name: '고양이길(메이플로드)', hint: '니콜스관 동쪽 아래, 가을이면 단풍이 덮이는 길', at: [106, 140] },
  { id: 'romance', name: '낭만계단', hint: '스머프동산 동쪽 비탈을 오르는 계단', at: [97, -17] },
  { id: 'smurf', name: '스머프동산', hint: '학생미래인재관 앞 동그란 잔디 언덕 꼭대기', at: [37, 10] },
  { id: 'wailing', name: '통곡의 언덕', hint: '다솔관 북쪽 옆 가파른 오르막', at: [-2, 90] },
  { id: 'lib-3way', name: '도서관 앞 삼거리', hint: '중앙도서관 앞, 미카엘관 쪽으로 갈라지는 곳', at: [-72, 0] },
  { id: 'cherry', name: '성심관 벚꽃길', hint: '학교 서쪽 끝, 봄이면 벚꽃 터널', at: [-261, -110] },
  { id: 'gate-slope', name: '정문 오르막', hint: '정문에서 김수환관 쪽으로 오르는 비탈', at: [278, 85] },
  { id: 'dasom', name: '다솜길', hint: '다솔관과 밤비노관 사이 좁은 길', at: [24, 123] },
  { id: 'plaza', name: '예수성심광장', hint: '성당 앞 넓은 광장', at: [133, 166] },
  { id: 'lawn', name: '예수성심 잔디밭', hint: '성당 옆 잔디밭', at: [92, 208] },
  { id: 'maru', name: '안드레아 마루광장', hint: '안드레아관과 마리아관 사이 광장', at: [140, 82] },
  { id: 'mary-hill', name: '성모동산', hint: '스머프동산 옆, 성모상이 있는 작은 동산', at: [43, -3] },
  { id: 'field', name: '야고보 운동장', hint: '학교 남쪽 큰 운동장', at: [-42, -117] },
  { id: 'tennis', name: '테니스장', hint: '콘서트홀 남쪽 테니스장 옆', at: [-218, -165] },
  { id: 'back-gate', name: '후문', hint: '학교 서쪽 후문', at: [-219, 39] },
  { id: 'truth', name: '진리의길', hint: '운동장 위쪽을 가로지르는 큰길', at: [35, -50] },
  { id: 'wisdom', name: '지혜의길', hint: '미카엘관과 다솔관 사이를 잇는 길', at: [-94, 103] },
  { id: 'faith', name: '믿음의길', hint: '니콜스관과 마리아관 사이 길', at: [106, 101] },
  { id: 'raphael', name: '라파엘길', hint: '콘서트홀 아래 남쪽 길', at: [-160, -177] }
];
const SPOT = new Map(SPOTS.map(s => [s.id, s]));

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS ct_runs (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT NOT NULL, uid TEXT NOT NULL, name TEXT NOT NULL, dept TEXT NOT NULL DEFAULT '', score INTEGER NOT NULL, ms INTEGER NOT NULL, at INTEGER NOT NULL, path TEXT NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS ct_runs_day ON ct_runs(day, score DESC, ms ASC)`
];
let ready = false;
async function ensure(db) { if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s))); ready = true; }

function cors(req, env) {
  const o = req.headers.get('origin') || '', BASE = env.BASE_HOST || 'cukmap.com';
  let ok = false; try { const h = new URL(o).hostname; ok = [BASE, 'cukmap.com'].some(d => h === d || h.endsWith('.' + d)) || h === 'cukmap.github.io' || h === 'localhost' || h === '127.0.0.1'; } catch (_) {}
  return ok ? { 'access-control-allow-origin': o, 'access-control-allow-headers': 'content-type, x-cats-id', 'access-control-allow-methods': 'GET, POST, OPTIONS', 'access-control-max-age': '86400', vary: 'origin' } : { vary: 'origin' };
}
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const err = (msg, status = 400) => json({ error: msg }, status);
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32); }
async function uidOf(req, env) { const raw = req.headers.get('x-cats-id') || ''; if (!/^[A-Za-z0-9_-]{20,64}$/.test(raw)) return null; return sha('cats|' + raw + '|' + (env.HASH_SALT || 'cukmap')); }

// 한국 시각 날짜 'YYYY-MM-DD'
const today = now => new Date(now + 9 * 3600e3).toISOString().slice(0, 10);
// 날짜로 정해지는 츄르 자리(모두 같음). 서로 MIN_GAP 이상 떨어지게
function daySpots(day) {
  let s = 0; for (const c of 'cats|' + day) s = (Math.imul(s, 31) + c.charCodeAt(0)) | 0;
  const rnd = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = [...SPOTS]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  const out = []; for (const p of a) { if (out.length >= R.PER_DAY) break; if (Math.hypot(p.at[0] - R.START[0], p.at[1] - R.START[1]) < 40) continue; if (out.every(q => Math.hypot(q.at[0] - p.at[0], q.at[1] - p.at[1]) >= R.MIN_GAP)) out.push(p); }
  return out;
}

async function todayInfo(now) {
  const day = today(now);
  return json({ day, rules: { roundS: R.ROUND_S, near: R.NEAR, pathDt: R.PATH_DT }, spots: daySpots(day).map(s => ({ id: s.id, name: s.name, hint: s.hint, x: s.at[0], z: s.at[1] })) });
}

// 오늘 랭킹: 사람마다 가장 좋은 판 하나(츄르를 하나 이상 먹은 판만). 학과별 합계(사람마다 가장 좋은 점수의 합)
async function board(req, env, url, now) {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(url.searchParams.get('day') || '') ? url.searchParams.get('day') : today(now);
  const best = (await env.DB.prepare(`SELECT id, uid, name, dept, score, ms FROM (SELECT *, ROW_NUMBER() OVER (PARTITION BY uid ORDER BY score DESC, ms ASC, id ASC) AS rn FROM ct_runs WHERE day = ? AND score > 0) WHERE rn = 1 ORDER BY score DESC, ms ASC, id ASC`).bind(day).all()).results;
  const me = await uidOf(req, env);
  const depts = new Map(); for (const r of best) { if (!r.dept) continue; const d = depts.get(r.dept) || { dept: r.dept, total: 0, people: 0 }; d.total += r.score; d.people++; depts.set(r.dept, d); }
  let ghost = null; if (best[0]) { const g = await env.DB.prepare('SELECT name, score, ms, path FROM ct_runs WHERE id = ?').bind(best[0].id).first(); ghost = { name: g.name, score: g.score, ms: g.ms, path: JSON.parse(g.path) }; }
  const myRank = me ? best.findIndex(r => r.uid === me) : -1;
  return json({
    day, players: best.length,
    top: best.slice(0, R.TOP).map((r, i) => ({ rank: i + 1, name: r.name, dept: r.dept, score: r.score, ms: r.ms, me: r.uid === me })),
    me: myRank >= 0 ? { rank: myRank + 1, score: best[myRank].score, ms: best[myRank].ms } : null,
    depts: [...depts.values()].sort((a, b) => b.total - a.total || b.people - a.people).slice(0, 10),
    ghost
  });
}

// 한 판 올리기 { day, name, dept, got:[{id, t(초)}], path:[[x,y,z],…] }
async function addRun(req, env, now) {
  const uid = await uidOf(req, env); if (!uid) return err('브라우저 구분 값이 없어요.', 401);
  let b; try { b = await req.json(); } catch { return err('형식이 맞지 않아요.'); }
  const day = today(now); if (b.day !== day) return err('날짜가 바뀌었어요. 새로고침하고 오늘의 판을 다시 해 주세요.', 409);
  const name = clean(b.name, 12); if (name.length < 1) return err('닉네임을 적어 주세요.');
  const dept = clean(b.dept, 20);
  const path = Array.isArray(b.path) ? b.path : [];
  if (path.length < 2 || path.length > R.ROUND_S / R.PATH_DT + 4 || !path.every(p => Array.isArray(p) && p.length === 3 && p.every(Number.isFinite))) return err('지나간 길이 이상해요.');
  for (let i = 1; i < path.length; i++) if (Math.hypot(path[i][0] - path[i - 1][0], path[i][2] - path[i - 1][2]) / R.PATH_DT > R.MAX_SPEED) return err('너무 빨라요. 기록을 받을 수 없어요.');
  const spots = new Map(daySpots(day).map(s => [s.id, s]));
  const got = Array.isArray(b.got) ? b.got : []; const seen = new Set(); let last = 0;
  for (const g of got) {
    const s = spots.get(g && g.id), t = +(g && g.t); if (!s || seen.has(s.id) || !(t >= 0 && t <= R.ROUND_S + 1)) return err('츄르 기록이 맞지 않아요.');
    // 그 시각 앞뒤의 길이 츄르 근처를 지나야 함(점 사이 0.5초 동안 움직인 만큼 여유)
    const i0 = Math.max(0, Math.floor(t / R.PATH_DT) - 2), i1 = Math.min(path.length - 1, Math.ceil(t / R.PATH_DT) + 2);
    let ok = false; for (let i = i0; i <= i1 && !ok; i++) ok = Math.hypot(path[i][0] - s.at[0], path[i][2] - s.at[1]) < R.NEAR + 8;
    if (!ok) return err('츄르 기록이 맞지 않아요.');
    seen.add(s.id); last = Math.max(last, t);
  }
  await ensure(env.DB);
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM ct_runs WHERE day = ? AND uid = ?').bind(day, uid).first();
  if (n && n.n >= R.RUNS_PER_DAY) return err('오늘은 충분히 했어요. 내일 새 판으로 만나요!', 429);
  const ms = Math.round((seen.size ? last : R.ROUND_S) * 1000);
  const small = path.map(p => p.map(v => Math.round(v * 10) / 10));
  await env.DB.prepare('INSERT INTO ct_runs (day, uid, name, dept, score, ms, at, path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').bind(day, uid, name, dept, seen.size, ms, now, JSON.stringify(small)).run();
  return board(req, env, new URL('http://x/?day=' + day), now);
}

export async function catsApi(request, env, p) {
  const h = cors(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
  let r;
  try {
    const now = Date.now(), url = new URL(request.url);
    if (p === '/api/cats/today' && request.method === 'GET') r = await todayInfo(now);
    else if (p === '/api/cats/board' && request.method === 'GET') { await ensure(env.DB); r = await board(request, env, url, now); }
    else if (p === '/api/cats/run' && request.method === 'POST') r = await addRun(request, env, now);
    else r = err('없는 주소예요.', 404);
  } catch (e) { r = err('서버에서 문제가 생겼어요.', 500); console.error(e); }
  for (const [k, v] of Object.entries(h)) r.headers.set(k, v);
  return r;
}
