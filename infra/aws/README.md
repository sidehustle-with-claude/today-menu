# infra/aws

28장에서 쓰는 AWS 예시 파일입니다. 값은 모두 가짜입니다.
이 폴더의 파일을 클로드가 AWS에 적용하지 않습니다. 콘솔에서 사람이 직접 붙입니다.

| 파일 | 내용 |
|---|---|
| `policy-s3-upload.json` | 버킷 한 곳에 올리기(PutObject)와 목록 보기(ListBucket)만 허용. 삭제 없음 |
| `policy-deny-destructive.json` | 삭제·종료·권한 변경·공개 설정을 명시적으로 거부하는 보조 정책 |
| `budget-5usd.json` | 월 5달러 비용 예산 정의 |
| `budget-notifications.json` | 실제 지출 80%, 예상 지출 100% 알림 (이메일은 example.com 가짜 값) |

## 쓰기 전에 바꿀 것

- 버킷 이름 `today-menu-test-123456`을 내 버킷 이름으로 바꿉니다. 이름은 전 세계에서 유일해야 합니다.
- 알림 이메일 `alerts@example.com`을 내 주소로 바꿉니다.
- 계정 번호와 액세스 키는 이 폴더 어디에도 적지 않습니다.

## 예산을 CLI로 만들 때 (선택, 사람이 실행)

콘솔에서 만들어도 되고, 아래처럼 파일을 넘겨도 됩니다.
계정 번호는 직접 입력하세요.

```bash
aws budgets create-budget \
  --account-id <내-계정-번호> \
  --budget file://infra/aws/budget-5usd.json \
  --notifications-with-subscribers file://infra/aws/budget-notifications.json
```

## 정책 검증

정책 문법은 IAM Access Analyzer로 검증합니다.
정책 파일이 올바른 JSON인지는 아래로 확인할 수 있습니다.

```bash
python3 -m json.tool infra/aws/policy-s3-upload.json > /dev/null && echo OK
```

공식 문서: https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html
