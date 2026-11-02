import { defineConfig } from "vite";

// 상대 경로로 빌드해서 어느 주소 아래에 올려도 열린다.
export default defineConfig({
  base: "./",
  build: { chunkSizeWarningLimit: 2000 },
});
