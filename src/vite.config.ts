import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  ssr: { noExternal: ["element-plus", "highcharts", "highcharts-vue"] },
});
