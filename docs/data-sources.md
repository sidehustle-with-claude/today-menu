# 데이터 출처와 이용 조건

## 이 저장소의 데이터

- `data/restaurants.csv`와 `public/data/restaurants.json`은 이 저장소를 위해 만든 가상 데이터입니다. 실제 가게, 실제 전화번호와 관련이 없습니다.
- `phone` 열은 개인정보 열이 어떻게 걸러지는지 보여 주려고 일부러 넣은 가짜 값입니다. 변환 스크립트가 이 열을 버립니다.

## 내 데이터로 바꿀 때

- 공공데이터를 쓰면 내려받은 화면의 이용 허락 범위를 확인하고, 서비스 화면에 출처를 적습니다.
- 출처 칸 예시: `출처: 데이터 이름 / 제공 기관 / 내려받은 날짜 / 이용 조건`
- 개인 이름이나 전화번호가 든 열은 JSON에 넣지 않습니다. `scripts/csv-to-json.js`는 `phone`, `tel`, `owner`, `email` 같은 열을 버리고 알려 줍니다.

## 변환 방법

```
node scripts/csv-to-json.js
```

- 입력: `data/restaurants.csv`
- 출력: `public/data/restaurants.json`
- 화면에 건수와 동네별 건수가 나옵니다. CSV 데이터 줄 수와 JSON 건수가 같은지 봅니다.

## 화면 보는 법

- `index.html`은 JSON을 fetch로 읽으므로 파일을 바로 열면 안 됩니다. 저장소 루트에서 `python3 -m http.server 8000` 으로 켜고 `http://localhost:8000` 을 엽니다.
- 즐겨찾기는 가게 id를 브라우저의 localStorage `favorites` 키에 저장합니다.
