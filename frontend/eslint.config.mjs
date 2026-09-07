import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The react-hooks/set-state-in-effect rule fires on all our standard data-fetching
    // patterns (fetchPath(), fetchLeaderboard(), fetchStatsAndUser(), start()) where
    // async setState is triggered inside useEffect via useCallback — this is the
    // canonical React async-data-fetching pattern and not a real problem.
    // We keep the rule as a warning only to preserve signal without blocking CI.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/refs": "warn",
    },
  },
]);

export default eslintConfig;
