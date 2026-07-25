import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      ecmaVersion: "latest",

      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },

      globals: {
        ...globals.browser,
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      /*
      |--------------------------------------------------------------------------
      | React
      |--------------------------------------------------------------------------
      */

      "react/jsx-uses-vars": "error",

      "react/react-in-jsx-scope": "off",

      "react/jsx-uses-react": "off",

      /*
      |--------------------------------------------------------------------------
      | React Hooks
      |--------------------------------------------------------------------------
      */

      ...reactHooks.configs.recommended.rules,

      /*
      |--------------------------------------------------------------------------
      | React Refresh
      |--------------------------------------------------------------------------
      */

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],

      /*
      |--------------------------------------------------------------------------
      | General JavaScript
      |--------------------------------------------------------------------------
      */

      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],

      eqeqeq: ["error", "always"],

      "no-var": "error",

      "prefer-const": "error",

      "no-console": "off",
    },
  },
];
