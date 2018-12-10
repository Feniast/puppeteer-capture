const util = require('./util');
jest.mock('fs');

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

test('isString function', () => {
  expect(util.isString('')).toBe(true);
  expect(util.isString(1)).toBe(false);
  expect(util.isString(undefined)).toBe(false);
  expect(util.isString(null)).toBe(false);
  expect(util.isString({})).toBe(false);
  expect(util.isString(false)).toBe(false);
  expect(util.isString([])).toBe(false);
});

test('isEmptyString function', () => {
  expect(util.isEmptyString('')).toBe(true);
  expect(util.isEmptyString('   ')).toBe(true);
  expect(util.isEmptyString(' asdf ')).toBe(false);
  expect(util.isEmptyString(null)).toBe(true);
});

test('fixUrl function', () => {
  expect(util.fixUrl('www.example.com')).toBe('http://www.example.com');
  expect(util.fixUrl('//www.example.com')).toBe('http://www.example.com');
  expect(util.fixUrl('//www.example.com', 'https')).toBe('https://www.example.com');
  expect(util.fixUrl('http://www.example.com')).toBe('http://www.example.com');
  expect(util.fixUrl('https://www.example.com')).toBe('https://www.example.com');
});

test('exitProgram function', () => {
  const exit = jest.spyOn(process, 'exit').mockImplementation(number => number);
  //run your test
  util.exitProgram('error happened');
  expect(exit).toHaveBeenCalledWith(1);
});

test('remove empty values from object', () => {
  expect(util.removeEmptyValues({})).toEqual({});
  expect(util.removeEmptyValues({ a: 1, b: 2, c: undefined, d: null })).toEqual({a: 1, b: 2});
});

describe('Fail when timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  test('task with 1000ms duration fail when timeout is 100ms', async () => {
    const task = new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
    const result = util.failWhenTimeout(task, 100);
    jest.advanceTimersByTime(100);
    await expect(result).rejects.toThrow();
  });

  test('task with 999ms duration success when timeout is 1000ms', async () => {
    const task2 = new Promise((resolve) => {
      setTimeout(() => {
        resolve(1);
      }, 999);
    });
    const result2 = util.failWhenTimeout(task2, 1000);
    jest.advanceTimersByTime(999);
    await expect(result2).resolves.toBe(1);
  });
});

describe('Filter unique values in an array', () => {
  test('have the same values and the same order', () => {
    const arr = ['1', 'abc', {}, 'ddd', 37727, 1, '1', 1, 'abc', 'ufx'];
    const newArr = util.filterUnique(arr);
    expect(newArr).toEqual(['1', 'abc', {}, 'ddd', 37727, 1, 'ufx']);
  });
});

describe('Turn a parameter to an array', () => {
  test('something is not an array will be an array', () => {
    const a = 1;
    expect(util.toArray(a)).toEqual([1]);
    const b = {};
    expect(util.toArray(b)).toEqual([{}]);
  });

  test('something already is an array will not change', () => {
    const x = [1, 'ff', {}, null, undefined];
    expect(util.toArray(x)).toBe(x);
  });
});

describe('Test resolve directory', () => {
  test('empty value will resolves to current directory', () => {
    const cwd = process.cwd();
    expect(util.resolveDir('')).toBe(cwd);
    expect(util.resolveDir('  ')).toBe(cwd);
    expect(util.resolveDir()).toBe(cwd);
    expect(util.resolveDir(null)).toBe(cwd);
    expect(util.resolveDir(undefined)).toBe(cwd);
  });

  test('relative path will resolves according to current directory', () => {
    const cwd = process.cwd();
    const path = require('path');
    expect(util.resolveDir('aa')).toBe(path.resolve(cwd, 'aa'));
    expect(util.resolveDir('aa/bb')).toBe(path.resolve(cwd, 'aa/bb'));
    expect(util.resolveDir('./aa')).toBe(path.resolve(cwd, './aa'));
    expect(util.resolveDir('../aa/bb')).toBe(path.resolve(cwd, '../aa/bb'));
  });

  test('absolute path will not change', () => {
    expect(util.resolveDir('C:\\aaa')).toBe('C:\\aaa');
    expect(util.resolveDir('/home/aaa')).toBe('/home/aaa');
  });

  test('will create the dir if the directory not exist', () => {
    const fs = require('fs');
    const mkdirSync = jest.spyOn(fs, 'mkdirSync');
    fs.__setFileExists__(false);
    util.resolveDir('/aaa');
    expect(mkdirSync).toHaveBeenCalledWith('/aaa');
  });
});