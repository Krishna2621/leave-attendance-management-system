module.exports = {
  testEnvironment: "node",

  testMatch: ["<rootDir>/tests/**/*.test.js"],

  collectCoverageFrom: [
    "controllers/**/*.js",
    "middleware/**/*.js",
    "services/**/*.js",
    "utils/**/*.js",
  ],

  coverageDirectory: "coverage",

  clearMocks: true,

  verbose: true,
};
