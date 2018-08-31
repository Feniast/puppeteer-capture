const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const outputDir = path.resolve(__dirname, './tmp');
if(!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const outputName = 'aaa.pdf';

const main = async () => {
  const browser = await puppeteer.launch({
    // headless: false,
    // devtools: true
  });

  const page = await browser.newPage();
  await page.goto('https://www.jianshu.com/p/a9a55c03f768');
  await page.waitFor(2000);
  await page.setViewport({
    width: 1080,
    height: 1920
  });
  const pageData = await page.evaluate(() => {
    return {
      title: document.title || +new Date(),
    }
  });
  await page.pdf({
    path: path.resolve(outputDir, `${pageData.title}.pdf`),
    displayHeaderFooter: true,
    format: 'A4'
  });
  await browser.close();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});