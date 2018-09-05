const puppeteer = jest.genMockFromModule('puppeteer');

puppeteer.launch = () => Promise.resolve({
  newPage: () => {
    return Promise.resolve({});
  },
  close: () => {
    return Promise.resolve();
  }
});

module.exports = puppeteer;
