"""canvas.cukmap.com 퀴즈(정답이 있는 문제) 만들기 → worker/canvas-quiz.js
정답은 확인된 자료로만 만든다. 지금은 두 가지만:
  1) 강의실 번호 앞글자 → 건물 (학교 공식 건물 기호)
  2) 가장 가까운 건물 (건물 위치는 지도에서 가장 믿을 만한 값)
층수·출입구처럼 아직 확인이 덜 된 값은 퀴즈로 내지 않는다(현장 질문으로 먼저 확정).
"""
import json, math, random
B = json.load(open('dist/data/v1/buildings.json'))['buildings']
X = lambda lon: (lon - 126.8013923) * 88270
Z = lambda lat: (37.4867837 - lat) * 110950
short = lambda n: n.split(' · ')[0].split('(')[0].strip()
rng = random.Random(7)
coded = [b for b in B if b.get('code') and b['code'].isascii() and b['code'].isalpha() and '/' not in b['code'] and b['id'] not in ('kim-tower', 'andrea')]
Q = []
for b in coded:
    wrong = rng.sample([short(o['name']) for o in coded if o is not b], 3)
    opts = wrong + [short(b['name'])]; rng.shuffle(opts)
    c = b['center']
    Q.append({'id': 'code-' + b['id'], 'q': f"{b['code']}201처럼 「{b['code']}」가 앞에 붙은 강의실은 어느 건물에 있을까요?", 'options': opts,
              'answer': short(b['name']), 'why': f"{short(b['name'])}의 건물 기호는 {b['code']}예요.", 'at': [round(X(c[1]), 1), round(Z(c[0]), 1)], 'look': b['name']})
main = [b for b in B if b['id'] in ('nichols', 'dasol', 'mirae', 'bambino', 'virtus', 'maria', 'paul', 'seongsim', 'kimsuhwan', 'library', 'international', 'pharmacy')]
pos = {b['id']: (X(b['center'][1]), Z(b['center'][0])) for b in B}
for b in main:
    others = sorted((o for o in main if o is not b), key=lambda o: math.dist(pos[b['id']], pos[o['id']]))
    near, far = others[0], others[-4:]
    if math.dist(pos[b['id']], pos[others[1]['id']]) - math.dist(pos[b['id']], pos[near['id']]) < 15: continue  # 비슷하게 가까우면 헷갈리니 뺀다
    opts = [short(o['name']) for o in rng.sample(far, 3)] + [short(near['name'])]; rng.shuffle(opts)
    Q.append({'id': 'near-' + b['id'], 'q': f"{short(b['name'])}에서 가장 가까운 건물은? (건물 한가운데끼리 잰 거리)", 'options': opts, 'answer': short(near['name']),
              'why': f"{short(b['name'])}에서 {short(near['name'])}까지 약 {round(math.dist(pos[b['id']], pos[near['id']]))}m예요.", 'at': [round(pos[b['id']][0], 1), round(pos[b['id']][1], 1)], 'look': b['name']})
open('worker/canvas-quiz.js', 'w').write('// tools/make_canvas_quiz.py 가 만든 파일 — 손으로 고치지 말고 스크립트를 고쳐 주세요.\n// 정답이 있는 퀴즈. 정답은 확인된 자료(건물 기호, 건물 위치)로만 만든다.\nexport const QUIZ = ' + json.dumps(Q, ensure_ascii=False, indent=0) + ';\n')
print(len(Q), [q['id'] for q in Q])
