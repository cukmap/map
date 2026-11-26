// canvas.cukmap.com 서버 — 벽 그림·소품·날씨·퀴즈·질문을 모두가 같이 보게 저장한다.
// 메인 Worker(index.js)가 /api/canvas/* 를 이리로 넘긴다. 표는 첫 요청 때 만든다.
//
// 사람 구분: 브라우저가 처음 만든 무작위 값(x-canvas-id)을 해시해서 쓴다.
//   학교 와이파이는 여러 사람이 같은 IP를 쓰므로 IP로 나누지 않는다. 가입·비밀번호는 없다.
// 그림: 벽마다 하나의 판을 모두가 같이 쓴다(r/place처럼). 펜을 뗄 때마다 방금 칠한 부분만 잘라 한 장(patch)으로 올리고,
//   다른 사람 화면은 몇 초마다 새 장을 받아 겹친다. 벽 모습 = 그 벽의 patch를 오래된 것부터 겹친 것.
//   덮어쓰기 = 위에 칠하기, 지우기 = mode 'erase' 장(그 모양만큼 원래 벽이 보이게). 모든 장에 시각이 있어 나중에 그 시점 모습을 다시 만들 수 있다.
//   (신고 기능은 서버에 남겨 두지만 화면에서는 쓰지 않는다. 덧칠이 기본 해결책)
// 물감: 시간마다 차오른다(INK_MAX까지). 퀴즈 보상은 INK_MAX를 넘겨 INK_CAP까지 쌓인다.

import { QUIZ } from './canvas-quiz.js';

const R = {
  PPM: 20,               // 도화지 1m = 20px (편집기와 같아야 함)
  INK_MAX: 30,           // 시간이 지나면 여기까지 저절로 찬다(㎡)
  INK_PER_H: 6,          // 한 시간에 차는 양(㎡) → 빈 통이 5시간에 가득
  INK_CAP: 100,          // 퀴즈 보상으로 쌓을 수 있는 최대
  QUIZ_INK: 5, QUIZ_PT: 1,          // 퀴즈 맞히면 바로
  ANSWER_PT: 3,                     // 질문: 다른 사람 답과 맞아 확정되면 나중에
  AGREE_N: 3, AGREE_SHARE: 2 / 3,   // 같은 답이 3명 이상이고 전체의 2/3 이상이면 확정
  HIDE_AT: 3,                       // 「부적절해요」 이만큼이면 숨김
  PATCH_BYTES: 1500000,             // 한 장 최대 크기
  PATCH_PER_MIN: 150,               // 펜을 뗄 때마다 올리므로 넉넉히(프로그램 도배만 막음)
  PRESENCE_MS: 25000,
  VOX_INK: 0.02,                    // 블록 한 칸(놓기·지우기·칠하기)에 드는 물감(㎡) → 30㎡ = 1,500칸
  VOX_PER_REQ: 3000, VOX_PER_MIN: 120,               // 이 안에 신호를 보낸 사람 = 지금 그리는 중
  PROPS: { tree: { name: '크리스마스 트리', cost: 5 }, snowman: { name: '눈사람', cost: 3 }, gift: { name: '선물 상자', cost: 1 }, lamp: { name: '가로등 장식', cost: 2 } },
  PROP_NEAR_M: 4, PROP_NEAR_N: 3,   // 반지름 4m 안에 3개까지
  PROP_PER_USER: 10,
  WEATHER: { clear: '맑음', snow: '눈', rain: '비', night: '밤', sunset: '노을' },
  WEATHER_COST: 10, WEATHER_MS: 3600000   // 10점, 한 시간 동안 아무도 못 바꿈
};

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS cv_users (uid TEXT PRIMARY KEY, name TEXT NOT NULL DEFAULT '', ink REAL NOT NULL, ink_at INTEGER NOT NULL, points INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS cv_patches (id INTEGER PRIMARY KEY AUTOINCREMENT, sheet TEXT NOT NULL, uid TEXT NOT NULL, name TEXT, at INTEGER NOT NULL, x INTEGER NOT NULL, y INTEGER NOT NULL, w INTEGER NOT NULL, h INTEGER NOT NULL, front INTEGER NOT NULL DEFAULT 1, area REAL NOT NULL, img BLOB NOT NULL, flag INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0)`,
  `CREATE INDEX IF NOT EXISTS cv_patches_sheet ON cv_patches(sheet, id)`,
  `CREATE TABLE IF NOT EXISTS cv_flags (kind TEXT NOT NULL, ref INTEGER NOT NULL, uid TEXT NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (kind, ref, uid))`,
  `CREATE TABLE IF NOT EXISTS cv_props (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, name TEXT, type TEXT NOT NULL, x REAL NOT NULL, z REAL NOT NULL, rot REAL NOT NULL DEFAULT 0, at INTEGER NOT NULL, flag INTEGER NOT NULL DEFAULT 0, hidden INTEGER NOT NULL DEFAULT 0, removed INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS cv_weather (id INTEGER PRIMARY KEY CHECK (id = 1), kind TEXT NOT NULL, uid TEXT, name TEXT, at INTEGER NOT NULL, until INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS cv_quiz_done (uid TEXT NOT NULL, qid TEXT NOT NULL, ok INTEGER NOT NULL, at INTEGER NOT NULL, PRIMARY KEY (uid, qid))`,
  `CREATE TABLE IF NOT EXISTS cv_answers (qkey TEXT NOT NULL, uid TEXT NOT NULL, value TEXT NOT NULL, at INTEGER NOT NULL, paid INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (qkey, uid))`,
  `CREATE TABLE IF NOT EXISTS cv_confirmed (qkey TEXT PRIMARY KEY, value TEXT NOT NULL, n INTEGER NOT NULL, at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS cv_feed (id INTEGER PRIMARY KEY AUTOINCREMENT, at INTEGER NOT NULL, text TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS cv_presence (uid TEXT PRIMARY KEY, sheet TEXT, at INTEGER NOT NULL)`,
  // 블록: 한 번에 바꾼 칸들을 한 줄로(cells = [[i,j,k,'#hex'|null],…] JSON). 순서대로 겹치면 지금 모습
  `CREATE TABLE IF NOT EXISTS cv_vox (id INTEGER PRIMARY KEY AUTOINCREMENT, uid TEXT NOT NULL, name TEXT, at INTEGER NOT NULL, n INTEGER NOT NULL, cells TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0)`
];
// 나중에 더한 칸(이미 만들어진 표에도 붙인다. 이미 있으면 오류가 나므로 무시)
const ALTER = [`ALTER TABLE cv_patches ADD COLUMN mode TEXT NOT NULL DEFAULT 'paint'`];
let ready = false;
async function ensure(db) { if (ready) return; await db.batch(SCHEMA.map(s => db.prepare(s))); for (const a of ALTER) { try { await db.prepare(a).run(); } catch (_) {} } ready = true; }

// ---------- 공통
function cors(req, env) {
  const o = req.headers.get('origin') || '', BASE = env.BASE_HOST || 'cukmap.com';
  let ok = false; try { const h = new URL(o).hostname; ok = [BASE, 'cukmap.com'].some(d => h === d || h.endsWith('.' + d)) || h === 'cukmap.github.io' || h === 'localhost' || h === '127.0.0.1'; } catch (_) {}
  return ok ? { 'access-control-allow-origin': o, 'access-control-allow-headers': 'content-type, x-canvas-id, x-canvas-admin', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS', 'access-control-max-age': '86400', vary: 'origin' } : { vary: 'origin' };
}
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const err = (msg, status = 400, extra) => json({ error: msg, ...extra }, status);
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, n);
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('').slice(0, 32); }
async function body(req) { try { return await req.json(); } catch { return null; } }
const nm = u => u.name || '익명';

// 물감은 마지막으로 본 때부터 지난 시간만큼 차 있다(INK_MAX까지만 저절로 참)
function inkNow(u, now) { if (u.ink >= R.INK_MAX) return u.ink; return Math.min(R.INK_MAX, u.ink + (now - u.ink_at) / 3600000 * R.INK_PER_H); }

async function user(req, env, now, create) {
  const raw = req.headers.get('x-canvas-id') || '';
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(raw)) return null;
  const uid = await sha('canvas|' + raw + '|' + (env.HASH_SALT || 'cukmap'));
  let u = await env.DB.prepare('SELECT * FROM cv_users WHERE uid = ?').bind(uid).first();
  if (!u && create) { await env.DB.prepare('INSERT OR IGNORE INTO cv_users (uid, name, ink, ink_at, points, created) VALUES (?, ?, ?, ?, 0, ?)').bind(uid, '', R.INK_MAX, now, now).run(); u = { uid, name: '', ink: R.INK_MAX, ink_at: now, points: 0, created: now }; }
  if (u) u.admin = !!(env.CANVAS_ADMIN && req.headers.get('x-canvas-admin') === env.CANVAS_ADMIN);
  return u;
}
async function setInk(env, u, ink, now) { await env.DB.prepare('UPDATE cv_users SET ink = ?, ink_at = ? WHERE uid = ?').bind(ink, now, u.uid).run(); }
const feed = (env, now, text) => env.DB.prepare('INSERT INTO cv_feed (at, text) VALUES (?, ?)').bind(now, text).run();

// 질문 확정 보상: 확정된 답과 같은 답을 낸 사람에게, 다음에 들어왔을 때 준다
async function payAnswers(env, u) {
  const rows = (await env.DB.prepare(`SELECT a.qkey FROM cv_answers a JOIN cv_confirmed c ON c.qkey = a.qkey AND c.value = a.value WHERE a.uid = ? AND a.paid = 0`).bind(u.uid).all()).results;
  if (!rows.length) return [];
  await env.DB.prepare(`UPDATE cv_answers SET paid = 1 WHERE uid = ? AND paid = 0 AND qkey IN (SELECT qkey FROM cv_confirmed WHERE cv_confirmed.qkey = cv_answers.qkey AND cv_confirmed.value = cv_answers.value)`).bind(u.uid).run();
  const pts = rows.length * R.ANSWER_PT; await env.DB.prepare('UPDATE cv_users SET points = points + ? WHERE uid = ?').bind(pts, u.uid).run(); u.points += pts;
  return rows.map(r => ({ kind: 'answer', qkey: r.qkey, points: R.ANSWER_PT }));
}
const meOut = (u, now, notices) => u && ({ name: u.name, ink: +inkNow(u, now).toFixed(2), points: u.points, admin: u.admin || undefined, notices: notices || [] });

// ---------- 읽기
async function state(req, env, url, now) {
  const since = Math.max(0, +url.searchParams.get('since') || 0), until = +url.searchParams.get('until') || 9e15;
  // until(ms): 그 시각까지의 모습(기록 보기·타임랩스용). 모든 장에 시각이 있어서 어느 순간이든 다시 만들 수 있다
  const patches = (await env.DB.prepare('SELECT id, sheet, name, at, x, y, w, h, front, mode FROM cv_patches WHERE hidden = 0 AND id > ? AND at <= ? ORDER BY id LIMIT 5000').bind(since, until).all()).results;
  const hidden = (await env.DB.prepare('SELECT id FROM cv_patches WHERE hidden > 0').all()).results.map(r => r.id);
  const props = (await env.DB.prepare('SELECT id, name, type, x, z, rot, at FROM cv_props WHERE hidden = 0 AND removed = 0 ORDER BY id').all()).results;
  const w = await env.DB.prepare('SELECT kind, name, at, until FROM cv_weather WHERE id = 1').first();
  const weather = w && w.until > now ? w : { kind: 'clear', name: null, at: 0, until: 0 };
  const recent = (await env.DB.prepare('SELECT at, text FROM cv_feed ORDER BY id DESC LIMIT 20').all()).results;
  const u = await user(req, env, now, false), notices = u ? await payAnswers(env, u) : [];
  const mine = u ? (await env.DB.prepare('SELECT id FROM cv_patches WHERE uid = ?').bind(u.uid).all()).results.map(r => r.id) : [];
  const myProps = u ? (await env.DB.prepare('SELECT id FROM cv_props WHERE uid = ? AND removed = 0').bind(u.uid).all()).results.map(r => r.id) : [];
  const vsince = Math.max(0, +url.searchParams.get('vsince') || 0);
  const vox = (await env.DB.prepare('SELECT id, name, at, cells FROM cv_vox WHERE hidden = 0 AND id > ? AND at <= ? ORDER BY id LIMIT 3000').bind(vsince, until).all()).results.map(r => ({ id: r.id, name: r.name, at: r.at, cells: JSON.parse(r.cells) }));
  const voxHidden = (await env.DB.prepare('SELECT id FROM cv_vox WHERE hidden > 0').all()).results.map(r => r.id);
  const presence = (await env.DB.prepare('SELECT sheet, COUNT(*) AS n FROM cv_presence WHERE at > ? AND sheet IS NOT NULL GROUP BY sheet').bind(now - R.PRESENCE_MS).all()).results;
  return json({ now, patches, hidden, vox, voxHidden, props, weather, feed: recent, presence, me: meOut(u, now, notices), mine, myProps,
    rules: { PPM: R.PPM, INK_MAX: R.INK_MAX, INK_PER_H: R.INK_PER_H, INK_CAP: R.INK_CAP, QUIZ_INK: R.QUIZ_INK, ANSWER_PT: R.ANSWER_PT, PROPS: R.PROPS, WEATHER: R.WEATHER, WEATHER_COST: R.WEATHER_COST, WEATHER_MS: R.WEATHER_MS } });
}
async function patchImg(env, id) {
  const r = await env.DB.prepare('SELECT img, hidden FROM cv_patches WHERE id = ?').bind(id).first();
  if (!r || r.hidden) return new Response('not found', { status: 404 });
  // 한 번 저장된 그림은 바뀌지 않는다. 숨김은 state 목록에서 빠지는 것으로 처리
  return new Response(new Uint8Array(r.img), { headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400' } });
}

// ---------- 쓰기
async function setMe(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const name = clean(b.name, 12); if (!name) return err('닉네임을 정해 주세요.');
  await env.DB.prepare('UPDATE cv_users SET name = ? WHERE uid = ?').bind(name, u.uid).run(); u.name = name;
  return json({ me: meOut(u, now) });
}

function b64(s) { const bin = atob(s); const a = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return a; }
const be32 = (a, o) => (a[o] << 24 | a[o + 1] << 16 | a[o + 2] << 8 | a[o + 3]) >>> 0;
async function addPatch(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const sheet = clean(b.sheet, 80); if (!/^[^\s]{1,80}$/.test(sheet)) return err('벽을 골라 주세요.');
  const x = b.x | 0, y = b.y | 0, w = b.w | 0, h = b.h | 0;
  if (x < 0 || y < 0 || w < 1 || h < 1 || x + w > 4096 || y + h > 4096) return err('그림 크기가 이상해요.');
  let img; try { img = b64(String(b.png || '').replace(/^data:image\/png;base64,/, '')); } catch { return err('그림을 읽지 못했어요.'); }
  if (img.length > R.PATCH_BYTES) return err('그림이 너무 커요. 나눠서 입혀 주세요.', 413);
  // PNG인지, 말한 크기와 같은지만 본다
  if (img.length < 33 || be32(img, 0) !== 0x89504e47 || be32(img, 12) !== 0x49484452 || be32(img, 16) !== w || be32(img, 20) !== h) return err('그림 형식이 이상해요.');
  const maxArea = w * h / (R.PPM * R.PPM), area = Math.min(maxArea, Math.max(0, +b.area || 0));
  if (!(area > 0)) return err('칠한 곳이 없어요.');
  if ((+b.area || 0) > maxArea * 1.02) return err('그림 넓이가 이상해요.');
  const ink = inkNow(u, now);
  if (!u.admin && area > ink + 1e-6) return err(`물감이 ${(area - ink).toFixed(1)}㎡ 모자라요.`, 402, { me: meOut(u, now) });
  // 프로그램 도배만 막는다: 1분에 20장
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM cv_patches WHERE uid = ? AND at > ?').bind(u.uid, now - 60000).first();
  if (n.n >= R.PATCH_PER_MIN) return err('잠시 후 다시 시도해 주세요.', 429);
  const mode = b.mode === 'erase' ? 'erase' : 'paint';
  const r = await env.DB.prepare('INSERT INTO cv_patches (sheet, uid, name, at, x, y, w, h, front, area, img, mode) VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id').bind(sheet, u.uid, nm(u), now, x, y, w, h, b.front === false ? 0 : 1, area, img, mode).first();
  if (!u.admin) { u.ink = ink - area; u.ink_at = now; await setInk(env, u, u.ink, now); }
  if (b.label) await feed(env, now, `${nm(u)} 님이 ${clean(b.label, 40)}에 그림을 입혔어요`);
  return json({ patch: { id: r.id, sheet, name: nm(u), at: now, x, y, w, h, front: b.front === false ? 0 : 1, mode }, me: meOut(u, now) }, 201);
}
// 블록: 놓기·지우기·칠하기 모두 한 칸에 VOX_INK. 남이 만든 것도 바꿀 수 있지만 물감이 천천히 차서 한 번에 다 부수지는 못한다
async function addVox(req, env, now) {
  const b = await body(req); if (!b || !Array.isArray(b.cells)) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  if (!b.cells.length || b.cells.length > R.VOX_PER_REQ) return err('한 번에 바꿀 수 있는 블록 수를 넘었어요.');
  const cells = [];
  for (const q of b.cells) {
    if (!Array.isArray(q) || q.length < 4) return err('블록 값이 이상해요.');
    const [i, j, k] = q.map(v => v | 0), c = q[3];
    if (Math.abs(i) > 8000 || Math.abs(k) > 8000 || j < -800 || j > 3200) return err('지도 밖이에요.');
    if (c !== null && !/^#[0-9a-fA-F]{6}$/.test(c)) return err('색 값이 이상해요.');
    cells.push([i, j, k, c === null ? null : c.toLowerCase()]);
  }
  const cost = cells.length * R.VOX_INK, ink = inkNow(u, now);
  if (!u.admin && cost > ink + 1e-6) return err(`물감이 ${(cost - ink).toFixed(1)}㎡ 모자라요.`, 402, { me: meOut(u, now) });
  const n = await env.DB.prepare('SELECT COUNT(*) AS n FROM cv_vox WHERE uid = ? AND at > ?').bind(u.uid, now - 60000).first();
  if (n.n >= R.VOX_PER_MIN) return err('잠시 후 다시 시도해 주세요.', 429);
  const r = await env.DB.prepare('INSERT INTO cv_vox (uid, name, at, n, cells) VALUES (?,?,?,?,?) RETURNING id').bind(u.uid, nm(u), now, cells.length, JSON.stringify(cells)).first();
  if (!u.admin) { u.ink = ink - cost; u.ink_at = now; await setInk(env, u, u.ink, now); }
  return json({ vox: { id: r.id, name: nm(u), at: now }, me: meOut(u, now) }, 201);
}
async function delVox(req, env, now, id) {
  const u = await user(req, env, now, false); if (!u) return err('기기 값이 없어요.', 401);
  const p = await env.DB.prepare('SELECT n FROM cv_vox WHERE id = ? AND uid = ? AND hidden = 0').bind(id, u.uid).first();
  if (!p) return err('내가 바꾼 것만 되돌릴 수 있어요.', 403);
  await env.DB.prepare('UPDATE cv_vox SET hidden = 2 WHERE id = ?').bind(id).run();
  if (!u.admin) { const ink = Math.min(R.INK_CAP, inkNow(u, now) + p.n * R.VOX_INK); u.ink = ink; u.ink_at = now; await setInk(env, u, ink, now); }
  return json({ ok: true, me: meOut(u, now) });
}
// 되돌리기: 내가 올린 장을 지우고(hidden = 2) 쓴 물감을 돌려준다. 그 위에 남이 칠한 것은 그대로
async function delPatch(req, env, now, id) {
  const u = await user(req, env, now, false); if (!u) return err('기기 값이 없어요.', 401);
  const p = await env.DB.prepare('SELECT area FROM cv_patches WHERE id = ? AND uid = ? AND hidden = 0').bind(id, u.uid).first();
  if (!p) return err('내가 칠한 것만 되돌릴 수 있어요.', 403);
  await env.DB.prepare('UPDATE cv_patches SET hidden = 2 WHERE id = ?').bind(id).run();
  if (!u.admin) { const ink = Math.min(R.INK_CAP, inkNow(u, now) + p.area); u.ink = ink; u.ink_at = now; await setInk(env, u, ink, now); }
  return json({ ok: true, me: meOut(u, now) });
}
// 지금 그리는 중: 편집기를 연 동안 몇 초마다 보낸다(sheet = null 이면 닫음)
async function presence(req, env, now) {
  const b = await body(req) || {};
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const sheet = b.sheet ? clean(b.sheet, 80) : null;
  await env.DB.prepare('INSERT INTO cv_presence (uid, sheet, at) VALUES (?,?,?) ON CONFLICT(uid) DO UPDATE SET sheet = excluded.sheet, at = excluded.at').bind(u.uid, sheet, now).run();
  return json({ ok: true });
}

async function flag(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const kind = b.kind === 'prop' ? 'prop' : b.kind === 'patch' ? 'patch' : null, id = b.id | 0; if (!kind || !id) return err('잘못된 요청이에요.');
  const T = kind === 'prop' ? 'cv_props' : 'cv_patches';
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO cv_flags (kind, ref, uid, at) VALUES (?,?,?,?)').bind(kind, id, u.uid, now).run();
  if (ins.meta.changes) { await env.DB.prepare(`UPDATE ${T} SET flag = flag + 1 WHERE id = ?`).bind(id).run(); await env.DB.prepare(`UPDATE ${T} SET hidden = 1 WHERE id = ? AND flag >= ?`).bind(id, R.HIDE_AT).run(); }
  const r = await env.DB.prepare(`SELECT flag, hidden FROM ${T} WHERE id = ?`).bind(id).first();
  return json({ counted: !!ins.meta.changes, flag: r ? r.flag : 0, hidden: r ? !!r.hidden : false });
}

// 퀴즈: 정답이 있는 문제. 한 번만 풀 수 있고, 맞히면 바로 물감·점수. 틀려도 정답과 설명을 알려 준다
function quizList(u, done) { return QUIZ.map(q => { const d = done.get(q.id); return { id: q.id, q: q.q, options: q.options, at: q.at, look: q.look, done: d != null, ok: d == null ? undefined : !!d, answer: d != null ? q.answer : undefined, why: d != null ? q.why : undefined }; }); }
async function quizzes(req, env, now) {
  const u = await user(req, env, now, false);
  const done = new Map(u ? (await env.DB.prepare('SELECT qid, ok FROM cv_quiz_done WHERE uid = ?').bind(u.uid).all()).results.map(r => [r.qid, r.ok]) : []);
  return json({ quizzes: quizList(u, done), reward: { ink: R.QUIZ_INK, points: R.QUIZ_PT } });
}
async function solve(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const q = QUIZ.find(q => q.id === b.id); if (!q) return err('없는 문제예요.', 404);
  const ok = clean(b.choice, 60) === q.answer ? 1 : 0;
  const ins = await env.DB.prepare('INSERT OR IGNORE INTO cv_quiz_done (uid, qid, ok, at) VALUES (?,?,?,?)').bind(u.uid, q.id, ok, now).run();
  if (!ins.meta.changes) return err('이미 푼 문제예요.', 409);
  if (ok) { const ink = Math.min(R.INK_CAP, inkNow(u, now) + R.QUIZ_INK); u.points += R.QUIZ_PT; await env.DB.prepare('UPDATE cv_users SET ink = ?, ink_at = ?, points = points + ? WHERE uid = ?').bind(ink, now, R.QUIZ_PT, u.uid).run(); u.ink = ink; u.ink_at = now; }
  return json({ ok: !!ok, answer: q.answer, why: q.why, reward: ok ? { ink: R.QUIZ_INK, points: R.QUIZ_PT } : null, me: meOut(u, now) });
}

// 질문: 정답을 아직 모르는 것(지도 확인). 같은 답이 충분히 모이면 확정되고, 맞춘 사람 모두 나중에 점수를 받는다
async function answer(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const qkey = clean(b.qkey, 80), value = clean(b.value, 60);
  if (!/^[\w.:-]{1,80}$/.test(qkey) || !value) return err('잘못된 요청이에요.');
  // 바꾼 답은 다시 셈(확정 전까지). 이미 받은 보상은 그대로
  await env.DB.prepare('INSERT INTO cv_answers (qkey, uid, value, at) VALUES (?,?,?,?) ON CONFLICT(qkey, uid) DO UPDATE SET value = excluded.value, at = excluded.at WHERE cv_answers.paid = 0').bind(qkey, u.uid, value, now).run();
  let c = await env.DB.prepare('SELECT value, n FROM cv_confirmed WHERE qkey = ?').bind(qkey).first();
  if (!c) {
    const rows = (await env.DB.prepare('SELECT value, COUNT(*) AS n FROM cv_answers WHERE qkey = ? GROUP BY value ORDER BY n DESC').bind(qkey).all()).results;
    const total = rows.reduce((s, r) => s + r.n, 0), top = rows[0];
    if (top && top.n >= R.AGREE_N && top.n >= total * R.AGREE_SHARE) {
      await env.DB.prepare('INSERT OR IGNORE INTO cv_confirmed (qkey, value, n, at) VALUES (?,?,?,?)').bind(qkey, top.value, top.n, now).run();
      await feed(env, now, `현장 질문 하나가 ${top.n}명의 답으로 확정됐어요`);
      c = { value: top.value, n: top.n };
    }
  }
  const mineRow = await env.DB.prepare('SELECT COUNT(*) AS n FROM cv_answers WHERE qkey = ?').bind(qkey).first();
  const notices = await payAnswers(env, u);
  // 확정 전에는 다른 사람 답을 알려 주지 않는다(따라 쓰기 방지)
  return json({ status: c ? (c.value === value ? 'confirmed' : 'different') : 'pending', answers: mineRow.n, need: R.AGREE_N, me: meOut(u, now, notices) });
}
async function confirmed(env) { return json({ confirmed: (await env.DB.prepare('SELECT qkey, value, n, at FROM cv_confirmed ORDER BY at DESC').all()).results }); }
async function myAnswers(req, env, now) {
  const u = await user(req, env, now, false); if (!u) return json({ answers: [] });
  return json({ answers: (await env.DB.prepare('SELECT a.qkey, a.value, a.paid, c.value AS confirmed FROM cv_answers a LEFT JOIN cv_confirmed c ON c.qkey = a.qkey WHERE a.uid = ?').bind(u.uid).all()).results });
}

// 소품: 점수로 놓는다. 한곳에 몰리지 않게 가까운 곳 개수를 제한
async function addProp(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  const P = R.PROPS[b.type]; if (!P) return err('없는 소품이에요.');
  const x = +b.x, z = +b.z, rot = +b.rot || 0;
  if (!isFinite(x) || !isFinite(z) || Math.abs(x) > 2000 || Math.abs(z) > 2000) return err('놓을 곳을 골라 주세요.');
  if (!u.admin && u.points < P.cost) return err(`점수가 ${P.cost - u.points}점 모자라요.`, 402, { me: meOut(u, now) });
  const d = R.PROP_NEAR_M, near = await env.DB.prepare('SELECT COUNT(*) AS n FROM cv_props WHERE hidden = 0 AND removed = 0 AND x BETWEEN ? AND ? AND z BETWEEN ? AND ? AND (x-?)*(x-?)+(z-?)*(z-?) < ?').bind(x - d, x + d, z - d, z + d, x, x, z, z, d * d).first();
  if (!u.admin && near.n >= R.PROP_NEAR_N) return err('이 근처엔 소품이 이미 많아요. 조금 떨어진 곳에 놓아 주세요.', 409);
  const mine = await env.DB.prepare('SELECT COUNT(*) AS n FROM cv_props WHERE uid = ? AND removed = 0 AND hidden = 0').bind(u.uid).first();
  if (!u.admin && mine.n >= R.PROP_PER_USER) return err(`소품은 한 사람이 ${R.PROP_PER_USER}개까지 놓을 수 있어요. 하나를 치우고 놓아 주세요.`, 409);
  const r = await env.DB.prepare('INSERT INTO cv_props (uid, name, type, x, z, rot, at) VALUES (?,?,?,?,?,?,?) RETURNING id').bind(u.uid, nm(u), b.type, x, z, rot, now).first();
  if (!u.admin) { await env.DB.prepare('UPDATE cv_users SET points = points - ? WHERE uid = ?').bind(P.cost, u.uid).run(); u.points -= P.cost; }
  await feed(env, now, `${nm(u)} 님이 ${P.name}을(를) 놓았어요`);
  return json({ prop: { id: r.id, name: nm(u), type: b.type, x, z, rot, at: now }, me: meOut(u, now) }, 201);
}
async function delProp(req, env, now, id) {
  const u = await user(req, env, now, false); if (!u) return err('기기 값이 없어요.', 401);
  const r = await env.DB.prepare('UPDATE cv_props SET removed = 1 WHERE id = ? AND (uid = ? OR ?) AND removed = 0').bind(id, u.uid, u.admin ? 1 : 0).run();
  return r.meta.changes ? json({ ok: true }) : err('내가 놓은 소품만 치울 수 있어요.', 403);
}

// 날씨: 모두의 화면이 바뀐다. 한 번 바뀌면 한 시간 동안은 아무도 못 바꾼다
async function setWeather(req, env, now) {
  const b = await body(req); if (!b) return err('잘못된 요청이에요.');
  const u = await user(req, env, now, true); if (!u) return err('기기 값이 없어요.', 401);
  if (!R.WEATHER[b.kind]) return err('없는 날씨예요.');
  const w = await env.DB.prepare('SELECT kind, name, until FROM cv_weather WHERE id = 1').first();
  if (!u.admin && w && w.until > now) return err(`${w.name || '누군가'} 님이 바꾼 날씨가 ${Math.ceil((w.until - now) / 60000)}분 더 이어져요.`, 409, { until: w.until });
  if (!u.admin && u.points < R.WEATHER_COST) return err(`점수가 ${R.WEATHER_COST - u.points}점 모자라요.`, 402, { me: meOut(u, now) });
  const until = now + R.WEATHER_MS;
  await env.DB.prepare('INSERT INTO cv_weather (id, kind, uid, name, at, until) VALUES (1,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, uid = excluded.uid, name = excluded.name, at = excluded.at, until = excluded.until').bind(b.kind, u.uid, nm(u), now, until).run();
  if (!u.admin) { await env.DB.prepare('UPDATE cv_users SET points = points - ? WHERE uid = ?').bind(R.WEATHER_COST, u.uid).run(); u.points -= R.WEATHER_COST; }
  await feed(env, now, `${nm(u)} 님이 날씨를 「${R.WEATHER[b.kind]}」(으)로 바꿨어요`);
  return json({ weather: { kind: b.kind, name: nm(u), at: now, until }, me: meOut(u, now) });
}

// 이름이 남는다: 칠한 넓이·소품·확정된 답 순위
async function ranking(env) {
  const rows = (await env.DB.prepare(`SELECT u.name,
      (SELECT COALESCE(SUM(area),0) FROM cv_patches p WHERE p.uid = u.uid AND p.hidden = 0) AS area,
      (SELECT COUNT(*) FROM cv_props p WHERE p.uid = u.uid AND p.hidden = 0 AND p.removed = 0) AS props,
      (SELECT COUNT(*) FROM cv_answers a JOIN cv_confirmed c ON c.qkey = a.qkey AND c.value = a.value WHERE a.uid = u.uid) AS answers
    FROM cv_users u WHERE u.name != ''`).all()).results;
  const top = k => rows.filter(r => r[k] > 0).sort((a, b) => b[k] - a[k]).slice(0, 10).map(r => ({ name: r.name, n: k === 'area' ? +r.area.toFixed(1) : r[k] }));
  return json({ painters: top('area'), decorators: top('props'), checkers: top('answers') });
}

export async function canvasApi(request, env, p) {
  const H = cors(request, env);
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: H });
  const res = await route(request, env, p);
  for (const [k, v] of Object.entries(H)) res.headers.set(k, v);
  return res;
}
async function route(request, env, p) {
  if (!env.DB) return err('저장소가 연결되지 않았어요.', 503);
  const url = new URL(request.url), now = Date.now(), M = request.method, q = p.slice('/api/canvas'.length);
  try {
    await ensure(env.DB);
    if (q === '/state' && M === 'GET') return await state(request, env, url, now);
    let m = q.match(/^\/patch\/(\d+)\.png$/); if (m && M === 'GET') return await patchImg(env, +m[1]);
    if (q === '/me' && M === 'POST') return await setMe(request, env, now);
    if (q === '/patches' && M === 'POST') return await addPatch(request, env, now);
    m = q.match(/^\/patches\/(\d+)$/); if (m && M === 'DELETE') return await delPatch(request, env, now, +m[1]);
    if (q === '/voxels' && M === 'POST') return await addVox(request, env, now);
    m = q.match(/^\/voxels\/(\d+)$/); if (m && M === 'DELETE') return await delVox(request, env, now, +m[1]);
    if (q === '/presence' && M === 'POST') return await presence(request, env, now);
    if (q === '/flag' && M === 'POST') return await flag(request, env, now);
    if (q === '/quizzes' && M === 'GET') return await quizzes(request, env, now);
    if (q === '/quiz' && M === 'POST') return await solve(request, env, now);
    if (q === '/answer' && M === 'POST') return await answer(request, env, now);
    if (q === '/answers' && M === 'GET') return await myAnswers(request, env, now);
    if (q === '/confirmed' && M === 'GET') return await confirmed(env);
    if (q === '/props' && M === 'POST') return await addProp(request, env, now);
    m = q.match(/^\/props\/(\d+)$/); if (m && M === 'DELETE') return await delProp(request, env, now, +m[1]);
    if (q === '/weather' && M === 'POST') return await setWeather(request, env, now);
    if (q === '/ranking' && M === 'GET') return await ranking(env);
    return err('not found', 404);
  } catch (e) { console.error(e); return err('서버 오류가 났어요. 잠시 후 다시 시도해 주세요.', 500); }
}
