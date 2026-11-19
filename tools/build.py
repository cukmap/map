"""cukmap 빌드: data/campuses/<교정>/ · src/ · site/ 를 모아 한 파일짜리 지도를 만든다.

  python3 tools/build.py              배포용 dist/ (Cloudflare Pages 가 이 명령을 돌린다)
                                      실내 도면·학교 사진은 넣지 않고, 실내는 열 때 따로 받아 온다(site/config.json 의 indoorUrl)
  python3 tools/build.py --offline    dist/index.html 한 파일에 실내까지 모두 넣음(내려받아 쓰는 사본, 실내 자료가 있는 컴퓨터에서만)
  python3 tools/build.py --indoor     dist-indoor/ 실내 묶음(따로 올리는 비공개 저장소용, 실내 자료가 있는 컴퓨터에서만)
"""
import os, sys, json, base64, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFLINE = '--offline' in sys.argv
PUBLIC = not OFFLINE
J = lambda *p: os.path.join(ROOT, *p)
rj = lambda *p: json.load(open(J(*p), encoding='utf-8'))
CAMPUS = 'songsim'  # 지금은 성심교정만. 교정이 늘면 교정별로 빌드
D = lambda *p: os.path.join('data', 'campuses', CAMPUS, *p)
MIME = {'jpg': 'image/jpeg', 'png': 'image/png'}
BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
RESTRICTED = {'evidence-0.jpg', 'drawing.jpg'}  # 학교 사진·학교 도면 — 허락 전 공개 보류, 비공개 저장소 cukmap/indoor 의 private/ 에 보관

def data_url(path):
    return f"data:{MIME[path.rsplit('.', 1)[1]]};base64," + base64.b64encode(open(path, 'rb').read()).decode()

def dump(obj):
    # HTML <script> 안에 넣으므로 </ 를 끊어 둔다
    return json.dumps(obj, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')

def building_dirs():
    return rj(D(), 'buildings', 'order.json')

# ---------- 지도 데이터 묶기 (런타임이 읽는 모양 그대로)
def geo():
    meta = rj(D(), 'campus', 'meta.json'); order = meta.pop('_keyOrder')
    files = {'roads': 'roads', 'surfaces': 'surfaces', 'campus': 'boundary', 'terrain': 'terrain', 'contours': 'contours',
             'cadDetail': 'cad-detail', 'inheritedRoads': 'inherited-roads', 'ngiiDetail': 'ngii-detail', 'pois': 'places',
             'campusInherited': 'boundary-inherited', 'vegetation': 'vegetation'}
    out = {}
    for k in order:
        if k == 'buildings': out[k] = [dict(rj(D(), 'buildings', b, 'building.json'), id=b) for b in building_dirs()]  # id = 폴더 이름(지도 부품에서 건물을 가리킬 때 씀)
        elif k in files: out[k] = rj(D(), 'campus', files[k] + '.json')
        else: out[k] = meta[k]
    return out

def roofs():
    out = {}
    for slug in rj(D(), 'buildings', 'roof-order.json'):
        b = rj(D(), 'buildings', slug, 'building.json'); out[b['code']] = rj(D(), 'buildings', slug, 'roof.json')
    return out

def network():
    m = rj(D(), 'network', 'meta.json')
    return {'version': m['version'], 'meta': m['meta'], 'nodes': rj(D(), 'network', 'nodes.json'), 'edges': rj(D(), 'network', 'edges.json')}

def indoor():
    bs, rooms = [], {}
    for slug in rj(D(), 'indoor-order.json'):
        base = J(D(), 'buildings', slug, 'indoor')
        if not os.path.isdir(base): continue
        m = json.load(open(os.path.join(base, 'indoor.json'), encoding='utf-8')); fl = []
        for fid in m['floors']:
            f = json.load(open(os.path.join(base, fid + '.json'), encoding='utf-8'))
            f['tex'] = data_url(os.path.join(base, f['tex'])); fl.append(f)
            rp = os.path.join(base, fid + '.rooms.png')
            if os.path.exists(rp): rooms.setdefault(m['code'], {})[fid] = data_url(rp)
        d = {k: v for k, v in m.items() if k != 'floors'}
        # 원래 키 순서 유지(floors 는 xlinks 앞)
        keys = list(m.keys()); d = {k: (fl if k == 'floors' else m[k]) for k in keys}; bs.append(d)
    return {'buildings': bs}, rooms

# ---------- 스크립트 묶기
def details():
    parts = []
    for slug in rj(D(), 'details-order.json'):
        p = J(D(), slug, 'details.js') if slug.startswith('places/') else J(D(), 'buildings', slug, 'details.js')
        parts.append(open(p, encoding='utf-8').read().rstrip('\n'))
    return '\n'.join(parts)

def main_script():
    out = []
    for p in sorted(glob.glob(J('src', '*.js'))):
        t = open(p, encoding='utf-8').read().rstrip('\n')
        if '/*@@DETAILS@@*/' in t: t = t.replace('/*@@DETAILS@@*/', details())
        out.append(t)
    return '\n'.join(out).replace('</script', '<\\/script')

# ---------- 자료 바로 받기: 지도 좌표(x 동쪽, z 남쪽, m) → 위도·경도
LAT0, LON0 = 37.4867837, 126.8013923
def ll(x, z): return [round(LAT0 - z / 110950, 7), round(LON0 + x / 88270, 7)]
NOTE = '좌표는 [위도, 경도]. 출처: cukmap.com (국토지리정보원, © OpenStreetMap contributors 포함). 출처 표시만 지키면 자유롭게 쓸 수 있어요.'
def open_data():
    bs = []
    for slug in building_dirs():
        b = rj(D(), 'buildings', slug, 'building.json'); poly = b.get('poly') or []
        if not poly: continue
        cx = sum(p[0] for p in poly) / len(poly); cz = sum(p[1] for p in poly) / len(poly)
        bs.append({'id': slug, 'code': b.get('code'), 'name': b.get('name'), 'floors': b.get('floors'),
                   'basementFloors': b.get('basementFloors'), 'center': ll(cx, cz), 'outline': [ll(x, z) for x, z in poly]})
    places = [{'name': p['name'], 'kind': p.get('kind'), 'at': ll(*p['xy'])} for p in rj(D(), 'campus', 'places.json') if p.get('xy')]
    ents = [{'id': n['id'], 'name': n.get('nm'), 'building': n.get('bn'), 'buildingCode': n.get('b'), 'floor': n.get('fl'), 'at': ll(n['x'], n['z'])}
            for n in rj(D(), 'network', 'nodes.json') if n.get('k') == 'entrance']
    meta = {'campus': 'songsim', 'note': NOTE}
    return {'buildings': {**meta, 'buildings': bs}, 'places': {**meta, 'places': places}, 'entrances': {**meta, 'entrances': ents}}

# 처음 화면: 큰 파일을 받는 동안 빈 화면 대신 진행 상황을 보여 준다(배포본에만)
LOADER = ('<div id="cukload" style="position:fixed;inset:0;z-index:9999;background:#f4f7f3;display:flex;flex-direction:column;align-items:center;'
          'justify-content:center;gap:12px;font-family:system-ui,\'Malgun Gothic\',sans-serif;color:#244f3d;transition:opacity .4s">'
          '<div style="font-size:30px;font-weight:900;letter-spacing:2px">cuk<span style="font-weight:400">map</span></div>'
          '<div id="cukloadmsg" style="font-size:13px;color:#55705c">지도를 불러오는 중이에요…</div>'
          '<div style="width:220px;height:6px;background:#dfe9e1;border-radius:3px;overflow:hidden">'
          '<i id="cukloadbar" style="display:block;height:100%;width:6%;background:#244f3d;border-radius:3px;transition:width .3s"></i></div>'
          '<button id="cukloadskip" style="display:none;margin-top:6px;font:inherit;font-size:12px;color:#244f3d;background:#fff;'
          'border:1px solid #cfdcd2;border-radius:9px;padding:8px 12px;cursor:pointer">실내 지도 없이 먼저 보기</button></div>')

# 실내 묶음을 받은 뒤 지도 코드를 돌린다. 받는 동안 진행률을 보여 주고, 오래 걸리면 「실내 없이 먼저 보기」를 띄운다
BOOT = """<script>(()=>{const L=i=>document.getElementById(i),msg=t=>{const m=L('cukloadmsg');if(m)m.textContent=t},bar=p=>{const b=L('cukloadbar');if(b)b.style.width=Math.max(6,Math.min(100,p))+'%'};
let ran=false;const run=()=>{if(ran)return;ran=true;msg('지도를 그리는 중이에요…');bar(100);setTimeout(()=>{for(const t of document.querySelectorAll('script.cukrun')){const s=document.createElement('script');s.textContent=t.textContent;document.body.appendChild(s)}
 requestAnimationFrame(()=>requestAnimationFrame(()=>{const o=L('cukload');if(o){o.style.opacity=0;setTimeout(()=>o.remove(),450)}}))},30)};
const url=@@URL@@;if(!url){run();return}const ac=new AbortController(),skip=L('cukloadskip');
const st=setTimeout(()=>{if(skip){skip.style.display='block';skip.onclick=()=>{ac.abort();run()}}},6000),hard=setTimeout(()=>ac.abort(),90000);
msg('실내 지도를 받는 중이에요…');bar(10);
fetch(url,{signal:ac.signal}).then(async r=>{if(!r.ok)return null;const tot=+r.headers.get('x-cuk-size')||0,rd=r.body.getReader(),parts=[];let n=0;
 for(;;){const {done,value}=await rd.read();if(done)break;parts.push(value);n+=value.length;const mb=(n/1048576).toFixed(1);if(tot){bar(10+n/tot*85);msg('실내 지도를 받는 중이에요… '+mb+' / '+(tot/1048576).toFixed(1)+' MB')}else{bar(10+85*(1-Math.exp(-n/4e6)));msg('실내 지도를 받는 중이에요… '+mb+' MB')}}
 const buf=new Uint8Array(n);let o=0;for(const p of parts){buf.set(p,o);o+=p.length}return JSON.parse(new TextDecoder().decode(buf))})
 .then(j=>{if(!ran&&j&&j.indoor){L('indoor').textContent=JSON.stringify(j.indoor);L('plan2d').textContent=JSON.stringify(j.plan2d||{})}}).catch(()=>{}).finally(()=>{clearTimeout(st);clearTimeout(hard);run()})})()</script>"""

def build():
    import re, shutil
    page = open(J('site', 'index.html'), encoding='utf-8').read()
    ind, rooms = indoor() if OFFLINE else ({'buildings': []}, {})
    blocks = {'geo': geo(), 'net': network(), 'ext23': rj(D(), 'campus', 'site-edges.json'),
              'props26': rj(D(), 'campus', 'props.json'), 'roof26': roofs(),
              'v10model': rj(D(), 'legacy', 'v10model.json'), 'indoor': ind, 'plan2d': rooms}
    for k, v in blocks.items():
        tag = f'@@JSON:{k}@@'; assert page.count(tag) == 1, tag; page = page.replace(tag, dump(v))
    for name in set(re.findall(r'@@IMG:([^@]+)@@', page)):
        p = J(D(), 'images', name)
        # 공개 보류 이미지는 배포본에 넣지 않고, 비공개 Worker(cukmap-indoor)에서 /private/ 로 받아 온다
        url = (f'/private/{name}' if PUBLIC and name in RESTRICTED else data_url(p) if os.path.exists(p) else BLANK)
        page = page.replace(f'@@IMG:{name}@@', url)
    assert '@@IMG:' not in page and '@@JSON:' not in page
    page = page.replace('@@MAIN@@', main_script())
    os.makedirs(J('dist'), exist_ok=True)
    if PUBLIC:
        # 실내 묶음을 받은 뒤 지도 코드를 돌리도록, 이름 없는 스크립트를 미뤄 둔다
        cfg = rj('site', 'config.json')
        page = re.sub(r'<script>', '<script type="text/plain" class="cukrun">', page)
        page = page.replace('</body>', BOOT.replace('@@URL@@', json.dumps(cfg.get('indoorUrl') or '')) + '</body>')
        page = page.replace('<body>', '<body>' + LOADER, 1)
        for f in ('_headers',):
            if os.path.exists(J('site', f)): shutil.copy(J('site', f), J('dist', f))
    open(J('dist', 'index.html'), 'w', encoding='utf-8').write(page)
    print('dist/index.html', round(len(page) / 1e6, 2), 'MB', '(배포용)' if PUBLIC else '(오프라인 사본: 실내 포함)')
    # Edit 화면(/edit/): 같은 지도 + 오류 제보. 맨 앞 스크립트에서 모드만 바꾼다
    tag = '<script type="text/plain" class="cukrun">' if PUBLIC else '<script>'
    ep = page.replace('<body>', '<body>' + tag + "globalThis.CUK_MODE='edit'</script>", 1)
    ep = ep.replace('<title>cukmap · 성심교정 지도</title>', '<title>cukmap · 지도 오류 제보</title>', 1)
    assert "CUK_MODE='edit'" in ep
    os.makedirs(J('dist', 'edit'), exist_ok=True)
    open(J('dist', 'edit', 'index.html'), 'w', encoding='utf-8').write(ep)
    print('dist/edit/index.html (오류 제보 화면)')
    # 지도 부품(/embed/ + /kit/v1/cukmap.js): 다른 사이트에 넣는 지도
    kp = page.replace('<body>', '<body>' + tag + "globalThis.CUK_MODE='embed'</script>", 1)
    os.makedirs(J('dist', 'embed'), exist_ok=True)
    open(J('dist', 'embed', 'index.html'), 'w', encoding='utf-8').write(kp)
    shutil.copytree(J('site', 'kit'), J('dist', 'kit'), dirs_exist_ok=True)
    print('dist/embed/index.html, dist/kit/v1/cukmap.js (지도 부품)')
    # 하위 주소 목록(/_subdomains.json): Worker가 이름.cukmap.com 을 연결할 때, 프로젝트 목록이 보여 줄 때 씀
    subs = {}
    for p in sorted(glob.glob(J('subdomains', '*.json'))):
        name = os.path.basename(p)[:-5]
        if name.startswith('_'): continue
        j = json.load(open(p, encoding='utf-8'))
        subs[name] = {k: j.get(k) for k in ('target', 'title', 'description', 'team', 'github')}
    pinned = rj('subdomains', '_pinned.json') if os.path.exists(J('subdomains', '_pinned.json')) else []
    open(J('dist', '_subdomains.json'), 'w', encoding='utf-8').write(json.dumps({'subdomains': subs, 'pinned': pinned}, ensure_ascii=False))
    os.makedirs(J('dist', 'projects'), exist_ok=True)
    shutil.copy(J('site', 'projects.html'), J('dist', 'projects', 'index.html'))
    # 자료 바로 받기(/data/v1/*.json): 지도를 그리지 않고 목록·좌표만 필요한 프로젝트용(위도·경도)
    os.makedirs(J('dist', 'data', 'v1'), exist_ok=True)
    for name, obj in open_data().items():
        open(J('dist', 'data', 'v1', name + '.json'), 'w', encoding='utf-8').write(json.dumps(obj, ensure_ascii=False, separators=(',', ':')))
    print('dist/data/v1/ (자료 바로 받기)')
    # 함께 만든 사람들(/contributors/): 지도 없는 가벼운 쪽
    os.makedirs(J('dist', 'contributors'), exist_ok=True)
    shutil.copy(J('site', 'contributors.html'), J('dist', 'contributors', 'index.html'))

def build_indoor():
    ind, rooms = indoor(); assert ind['buildings'], '실내 자료가 없습니다'
    out = J('dist-indoor'); os.makedirs(out, exist_ok=True)
    t = json.dumps({'indoor': ind, 'plan2d': rooms}, ensure_ascii=False, separators=(',', ':'))
    open(os.path.join(out, 'indoor.json'), 'w', encoding='utf-8').write(t)
    open(os.path.join(out, '_headers'), 'w').write('/indoor.json\n  Access-Control-Allow-Origin: *\n  Cache-Control: public, max-age=3600\n')
    open(os.path.join(out, 'index.html'), 'w', encoding='utf-8').write('<!doctype html><meta charset="utf-8"><title>cukmap indoor</title><p>cukmap 실내 지도 데이터</p>')
    print('dist-indoor/indoor.json', round(len(t) / 1e6, 2), 'MB')

if __name__ == '__main__':
    if '--indoor' in sys.argv: build_indoor()
    else:
        # 데이터가 망가졌으면 배포하지 않는다(Cloudflare 빌드에서도 같은 검사)
        import subprocess
        if subprocess.run([sys.executable, J('tools', 'check.py')], stdout=subprocess.DEVNULL).returncode:
            subprocess.run([sys.executable, J('tools', 'check.py')]); sys.exit('자동 검사를 통과하지 못해 지도를 만들지 않았어요.')
        build()
