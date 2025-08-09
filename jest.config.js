module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/bible-data.js' // Exclude large data file from coverage
  ],
  testMatch: [
    '<rootDir>/tests/**/*.test.js'
  ],
  verbose: true
};