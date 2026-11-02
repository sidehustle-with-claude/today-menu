# 앱이 실제로 쓰는 데이터 표 (24장)

`mobile/` 코드에서 확인한 것만 적었습니다. 추측은 적지 않습니다.
Play Console의 앱 콘텐츠·데이터 보안 양식은 이 표를 보고 사람이 직접 답합니다.
기준 시점: 24장 끝 상태(광고·결제 없음). 38장에서 광고를 붙이면 이 표를 고칩니다.

| 질문 | 코드에서 확인한 결과 | 근거 파일 |
|---|---|---|
| 위치 권한을 쓰나요 | 아니오. 위치 권한을 요청하는 코드가 없습니다. 동네는 사용자가 직접 입력합니다 | `mobile/src/screens/HomeScreen.tsx` |
| 카메라·사진·연락처·알림 권한을 쓰나요 | 아니오. 관련 패키지와 권한 설정이 없습니다 | `mobile/package.json`, `mobile/app.json` |
| 즐겨찾기를 저장하나요 | 아니오. 저장 기능이 없습니다 | `mobile/App.tsx` |
| 기기에 저장하는 데이터가 있나요 | 아니오. 입력한 동네 이름은 화면 상태에만 있고 앱을 닫으면 사라집니다 | `mobile/src/screens/HomeScreen.tsx` |
| 외부로 보내는 요청이 있나요 | 없음. 가게 데이터는 앱에 들어 있는 정적 파일이고 네트워크 요청 코드가 없습니다 | `mobile/src/data/places.json`, `mobile/src/search.ts` |
| 로그인·계정이 있나요 | 아니오 | `mobile/App.tsx` |
| 광고 SDK가 있나요 | 아니오 (38장 전) | `mobile/package.json` |
| 결제가 있나요 | 아니오 (37장 전) | `mobile/package.json` |

## 확인 방법

```bash
grep -rniE "fetch\(|axios|XMLHttpRequest|expo-location|AsyncStorage|SecureStore" mobile/src mobile/App.tsx
```

- 위 명령에 아무것도 나오지 않으면 표의 "없음"이 맞습니다.
- 나중에 기능을 넣으면 이 표와 Play Console 양식을 같이 고칩니다.
