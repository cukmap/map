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
        if k == 'buildings': out[k] = [rj(D(), 'buildings', b, 'building.json') for b in building_dirs()]
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

BOOT = """<script>(()=>{const run=()=>{for(const t of document.querySelectorAll('script.cukrun')){const s=document.createElement('script');s.textContent=t.textContent;document.body.appendChild(s)}};
const url=%s;if(!url){run();return}const ac=new AbortController(),to=setTimeout(()=>ac.abort(),20000);
fetch(url,{signal:ac.signal}).then(r=>r.ok?r.json():null).then(j=>{if(j&&j.indoor){document.getElementById('indoor').textContent=JSON.stringify(j.indoor);document.getElementById('plan2d').textContent=JSON.stringify(j.plan2d||{})}}).catch(()=>{}).finally(()=>{clearTimeout(to);run()})})()</script>"""

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
        page = page.replace('</body>', BOOT % json.dumps(cfg.get('indoorUrl') or '') + '</body>')
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
