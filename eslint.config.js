import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier";

/**
 * ESLint flat configuration (ESLint 9).
 *
 * Composition:
 *  - `next/core-web-vitals`  → Next.js rules + React, React Hooks, and
 *    jsx-a11y (accessibility) rules, loaded via FlatCompat.
 *  - `next/typescript`       → @typescript-eslint parser + recommended rules.
 *  - custom rules            → stricter no-explicit-any / no-unused-vars and
 *    deterministic import ordering.
 *  - `eslint-config-prettier`→ last, disables stylistic rules that would fight
 *    Prettier (formatting is Prettier's job).
 *
 * Linting is intentionally NOT a Vercel build gate (see next.config.ts:
 * `eslint.ignoreDuringBuilds`); it runs via `npm run lint` in CI and locally.
 * TypeScript type-checking remains the build's correctness gate.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "node_modules/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index", "type"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
          pathGroups: [{ pattern: "@/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
    },
  },
  prettier,
];

export default eslintConfig;
