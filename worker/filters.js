// 오류 제보 글 검사: 걸리면 저장은 하되 바로 보이지 않게(hidden) 둔다.
// 목록은 사람이 보고 늘리거나 줄일 수 있다. 너무 넓게 잡으면 정상 제보가 막히니 조심.
// (예: '보지 못했다', '새끼 고양이', '걸레받이'처럼 평범한 말에 섞이는 낱말은 넣지 않는다)
const WORDS = [
  '시발', '씨발', '씨빨', 'ㅅㅂ', 'ㅆㅂ', '병신', 'ㅂㅅ', '좆', '존나', '지랄', '개새끼', '미친놈', '미친년', '닥쳐',
  '섹스', '야동', '창녀',
  '느금', '니애미', '틀딱', '한남', '김치녀', '맘충', '급식충', '장애새끼', '게이새끼'
];
const PATTERNS = [
  [/https?:\/\/|www\.|[a-z0-9-]+\.(com|net|kr|io|me|xyz|ly)\b/i, 'link'],   // 링크는 받지 않음
  [/01[016789][-\s.]?\d{3,4}[-\s.]?\d{4}/, 'phone'],                         // 전화번호
  [/[\w.+-]+@[\w-]+\.[\w.]+/, 'email'],                                       // 메일 주소
  [/\b(19|20)\d{7,8}\b/, 'student-id']                                          // 학번처럼 보이는 숫자
];
export function checkText(s) {
  const t = String(s || '').toLowerCase(), squeezed = t.replace(/[\s.\-_*~!]+/g, '');
  for (const w of WORDS) if (squeezed.includes(w)) return { ok: false, reason: 'word' };
  for (const [re, why] of PATTERNS) if (re.test(t)) return { ok: false, reason: why };
  return { ok: true };
}
