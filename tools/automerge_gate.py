"""자동 합치기 문지기: 수정 제안이 「값(데이터)만 고친 것」인지 확인하고, 그 파일들만 꺼내 놓는다.

  python3 tools/automerge_gate.py <바뀐 파일 목록 JSON> <제안 커밋>

- 제안의 코드는 절대 실행하지 않는다. 허용된 데이터 파일의 내용만 `git show`로 꺼내
  지금 main 위에 덮어쓰고, 검사는 main에 있는 tools/check.py 가 한다.
- 허용: data/campuses/<교정>/... 의 .json, subdomains/<이름>.json(밑줄로 시작하는 파일 제외)
- 그 밖의 파일이 하나라도 있으면 자동으로 합치지 않는다(사람 확인).
결과: 종료 코드 0 = 자동 합치기 대상(파일을 꺼내 둠), 10 = 대상 아님, 1 = 오류
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEG = r'[A-Za-z0-9가-힣_][A-Za-z0-9가-힣_.-]*'
OK = [re.compile(rf'data/campuses/{SEG}(?:/{SEG})*\.json'), re.compile(r'subdomains/[a-z0-9][a-z0-9-]*\.json')]
MAX_FILES, MAX_BYTES = 30, 3_000_000


def why_not(files):
    if not files: return '바뀐 파일이 없어요.'
    if len(files) > MAX_FILES: return f'한 번에 바뀐 파일이 {MAX_FILES}개를 넘어요.'
    for f in files:
        name = f['filename']
        if '..' in name.split('/') or not any(p.fullmatch(name) for p in OK):
            return f'`{name}`은 값(데이터) 파일이 아니에요.'
        if f.get('status') == 'renamed':
            return f'`{name}`은 이름이 바뀐 파일이에요.'
    return None


def main():
    files = json.load(open(sys.argv[1], encoding='utf-8'))
    head = sys.argv[2]
    out = os.environ.get('GITHUB_OUTPUT')
    reason = why_not(files)
    if reason:
        print('자동 합치기 대상이 아니에요:', reason)
        if out: open(out, 'a').write('reason=' + reason.replace('\n', ' ').replace('\r', ' ') + '\n')
        sys.exit(10)
    for f in files:
        name, path = f['filename'], os.path.join(ROOT, f['filename'])
        if f.get('status') == 'removed':
            if os.path.exists(path): os.remove(path)
            continue
        blob = subprocess.run(['git', 'show', f'{head}:{name}'], cwd=ROOT, capture_output=True)
        if blob.returncode or len(blob.stdout) > MAX_BYTES:
            print(f'`{name}`을 꺼낼 수 없거나 너무 커요.'); sys.exit(1)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'wb').write(blob.stdout)
    print('값(데이터)만 바뀐 제안이에요:', ', '.join(f['filename'] for f in files))
    sys.exit(0)


if __name__ == '__main__':
    main()
