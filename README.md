# cukmap

가톨릭대학교 지도. 지금은 성심교정을 담고 있다.

> 이 문서는 초안이다. 프로젝트를 시작한 이유와 앞으로의 방향(Make cukmap)은 만든 사람이 직접 쓴다.

## 구조

- `data/campuses/` 교정별 건물·길·지형 데이터 — 틀은 [docs/DATA.md](docs/DATA.md)
- `src/` 지도를 그리는 코드
- `site/` 화면 뼈대
- `tools/build.py` 한 파일(`dist/index.html`)로 묶기

## 빌드

```
python3 tools/build.py --public
```

`dist/index.html`을 브라우저로 열면 된다.

## 자료 출처

[docs/SOURCES.md](docs/SOURCES.md)
