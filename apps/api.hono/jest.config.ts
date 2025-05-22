module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@locales/(.*)$': '<rootDir>/locales/$1',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest', {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  //-----------------------
  // テストカバレッジの設定
  collectCoverage: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts', // 型定義ファイルは除外
    '!<rootDir>/src/**/types.ts', // 型定義専用ファイルも除外
    '!<rootDir>/src/**/index.ts', // エントリーポイントも除外
  ],
  coverageDirectory: '<rootDir>/coverage', // カバレッジレポートの出力先
  coverageReporters: ['text', 'lcov', 'json-summary', 'clover'], // 出力するレポートの形式
};