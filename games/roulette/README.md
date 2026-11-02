# 메뉴 룰렛 미니게임

Phaser로 만든 "오늘 뭐 먹지" 룰렛입니다. 한식, 분식, 카페, 중식, 일식, 양식 6칸이고 START를 누르면 3초 동안 돌다가 멈춥니다.

## 실행

```
cd games/roulette
npm ci
npm run dev
```

- 터미널에 나온 주소(예: `http://localhost:5173`)를 브라우저에서 엽니다.
- `npm run build` 는 `dist/` 에 정적 파일을 만듭니다.

## 확인

- `npm test` 는 뽑기 함수와 각도 계산을 검사합니다.
- `npm run check:distribution` 은 START를 20번 누른 것과 같은 방식으로 결과 분포를 셉니다. 횟수는 `node scripts/distribution.mjs 1000` 처럼 바꿉니다.

## 구조

- `src/pick.js`: 결과 칸을 먼저 뽑고 그 칸에 맞는 각도를 계산하는 함수
- `src/main.js`: Phaser 화면(돌림판, 화살표, START, 결과 문구)
- `ASSETS.md`: 에셋 출처와 라이선스 (이미지·소리 파일 없음)
