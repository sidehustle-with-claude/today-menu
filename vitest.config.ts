import { defineConfig } from "vitest/config";

// 단위 테스트는 src 와 scripts 안의 *.test.ts 만 돌린다. e2e(tests/)와 games, mobile 은 따로 돌린다.
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
