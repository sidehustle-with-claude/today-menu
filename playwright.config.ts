import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // 로컬은 0, 자동 실행에서는 1번만 다시 시도한다. 재시도로 통과한 테스트는 보고서에 "불안정"으로 남는다.
  retries: process.env.CI ? 1 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
    locale: "ko-KR", // 언어 전환 테스트가 아니면 한국어 화면으로 고정한다(20장)
  },
  projects: [
    // 로그인 화면이 생기면(26~27장) setup 프로젝트와 storageState 를 여기에 추가한다. tests/auth.setup.ts 는 아직 없다.
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  // 테스트 전에 앱을 켠다. 이미 켜져 있으면 재사용한다.
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
