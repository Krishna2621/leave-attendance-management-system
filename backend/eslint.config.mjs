import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "logs/**", "coverage/**"],
  },

  js.configs.recommended,

  {
    files: ["**/*.js"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",

      globals: {
        ...globals.node,
      },
    },

    linterOptions: {
      reportUnusedDisableDirectives: true,
    },

    rules: {
      /*
      |--------------------------------------------------------------------------
      | Variables
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

      /*
      |--------------------------------------------------------------------------
      | Best Practices
      |--------------------------------------------------------------------------
      */

      eqeqeq: ["error", "always"],

      "no-var": "error",

      "prefer-const": "error",

      /*
      |--------------------------------------------------------------------------
      | Node.js
      |--------------------------------------------------------------------------
      */

      "no-console": "off",

      /*
      |--------------------------------------------------------------------------
      | Existing Project Compatibility
      |--------------------------------------------------------------------------
      */

      "no-useless-assignment": "warn",

      "preserve-caught-error": "off",
    },
  },
];
