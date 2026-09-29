import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  {
    rules: {
      "no-console": "error",
      "no-warning-comments": ["error", { terms: ["todo", "fixme", "xxx"], location: "start" }],
    },
  },
  {
    files: ["src/components/TagManager.tsx"],
    rules: {
      "prefer-rest-params": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "node_modules/**", ".wrangler/**", "next-env.d.ts", ".previews/**", ".lighthouseci/**", "scripts/**"]),
]);
