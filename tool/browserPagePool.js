const pool = require('generic-pool');
const puppeteer = require('puppeteer');

/**
 * A Resource Pool Holding the Browser Page.
 * If you don't use the pool instance anymore, you must call the destroy method manually.
 * Otherwise the process will not exit because of the browser is running
 */
class BrowserPagePool {
  constructor() {
    this.browser = null;
    this._browserPromise = null;
    this.pool = null;
    this.init();
  }

  async getBrowser() {
    if(this.browser != null) return this.browser;
    if(this._browserPromise == null) {
      this._browserPromise = puppeteer.launch();
    }
    this.browser = await this._browserPromise;
    return this.browser;
  }

  init() {
    const factory = {
      create: async () => {
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        return page;
      },
      destroy: async (page) => {
        await page.close(); 
      }
    };
    this.pool = pool.createPool(factory, BrowserPagePool.poolOptions);
  }

  acquire() {
    return this.pool.acquire();
  }

  async destroy() {
    // don't await here just because it will hang on the process
    if (this.pool) this.pool.drain().then(() => this.pool.clear());
    if (this.browser) await this.browser.close();
  }

}

BrowserPagePool.poolOptions = {
  min: 2,
  max: 10
};

BrowserPagePool.create = () => {
  return new BrowserPagePool();
}

module.exports = BrowserPagePool;
