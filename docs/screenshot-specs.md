# 스크린샷 규격 (39장 39.4)

2026년 11월 기준으로 39장 본문이 공식 문서에서 확인한 값입니다. 바뀌었을 수 있으니 제출 때 공식 문서를 다시 봅니다.

## 애플 (세로 기준, 알파 채널 없음, jpeg/jpg/png, 장치 크기마다 1~10장)

| 화면 | 받는 크기 |
|---|---|
| 6.9인치 아이폰 | 1260x2736, 1290x2796, 1320x2868 |
| 6.5인치 아이폰 | 1284x2778, 1242x2688 (6.9인치가 없을 때 필수) |
| 13인치 아이패드 | 2064x2752, 2048x2732 (아이패드 지원 시 필수) |

- 출처: https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/

## 구글 Play

- 게시하려면 기기 종류를 합쳐 2장 이상, 기기 종류마다 최대 8장
- JPEG 또는 알파 없는 24비트 PNG
- 한 변 320~3840픽셀, 긴 변이 짧은 변의 2배 이하
- 추천 대상이 되려면 1080픽셀 이상 4장 이상
- 출처: https://support.google.com/googleplay/android-developer/answer/9866151

## 점검

```bash
python3 scripts/check-screenshot-size.py <폴더 또는 파일>... [--store apple|google]
```
