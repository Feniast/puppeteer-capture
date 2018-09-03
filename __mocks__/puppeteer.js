const puppeteer = jest.genMockFromModule('puppeteer');

puppeteer.launch = () => ({
  newPage: () => {
    return {};
  }
});

module.exports = puppeteer;
