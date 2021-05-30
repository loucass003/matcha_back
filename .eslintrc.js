module.exports = {
  env: {
    es2021: true,
    "jest/globals": true,
  },
  extends: [
    "airbnb-typescript/base",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  plugins: ["@typescript-eslint", "jest"],
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "import/prefer-default-export": "off",
    "import/extensions": "off",
    "no-console": "off",
    "class-methods-use-this": "off",
    "no-param-reassign": "off",
    "no-useless-constructor": "off",
    "no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "no-unused-vars": "off",
    "max-classes-per-file": ["error", 4],
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-loop-func": "off",
    "@typescript-eslint/no-loop-func": "off",
    "no-restricted-syntax": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",
    "import/no-cycle": "off",
    "no-await-in-loop": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};
