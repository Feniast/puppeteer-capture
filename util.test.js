const util = require('./util');

test('if a string is a number string', () => {
  expect(util.isStrNumber('123')).toBe(true);
  expect(util.isStrNumber('23440.')).toBe(true);
  expect(util.isStrNumber('7473.23')).toBe(true);
  expect(util.isStrNumber('adsf')).toBe(false);
  expect(util.isStrNumber('123.2f')).toBe(false);
  expect(util.isStrNumber('123gd')).toBe(false);
});

test('string parse to integer', () => {
  expect(util.parseInteger('123')).toBe(123);
  expect(util.parseInteger('23440.')).toBe(23440);
  expect(util.parseInteger('7473.23')).toBe(7473);
  expect(util.parseInteger('adsf')).toBeNaN();
  expect(util.parseInteger('123.2f')).toBeNaN();
  expect(util.parseInteger('123gd')).toBeNaN();
});

test('check if a image format is supported screenshot format', () => {
  expect(util.isSupportedScreenshotFormat('png')).toBe(true);
  expect(util.isSupportedScreenshotFormat('jpeg')).toBe(true);
  expect(util.isSupportedScreenshotFormat('gif')).toBe(false);
});