"""한 번만 쓰는 이전 도구: 예전 방식으로 구운 index.html(단일 파일)을 새 저장소 구조로 분해한다.
사용: python3 tools/migrate_from_built.py <built index.html> <repo root>
"""
import sys, os, re, json, base64
SRC, ROOT = sys.argv[1], sys.argv[2]
s = open(SRC, encoding='utf-8').read()
J = lambda *p: os.path.join(ROOT, *p)
def wjson(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8').write(json.dumps(obj, ensure_ascii=False, indent=1) + '\n')
def wtext(path, t):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'w', encoding='utf-8').write(t)
def wbin(path, b):
    os.makedirs(os.path.dirname(path), exist_ok=True); open(path, 'wb').write(b)
def durl(u):
    m = re.match(r'data:image/([a-z]+);base64,(.*)', u, re.S); return m.group(1), base64.b64decode(m.group(2))
EXT = {'jpeg': 'jpg', 'png': 'png'}

# 건물 코드 → 폴더 이름(영문, 바뀌지 않는 ID)
SLUG = {'I': 'international', 'S': 'kim-tower', 'N': 'nichols', 'M': 'maria', 'H / T': 'michael', '?': 'annex',
        'AD': 'andrea', 'P': 'paul', 'BA': 'bambino', '도서관': 'library', 'V': 'virtus', 'SH': 'seongsim',
        'K': 'kimsuhwan', '-': 'convent', '교회': 'church', 'NP': 'pharmacy', 'BI': 'incubator', 'C': 'concert',
        'B': 'mirae', 'D': 'dasol'}

def jblock(id):
    i = s.find(f'<script id="{id}" type="application/json">'); i = s.find('>', i) + 1
    return json.loads(s[i:s.find('</script>', i)])

# ---------- 1) JSON 데이터
geo = jblock('geo')
order = []
for b in geo['buildings']:
    slug = SLUG[b['code']]; order.append(slug)
    wjson(J('data', 'buildings', slug, 'building.json'), b)
wjson(J('data', 'buildings', 'order.json'), order)
GEOFILE = {'roads': 'roads', 'surfaces': 'surfaces', 'campus': 'boundary', 'terrain': 'terrain', 'contours': 'contours',
           'cadDetail': 'cad-detail', 'inheritedRoads': 'inherited-roads', 'ngiiDetail': 'ngii-detail', 'pois': 'places',
           'campusInherited': 'boundary-inherited', 'vegetation': 'vegetation'}
meta = {}
for k, v in geo.items():
    if k == 'buildings': continue
    if k in GEOFILE: wjson(J('data', 'campus', GEOFILE[k] + '.json'), v)
    else: meta[k] = v
meta['_keyOrder'] = list(geo.keys())
wjson(J('data', 'campus', 'meta.json'), meta)

roof = jblock('roof26')
for code, v in roof.items(): wjson(J('data', 'buildings', SLUG[code], 'roof.json'), v)
wjson(J('data', 'buildings', 'roof-order.json'), [SLUG[c] for c in roof])

net = jblock('net')
wjson(J('data', 'network', 'meta.json'), {'version': net['version'], 'meta': net['meta']})
wjson(J('data', 'network', 'nodes.json'), net['nodes']); wjson(J('data', 'network', 'edges.json'), net['edges'])
wjson(J('data', 'campus', 'site-edges.json'), jblock('ext23'))
wjson(J('data', 'campus', 'props.json'), jblock('props26'))
wjson(J('data', 'legacy', 'v10model.json'), jblock('v10model'))

# 실내(공개 보류 — .gitignore): 건물 폴더/indoor/
ind = jblock('indoor'); p2 = jblock('plan2d'); iorder = []
for d in ind['buildings']:
    slug = SLUG[d['code']]; iorder.append(slug); base = J('data', 'buildings', slug, 'indoor')
    fl = []
    for f in d['floors']:
        ext, b = durl(f['tex']); wbin(os.path.join(base, f"{f['id']}.plan.{EXT[ext]}"), b)
        g = dict(f); g['tex'] = f"{f['id']}.plan.{EXT[ext]}"; wjson(os.path.join(base, f"{f['id']}.json"), g); fl.append(f['id'])
        if d['code'] in p2 and f['id'] in p2[d['code']]:
            ext, b = durl(p2[d['code']][f['id']]); wbin(os.path.join(base, f"{f['id']}.rooms.png"), b)
    m = {k: v for k, v in d.items() if k != 'floors'}; m['floors'] = fl; wjson(os.path.join(base, 'indoor.json'), m)
wjson(J('data', 'indoor-order.json'), iorder)
p2keys = {c: list(v.keys()) for c, v in p2.items()}
assert all(set(p2keys[c]) <= set(f['id'] for f in next(x for x in ind['buildings'] if x['code'] == c)['floors']) for c in p2keys)

# ---------- 2) 이미지(HTML 안 data URI) + 뼈대 HTML
t = s
for m in list(re.finditer(r'<script id="([^"]+)" type="application/json">.*?</script>', t, re.S))[::-1]:
    t = t[:m.start()] + f'<script id="{m.group(1)}" type="application/json">@@JSON:{m.group(1)}@@</script>' + t[m.end():]
i = t.find("(()=>{'use strict';\nconst DATA"); e = t.find('</script>', i); main = t[i:e]; t = t[:i] + '@@MAIN@@' + t[e:]
n = 0
def rimg(m):
    global n
    pre = t[max(0, m.start() - 200):m.start()]; idm = re.findall(r'id="([^"]+)"[^<]*$', pre)
    name = re.sub(r'Texture$', '', idm[-1]) if idm else f'evidence-{n}'
    name = re.sub(r'([a-z])([A-Z])', r'\1-\2', name).lower(); n += 1
    ext, b = durl(m.group(0)); fn = f'{name}.{EXT[ext]}'
    wbin(J('assets', 'images', fn), b); return f'@@IMG:{fn}@@'
t = re.sub(r'data:image/[a-z]+;base64,[A-Za-z0-9+/=]{500,}', rimg, t)
wtext(J('site', 'index.html'), t)

# ---------- 3) 메인 스크립트를 역할별 파일로
L = main.split('\n')
CUT = [(0, '00-start'), (2, '10-terrain-edits'), (44, '11-terrain-contours-boundary'), (55, '20-building-generator'),
       (114, '21-floor-levels'), (125, '22-materials-field-photos'), (147, '23-materials-official-photos'),
       (204, '24-library-roof'), (220, '25-kimsuhwan-stairs'), (267, '26-michael'), (323, '30-details'),
       (697, '40-context-and-legacy'), (724, '50-renderer'), (770, '51-shadows'), (793, '60-routing'),
       (875, '61-controls'), (949, '62-edges-curbs-stairs'), (979, '63-ground-detail'), (1025, '64-esri-optional'),
       (1030, '70-indoor'), (1161, '71-indoor-walk'), (1246, '72-indoor-outdoor-view'), (1290, '73-canopies-gate'),
       (1337, '74-roofs'), (1363, '75-street-props'), (1383, '80-plan2d'), (1497, '99-end')]
DETAIL = [(342, 'nichols'), (344, 'virtus'), (352, 'dasol'), (369, 'dasol'), (389, 'mirae'), (399, 'mirae'),
          (409, 'library'), (417, 'library'), (424, 'seongsim'), (452, 'pharmacy'), (471, 'concert'), (494, 'bambino'),
          (509, 'maria'), (519, 'nichols'), (532, 'kimsuhwan'), (544, 'michael'), (549, 'church'), (559, 'incubator'),
          (564, 'places/smurf-hill'), (571, 'places/wailing-hill'), (576, 'places/cat-road'), (587, 'places/romance-stairs'),
          (595, 'places/cherry-trail'), (609, 'places/stadium'), (631, 'places/library-junction'),
          (636, 'places/main-gate-slope'), (642, 'places/wailing-hill'), (645, 'paul'), (672, 'kimsuhwan'), (695, None)]
for k, (a, nm) in enumerate(CUT):
    b = CUT[k + 1][0] if k + 1 < len(CUT) else len(L)
    if nm == '30-details':
        body = '\n'.join(L[a:342]) + '\n/*@@DETAILS@@*/\n' + '\n'.join(L[695:b])
    else: body = '\n'.join(L[a:b])
    wtext(J('src', nm + '.js'), body + '\n')
det = {}; dorder = []
for k in range(len(DETAIL) - 1):
    a, slug = DETAIL[k]; b = DETAIL[k + 1][0]
    if slug not in det: det[slug] = []; dorder.append(slug)
    det[slug].append('\n'.join(L[a:b]))
for slug, parts in det.items():
    path = J('data', slug, 'details.js') if slug.startswith('places/') else J('data', 'buildings', slug, 'details.js')
    wtext(path, '\n'.join(parts) + '\n')
wjson(J('data', 'details-order.json'), dorder)
print('ok buildings', len(order), 'images', n, 'details', len(dorder))
