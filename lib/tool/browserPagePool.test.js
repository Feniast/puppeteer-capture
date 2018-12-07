const BrowserPagePool = require('./browserPagePool');

describe('Test the BrowserPagePool', () => {
  let pool;
  beforeAll(() => {
    pool = new BrowserPagePool();
  });

  afterAll(async () => {
    await pool.destroy();
  });

  test('getBrowser is a singleton method', async () => {
    const browser = await pool.getBrowser();
    browser.__uid__ = 123;
    const newBrowser = await pool.getBrowser();
    expect(newBrowser.__uid__).toBe(123);
  }, 10000);
});