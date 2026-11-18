# cukmap

가톨릭대학교 지도. 지금은 성심교정을 담고 있다.

> 이 문서는 초안이다. 프로젝트를 시작한 이유와 앞으로의 방향(Make cukmap)은 만든 사람이 직접 쓴다.

## 참여하기

오류 제보는 [cukmap.com/edit](https://cukmap.com/edit/)에서 누구나, 직접 고치는 방법은 [참여 안내](CONTRIBUTING.md)에 있어요.

## 화면

- `cukmap.com` 보는 지도 (입체 지도 · 지상 시점 · 평면 지도)
- `cukmap.com/projects/` 활용 프로젝트 목록, `이름.cukmap.com` 하위 주소 — 신청은 [subdomains/](subdomains/README.md)에 파일 하나
- `cukmap.com/contributors/` 함께 만든 사람들(GitHub 기여자, 제보 현황, 자료 출처)
- `cukmap.com/embed/`, `cukmap.com/kit/v1/cukmap.js` 지도 부품: 내 사이트에 지도를 넣고 핀·층·보기를 다룸 → [docs/KIT.md](docs/KIT.md)
- `cukmap.com/edit/` 지도 오류 제보 — 로그인 없이 누구나. 제보는 글자만 받고, 부적절 신고가 3번 모이면 자동으로 숨긴다. 「고쳐졌어요」가 2번 모이면 해결됨으로 옮긴다.

## 구조

- `data/campuses/` 교정별 건물·길·지형 데이터 — 틀은 [docs/DATA.md](docs/DATA.md)
- `src/` 지도를 그리는 코드
- `site/` 화면 뼈대
- `tools/build.py` 보는 지도(`dist/index.html`)와 오류 제보 화면(`dist/edit/index.html`)으로 묶기
- `worker/` Cloudflare Worker: 오류 제보 API(`/api/reports`), 비공개 자료 중계. 제보 내용은 검사하지 않고 커뮤니티 신고로 숨긴다
- `site/_headers` 보안 규칙(CSP): 지도 코드가 cukmap.com 밖으로 데이터를 보내거나 외부 스크립트를 불러오지 못하게 함

## 빌드

```
python3 tools/build.py
```

`dist/index.html`을 브라우저로 열면 된다.

## 자료 출처 · 라이선스

- 출처와 이용 조건: [docs/SOURCES.md](docs/SOURCES.md)
- 코드는 MIT, 지도 데이터는 출처별 조건(OpenStreetMap 부분은 ODbL)을 따른다.
- 자료에 문제가 있으면 [이슈](https://github.com/cukmap/map/issues)로 알려 주세요. 확인 후 바로 고치거나 내립니다.
