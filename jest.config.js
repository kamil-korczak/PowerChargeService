
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*test.ts'],
  setupFilesAfterEnv: ["jest-expect-message"],
};
