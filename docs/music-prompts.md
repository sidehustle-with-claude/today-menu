# 배경음악 설명 글 (48장)

Suno 에 넣을 설명 글입니다. 가사가 있으면 목소리와 겹치므로 가사 없는 곡(instrumental)으로 만듭니다.
계정 가입, 로그인, 결제, 곡 만들기 버튼은 사람이 직접 합니다. 자동화로 계정이나 크레딧을 늘리지 않습니다.

## 클로드에게 줄 말

```text
'오늘 뭐 먹지' 소개 영상(약 20초)에 깔 배경음악 설명을 만들어 줘. 가사 없는 곡.
분위기는 따뜻하고 가볍고 식욕이 도는 느낌. 빠르기는 중간(보통 걷는 속도).
악기는 어쿠스틱 기타, 가벼운 퍼커션 정도.
영어 프롬프트 3개를 만들고, 각각 어떤 느낌인지 한 줄씩 한국어로 적어 줘.
```

## 설명 글 예시 (영어)

1. `Warm, light instrumental, acoustic guitar and soft percussion, mid-tempo, cozy and appetizing, no vocals, 20 seconds`
   - 한국어: 가장 기본형. 따뜻하고 무난한 소개 영상용.
2. `Cheerful instrumental, plucked acoustic guitar and light claps, walking tempo, sunny kitchen mood, no vocals, no big drums, 20 seconds`
   - 한국어: 조금 더 경쾌함. 박수 소리로 가벼운 느낌.
3. `Gentle instrumental, nylon guitar with soft shaker, relaxed mid-tempo, homey and fresh, no vocals, 20 seconds`
   - 한국어: 차분하고 집밥 느낌. 목소리 뒤에 깔기 좋음.

## 넣으면 좋은 것 네 가지

- 분위기: 따뜻한, 가벼운, 경쾌한
- 빠르기: 느림, 중간, 빠름
- 악기: 기타, 피아노, 퍼커션
- 제외할 것: 가사 없음, 큰 드럼 없음

## 쓰는 법

- 크레딧에는 한도가 있다. 설명 글을 먼저 다듬고 만든다. 한도는 공식 요금 페이지 https://suno.com/pricing 에서 확인한다.
- 마음에 든 곡의 설명 글은 `docs/music-credit.md` 의 기록 표에 적어 둔다.
- 받은 파일은 `audio/bgm-raw.mp3` 로 둔다. 원본이다. 이 파일은 깃에 올리지 않는다.
- 길이와 끝 정리는 `bash scripts/fade-bgm.sh` 로 한다 (20초, 시작 0.5초 서서히 커짐, 끝 2초 서서히 줄어듦).
- 곡이 영상보다 짧으면 더 길게 다시 만들거나, 끝을 겹쳐 이어 붙인다 (crossfade).
