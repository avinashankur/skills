import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/cli.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  splitting: false,
  sourcemap: false,
  minify: false,
  banner: {
    js: "#!/usr/bin/env node",
  },
});
