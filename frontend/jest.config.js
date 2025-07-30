module.exports = {
  // Use Babel to transform JavaScript and JSX files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },

  // Module name mapping to resolve specific issues, such as with axios
  moduleNameMapper: {
    // If necessary, use the minified version of axios to avoid issues with ES Modules
    '^axios$': 'axios/dist/axios.min.js',
  },

  // Add this section if you're using React or JSX
  testEnvironment: 'jsdom',  // Set the test environment to jsdom (simulates browser behavior)

  // If you're using TypeScript, include this (optional if you have TypeScript setup)
  // preset: 'ts-jest',

  // You can add more configuration options based on your needs
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  
  // Optional: Add setup files if you want to include custom setup before tests
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],

  // For coverage reporting (optional, if you're using it)
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.test.{js,jsx,ts,tsx}'],
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
};
