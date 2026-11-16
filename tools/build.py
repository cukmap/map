"""cukmap 빌드: data/campuses/<교정>/ · src/ · site/ 를 모아 dist/index.html 한 파일로 만든다.

사용: python3 tools/build.py            → dist/index.html
      python3 tools/build.py --public   → 실내 데이터(공개 보류) 없이 빌드

한 파일로 만드는 이유: 기존 사이트의 「오프라인 HTML」 내려받기를 그대로 유지하기 위해.
"""
import os, sys, json, base64, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC = '--public' in sys.argv
J = lambda *p: os.path.join(ROOT, *p)
rj = lambda *p: json.load(open(J(*p), encoding='utf-8'))
CAMPUS = 'songsim'  # 지금은 성심교정만. 교정이 늘면 교정별로 빌드
D = lambda *p: os.path.join('data', 'campuses', CAMPUS, *p)
MIME = {'jpg': 'image/jpeg', 'png': 'image/png'}
BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
RESTRICTED = {'evidence-0.jpg', 'drawing.jpg'}  # 학교 사진·학교 도면 — 허락 전 공개 보류 (docs/SOURCES.md)

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
    if PUBLIC: return {'buildings': []}, {}
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

def build():
    page = open(J('site', 'index.html'), encoding='utf-8').read()
    ind, rooms = indoor()
    blocks = {'geo': geo(), 'net': network(), 'ext23': rj(D(), 'campus', 'site-edges.json'),
              'props26': rj(D(), 'campus', 'props.json'), 'roof26': roofs(),
              'v10model': rj(D(), 'legacy', 'v10model.json'), 'indoor': ind, 'plan2d': rooms}
    for k, v in blocks.items():
        tag = f'@@JSON:{k}@@'; assert page.count(tag) == 1, tag; page = page.replace(tag, dump(v))
    import re
    for name in set(re.findall(r'@@IMG:([^@]+)@@', page)):
        p = J(D(), 'images', name)
        # 공개 보류 이미지가 없는 저장소에서는 빈 그림으로 대체
        url = data_url(p) if os.path.exists(p) and not (PUBLIC and name in RESTRICTED) else BLANK
        page = page.replace(f'@@IMG:{name}@@', url)
    assert '@@IMG:' not in page and '@@JSON:' not in page
    page = page.replace('@@MAIN@@', main_script())
    os.makedirs(J('dist'), exist_ok=True)
    open(J('dist', 'index.html'), 'w', encoding='utf-8').write(page)
    print('dist/index.html', round(len(page) / 1e6, 2), 'MB', '(공개용: 실내 제외)' if PUBLIC else '')

if __name__ == '__main__':
    build()
