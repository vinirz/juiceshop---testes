const { npm } = require("winston/lib/winston/config");

module.exports = {
  roots: ['<rootDir>/test/unit'],
  testMatch: ['**/*.test.js'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};