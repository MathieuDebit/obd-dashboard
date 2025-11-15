import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import testingLibraryPlugin from "eslint-plugin-testing-library";
import jestDomPlugin from "eslint-plugin-jest-dom";
import tailwindPlugin from "eslint-plugin-tailwindcss";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testingFileGlobs = [
  "**/?(*.)+(spec|test).[jt]s?(x)",
  "**/__tests__/**/*.[jt]s?(x)",
];

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    name: "obd-dashboard/custom-rules",
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "testing-library": testingLibraryPlugin,
      "jest-dom": jestDomPlugin,
      tailwindcss: tailwindPlugin,
    },
    settings: {
      tailwindcss: {
        callees: ["cn", "clsx", "cva"],
        config: "tailwind.config.cjs",
      },
      "import/resolver": {
        typescript: true,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import/order": [
        "warn",
        {
          alphabetize: { order: "asc", caseInsensitive: true },
          "newlines-between": "always",
          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],
          pathGroupsExcludedImportTypes: ["builtin"],
        },
      ],
      "jest-dom/prefer-checked": "warn",
      "jest-dom/prefer-enabled-disabled": "warn",
      "jest-dom/prefer-required": "warn",
      "jsx-a11y/no-autofocus": "off",
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/preserve-manual-memoization": "off",
      "react-hooks/incompatible-library": "off",
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",
      "testing-library/no-node-access": "off",
      "testing-library/prefer-screen-queries": "warn",
      "testing-library/render-result-naming-convention": "off",
    },
  },
  {
    name: "obd-dashboard/testing-rules",
    files: testingFileGlobs,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "testing-library/await-async-utils": "error",
      "testing-library/no-await-sync-events": "error",
    },
  },
  {
    name: "obd-dashboard/cjs-overrides",
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "public/jsm/**",
    ],
  },
];

export default eslintConfig;
