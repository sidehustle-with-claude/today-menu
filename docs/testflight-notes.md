# TestFlight 준비 메모 (23장)

값은 모두 가짜 예시입니다. 내 값으로 바꿔 쓰세요.

## 앱 식별 정보

`mobile/app.json`의 값을 읽어 표로 확인합니다.

| 항목 | app.json 위치 | 예시 값(가짜) |
|---|---|---|
| 앱 이름 | `expo.name` | 오늘 뭐 먹지 |
| 번들 ID | `expo.ios.bundleIdentifier` | com.example.todaymenu |
| 버전 | `expo.version` | 1.0.0 |
| 빌드 번호 | EAS가 관리 | `eas.json`의 `appVersionSource: remote` + `autoIncrement` |

- 번들 ID는 App Store Connect에 만든 앱의 번들 ID와 한 글자도 달라서는 안 됩니다.
- 한 번 스토어에 정하면 바꾸기 어렵습니다.

## 번들 ID 후보 (내 이름으로 바꾸기)

| 후보 | 비고 |
|---|---|
| com.example.todaymenu | 예시. 실제 앱에는 쓰지 않습니다 |
| com.내이름.todaymenu | 개인 개발자 기본형 |
| app.내이름.todaymenu | 서비스 이름을 앞에 둔 형태 |

## eas.json 프로필

| 프로필 | 쓰임 |
|---|---|
| development | 개발 빌드(개발 도구가 들어간 내 전용 테스트 앱). 내부 배포 |
| preview | 설치 파일을 링크로 나눠 보는 시험용. 내부 배포 |
| production | 스토어 제출용. 빌드 번호 자동 증가 |

## 명령 순서 (직접 실행)

```bash
npm install --global eas-cli
eas login
eas build:configure
eas build --platform ios --profile production
eas submit --platform ios --latest
```

- 애플 계정 로그인, 비밀번호, 2단계 인증은 사람이 직접 입력합니다.
- 키와 비밀번호는 어떤 파일에도 쓰지 않습니다.

## 달력에 적을 날짜

| 일정 | 날짜(직접 채우기) |
|---|---|
| 빌드를 올린 날 | |
| 90일 뒤 빌드 만료일 | |
| Apple Developer Program 갱신일 | |
| EAS 무료 빌드 남은 횟수 확인일 | |
