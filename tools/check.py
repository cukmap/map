"""cukmap 자동 검사: 수정 제안이 지도를 망가뜨리지 않는지 확인한다.

  python3 tools/check.py                 데이터 검사
  python3 tools/check.py --changed a b   (자동 검사용) 바뀐 파일 목록을 받아 「사람 확인 필요」 여부도 알려 줌

결과는 쉬운 말로 출력하고, GitHub에서는 수정 제안 화면의 검사 요약(Summary)에도 적는다.
문제가 있으면 종료 코드 1.
"""
import os, sys, json, glob, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
errors, notes = [], []
LIMIT = 2000  # 좌표 범위(m)
# 사이트 보안·배포를 맡는 파일: 바뀌면 사람이 확인
PROTECTED = ('worker/', 'tools/', 'wrangler.jsonc', 'site/_headers', 'site/config.json', '.github/', 'subdomains/_pinned.json')


def rel(p): return os.path.relpath(p, ROOT)


def load(p):
    try:
        return json.load(open(p, encoding='utf-8'))
    except json.JSONDecodeError as e:
        errors.append(f'`{rel(p)}` {e.lineno}번째 줄 근처의 형식이 맞지 않아요(쉼표나 따옴표를 확인해 주세요). — {e.msg}')
    except Exception as e:
        errors.append(f'`{rel(p)}` 파일을 읽을 수 없어요. — {e}')
    return None


# 화면에 이름표로 그대로 나오는 칸만 검사한다(설명·메모 칸의 `<`, `>`는 괜찮음)
SHOWN = {'name', 'nm', 'bn', 'label', 'title'}


def strings(o, key=None):
    if isinstance(o, str):
        if key in SHOWN: yield o
    elif isinstance(o, dict):
        for k, v in o.items(): yield from strings(v, k)
    elif isinstance(o, list):
        for v in o: yield from strings(v, key)


def num(v): return isinstance(v, (int, float)) and not isinstance(v, bool) and abs(v) < LIMIT


def check_campus(cdir):
    name = os.path.basename(cdir)
    data = {}
    for p in glob.glob(os.path.join(cdir, '**', '*.json'), recursive=True):
        if '/indoor/' in p.replace(os.sep, '/'): continue
        d = load(p)
        if d is None: continue
        data[rel(p)] = d
        # 이름표에 꺾쇠(<, >)가 있으면 화면에서 코드처럼 실행될 수 있어 막는다
        for s in strings(d):
            if '<' in s or '>' in s:
                errors.append(f'`{rel(p)}`의 이름 칸에 `<` 또는 `>`가 있어요: "{s[:40]}" — 이름에는 이 기호를 쓸 수 없어요.'); break
    B = lambda *a: os.path.join(cdir, *a)
    order = data.get(rel(B('buildings', 'order.json')))
    codes = set()
    if order is not None:
        for slug in order:
            bj = data.get(rel(B('buildings', slug, 'building.json')))
            if bj is None:
                errors.append(f'`buildings/order.json`에 있는 `{slug}` 건물 폴더(building.json)가 없어요.'); continue
            for k in ('code', 'name', 'poly'):
                if k not in bj: errors.append(f'`buildings/{slug}/building.json`에 `"{k}"` 항목이 없어요.')
            if bj.get('code') in codes: errors.append(f'건물 코드 `{bj.get("code")}`가 두 번 쓰였어요.')
            codes.add(bj.get('code'))
            if not isinstance(bj.get('name'), str) or not bj.get('name', '').strip(): errors.append(f'`buildings/{slug}/building.json`의 이름(`"name"`)이 비어 있어요.')
            poly = bj.get('poly') or []
            if len(poly) < 3 or not all(isinstance(q, list) and len(q) == 2 and num(q[0]) and num(q[1]) for q in poly):
                errors.append(f'`buildings/{slug}/building.json`의 외곽(`"poly"`)이 올바른 좌표 목록이 아니에요.')
            for i, P in enumerate((bj.get('spec') or {}).get('parts') or []):
                for k in ('wall', 'trim', 'glass', 'roofColor'):
                    v = P.get(k)
                    if v is not None and not ((isinstance(v, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', v)) or (isinstance(v, list) and len(v) == 3 and all(isinstance(c, (int, float)) and 0 <= c <= 1 for c in v))):
                        errors.append(f'`buildings/{slug}/building.json` {i + 1}번째 덩어리의 `"{k}"` 색은 `"#bf755e"` 같은 색상 코드로 적어 주세요.')
                if P.get('win') is not None and P.get('win') not in ('punched', 'ribbon', 'slit', 'none'):
                    errors.append(f'`buildings/{slug}/building.json` {i + 1}번째 덩어리의 창 모양 `"win"`은 punched, ribbon, slit, none 중 하나여야 해요.')
                for k, lo in (('floors', 0), ('height', 0), ('base', -50)):  # base 는 지하로 드러난 덩어리면 음수일 수 있음
                    if P.get(k) is not None and not (isinstance(P[k], (int, float)) and lo <= P[k] < 300):
                        errors.append(f'`buildings/{slug}/building.json` {i + 1}번째 덩어리의 `"{k}"` 값이 숫자가 아니거나 범위를 벗어났어요.')
            for k in ('floors', 'h'):
                if k in bj and bj[k] is not None and not (isinstance(bj[k], (int, float)) and 0 <= bj[k] < 300):
                    errors.append(f'`buildings/{slug}/building.json`의 `"{k}"` 값이 숫자가 아니거나 범위를 벗어났어요.')
    places = data.get(rel(B('campus', 'places.json')))
    if places is not None:
        for i, p in enumerate(places):
            if not isinstance(p.get('name'), str) or not p['name'].strip() or len(p['name']) > 40:
                errors.append(f'`campus/places.json` {i + 1}번째 장소의 이름이 비었거나 너무 길어요(40자까지).')
            xy = p.get('xy')
            if not (isinstance(xy, list) and len(xy) == 2 and num(xy[0]) and num(xy[1])):
                errors.append(f'`campus/places.json` "{p.get("name")}"의 위치(`"xy"`)는 `[x, z]` 숫자 두 개여야 해요.')
    nodes, edges = data.get(rel(B('network', 'nodes.json'))), data.get(rel(B('network', 'edges.json')))
    if nodes is not None:
        ids = set()
        for i, n in enumerate(nodes):
            if n.get('id') in ids: errors.append(f'`network/nodes.json`에 같은 id `{n.get("id")}`가 두 번 있어요.')
            ids.add(n.get('id'))
            if not (num(n.get('x')) and num(n.get('z'))): errors.append(f'`network/nodes.json`의 `{n.get("id")}` 좌표(`"x"`, `"z"`)가 숫자가 아니거나 범위를 벗어났어요.')
            if n.get('k') == 'entrance' and n.get('nm') is not None and len(str(n.get('nm'))) > 60:
                errors.append(f'`network/nodes.json`의 `{n.get("id")}` 출입구 이름이 너무 길어요(60자까지).')
        if edges is not None:
            for e in edges:
                if not (isinstance(e.get('a'), int) and isinstance(e.get('b'), int) and 0 <= e['a'] < len(nodes) and 0 <= e['b'] < len(nodes)):
                    errors.append(f'`network/edges.json`의 `{e.get("id")}`가 없는 점을 잇고 있어요.')
    dorder = data.get(rel(B('details-order.json')))
    if dorder is not None:
        for slug in dorder:
            p = B(slug, 'details.js') if slug.startswith('places/') else B('buildings', slug, 'details.js')
            if not os.path.exists(p): errors.append(f'`details-order.json`의 `{slug}` 장식 파일이 없어요.')
    return name, len(order or []), len(nodes or [])


# ---------- 하위 주소(이름.cukmap.com) 신청 파일
RESERVED = {'www', 'api', 'edit', 'embed', 'kit', 'map', 'maps', 'cukmap', 'admin', 'mail', 'email', 'smtp', 'ftp', 'ns', 'ns1', 'ns2',
            'indoor', 'private', 'projects', 'contributors', 'static', 'cdn', 'assets', 'login', 'auth', 'account', 'help', 'support',
            'catholic', 'cuk', 'official', 'school', 'test', 'dev', 'staging', 'preview', 'status', 'docs', 'blog'}
HOSTS = ('.github.io', '.pages.dev', '.workers.dev', '.vercel.app', '.netlify.app')
def check_subdomains(changed):
    import subprocess
    d = os.path.join(ROOT, 'subdomains'); n = 0
    if not os.path.isdir(d): return 0
    base, author = os.environ.get('BASE_SHA'), (os.environ.get('PR_AUTHOR') or '').lower()
    for p in sorted(glob.glob(os.path.join(d, '*.json'))):
        name = os.path.basename(p)[:-5]
        if name.startswith('_'): continue
        n += 1; f = f'`subdomains/{name}.json`'
        if not re.fullmatch(r'[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])', name): errors.append(f'{f}: 파일 이름은 영문 소문자·숫자·`-`로 2~30자여야 해요.'); continue
        if name in RESERVED: errors.append(f'{f}: `{name}`은 cukmap이 쓰는 이름이라 신청할 수 없어요.'); continue
        j = load(p)
        if j is None: continue
        if not isinstance(j, dict): errors.append(f'{f}: 파일 모양이 맞지 않아요(subdomains/README.md 참고).'); continue
        from urllib.parse import urlparse
        u = urlparse(str(j.get('target', '')))
        if u.scheme != 'https' or not u.hostname or not u.hostname.endswith(HOSTS) or u.username or u.port:
            errors.append(f'{f}: `target`은 https:// 로 시작하는 github.io, pages.dev, workers.dev, vercel.app, netlify.app 주소여야 해요.')
        for k, lim in (('title', 40), ('description', 200), ('team', 60)):
            v = j.get(k)
            if not isinstance(v, str) or not v.strip(): errors.append(f'{f}: `{k}`을 적어 주세요.')
            elif len(v) > lim: errors.append(f'{f}: `{k}`은 {lim}자까지예요.')
            elif '<' in v or '>' in v: errors.append(f'{f}: `{k}`에 `<`, `>`는 쓸 수 없어요.')
        gh = str(j.get('github', ''))
        if not re.fullmatch(r'[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})', gh): errors.append(f'{f}: `github`에 GitHub 아이디를 적어 주세요.')
        rel_p = f'subdomains/{name}.json'
        # 수정 제안에서: 새 신청은 제안한 사람 아이디로, 이미 있는 주소는 그 주인만 고칠 수 있게
        if author and base and rel_p in changed:
            old = subprocess.run(['git', 'show', f'{base}:{rel_p}'], cwd=ROOT, capture_output=True, text=True)
            if old.returncode == 0:
                try: owner = str(json.loads(old.stdout).get('github', '')).lower()
                except Exception: owner = ''
                if owner and owner != author: errors.append(f'{f}: 이 주소는 `{owner}`님이 신청한 주소라 다른 사람이 고칠 수 없어요.')
            elif gh.lower() != author: errors.append(f'{f}: `github`에는 신청하는 사람(`{author}`)의 아이디를 적어 주세요.')
    for c in changed:  # 지워진 신청 파일: 주인만
        if c.startswith('subdomains/') and c.endswith('.json') and not os.path.exists(os.path.join(ROOT, c)) and author and base:
            old = subprocess.run(['git', 'show', f'{base}:{c}'], cwd=ROOT, capture_output=True, text=True)
            try: owner = str(json.loads(old.stdout).get('github', '')).lower()
            except Exception: owner = ''
            if owner and owner != author: errors.append(f'`{c}`: 이 주소는 `{owner}`님이 신청한 주소라 다른 사람이 지울 수 없어요.')
    return n


def main():
    summary = []
    for cdir in sorted(glob.glob(os.path.join(ROOT, 'data', 'campuses', '*'))):
        if os.path.isdir(cdir):
            n, nb, nn = check_campus(cdir)
            summary.append(f'{n}: 건물 {nb}개, 보행망 점 {nn}개')
    changed = sys.argv[sys.argv.index('--changed') + 1:] if '--changed' in sys.argv else []
    summary.append(f'하위 주소 신청: {check_subdomains(changed)}개')
    prot = [c for c in changed if c.startswith(PROTECTED)]
    code = [c for c in changed if (c.startswith('src/') or c.endswith('.js') or c.startswith('site/')) and c not in prot]
    data = [c for c in changed if c.startswith('data/') and c.endswith('.json')]
    lines = ['## cukmap 자동 검사', '']
    if errors:
        lines += ['**❌ 고칠 곳이 있어요.** 아래를 고친 뒤 다시 저장하면 검사가 다시 돌아요.', ''] + [f'- {e}' for e in errors]
    else:
        lines += ['**✅ 데이터 검사 통과**', ''] + [f'- {s}' for s in summary]
    if changed:
        lines += ['', '### 바뀐 파일', ''] + [f'- `{c}`' for c in changed]
        if prot: lines += ['', '**사람 확인 필요**: 사이트 보안·배포 파일이 바뀌었어요. 코드를 아는 참여자가 확인한 뒤 합쳐 주세요.']
        elif code: lines += ['', '**사람 확인 필요**: 지도 코드나 장식이 바뀌었어요. 미리보기로 화면을 확인한 뒤 합쳐 주세요.']
        elif data: lines += ['', '값(데이터)만 바뀌었어요. 미리보기로 지도에서 잘 보이는지 확인해 주세요.']
        elif any(c.startswith('subdomains/') for c in changed): lines += ['', '하위 주소 신청이에요. 검사를 통과하면 합쳐도 돼요.']
    out = '\n'.join(lines)
    print(out)
    sp = os.environ.get('GITHUB_STEP_SUMMARY')
    if sp: open(sp, 'a', encoding='utf-8').write(out + '\n')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
