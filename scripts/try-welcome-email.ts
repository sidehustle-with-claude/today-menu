// 환영 메일 시험 실행: node scripts/try-welcome-email.ts 받는주소 [이름]
// 기본은 DRY_RUN=1 이라 실제로 보내지 않고 보낼 내용만 보여 준다.
// 실제 발송은 내 주소로 한 번만: DRY_RUN=0 node --env-file=.env scripts/try-welcome-email.ts 내주소@example.com
import { sendWelcomeEmail } from "../src/welcome-email.ts";

const to = process.argv[2] ?? "";
const name = process.argv[3] ?? "테스트";

const result = await sendWelcomeEmail(to, name);
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exit(1);
