# 앱이 실제로 쓰는 데이터 표 (38장 갱신)

`mobile/` 코드와 구글 공식 문서에서 확인한 것만 적었습니다. 확인하지 못한 항목은 "확인 못 함"으로 따로 표시했습니다.
Play Console 데이터 보안 양식과 개인정보처리방침은 이 표를 보고 사람이 직접 답합니다.

## 앱 코드

| 질문 | 확인한 결과 | 근거 |
|---|---|---|
| 위치·카메라·사진·연락처·알림 권한 | 요청하는 코드 없음 | `mobile/src`, `mobile/app.json` |
| 기기에 저장하는 데이터 | 없음. 입력한 동네는 화면 상태에만 있음 | `mobile/src/screens/HomeScreen.tsx` |
| 가게 데이터 | 앱에 들어 있는 정적 파일. 네트워크 요청 없음 | `mobile/src/data/places.json` |
| 로그인·계정 | 없음 | `mobile/App.tsx` |
| 결제 | 없음 (37장 전) | `mobile/package.json` |
| 광고 SDK | 있음: `react-native-google-mobile-ads` (구글 AdMob) | `mobile/package.json`, `mobile/src/ads/` |
| 광고 동의 | 구글 UMP(`AdsConsent.gatherConsent`)를 앱 시작 때 호출 | `mobile/src/ads/initAds.ts` |

## 광고 SDK가 자동으로 모으고 공유하는 데이터

출처: 구글 공식 안내 https://developers.google.com/admob/android/privacy/play-data-disclosure (2026년 11월 확인, 해당 페이지는 SDK 25.5.0 기준 문구)

| 데이터 유형(공식 문구) | 모으나 | 광고 파트너와 공유 |
|---|---|---|
| IP address | 예 | 예 |
| User product interactions | 예 | 예 |
| Diagnostic information | 예 | 예 |
| Device and Account identifiers | 예 | 예 |

- 이 표는 구글 문서의 표기를 그대로 옮긴 것입니다. 한국어 Play Console 양식의 항목 이름과 맞추는 일은 사람이 양식 화면을 보고 합니다.
- 내 앱이 위 항목 외에 따로 모으는 데이터는 코드에 없습니다.
- 확인 못 함: iOS용 App Store 개인정보 항목(App Privacy)에 광고 SDK가 해당하는 정확한 항목. 애플 양식과 구글 iOS 안내(https://developers.google.com/admob/ios/privacy)를 보고 사람이 답합니다.
- 확인 못 함: 내 이용자가 있는 지역에서 동의 메시지가 필수인지. AdMob 계정의 개인정보 메시지 화면에서 확인합니다.

## 확인 방법

```bash
grep -rniE "fetch\(|axios|XMLHttpRequest|expo-location|AsyncStorage|SecureStore" mobile/src mobile/App.tsx
```

- 아무것도 나오지 않으면 앱 코드가 직접 보내는 요청과 저장은 없다는 뜻입니다. 광고 SDK의 통신은 이 검사에 잡히지 않습니다.
