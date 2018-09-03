const browserPagePool = require('./browserPagePool');

test('getBrowser is a singleton method', async () => {
  const browser = await browserPagePool.getBrowser();
  browser.__uid__ = 123;
  const newBrowser = await browserPagePool.getBrowser();
  expect(newBrowser.__uid__).toBe(123);
}, 10000);