const BrowserPagePool = require('../tool/browserPagePool');
const util = require('../tool/util');
const { logger, highlight } = require('../tool/logger');
const { goToPage, wrapFunc } = require('./common');
const path = require('path');

/**
 * parse margin string to object
 * @param {String} str 
 */
const parseMargin = (str) => {
  if (!str) return {};
  const marginArr = str.trim().split(/\s+/);
  if (marginArr.length === 0) return {};
  if (!marginArr.every(m => /^\d+(\.\d+)?(px|cm|in|mm)?$/.test(m))) return {};
  if (marginArr.length === 1) {
    return {
      top: marginArr[0],
      right: marginArr[0],
      bottom: marginArr[0],
      left: marginArr[0]
    };
  }
  if (marginArr.length === 2) {
    return {
      top: marginArr[0],
      right: marginArr[1],
      bottom: marginArr[0],
      left: marginArr[1]
    };
  }
  if (marginArr.length === 3) {
    return {
      top: marginArr[0],
      right: marginArr[1],
      bottom: marginArr[2],
      left: marginArr[1]
    };
  }
  if (marginArr.length >= 4) {
    return {
      top: marginArr[0],
      right: marginArr[1],
      bottom: marginArr[2],
      left: marginArr[3]
    };
  }
}

const pdf = async (url, {
  width,
  height,
  displayHeaderFooter,
  printBg,
  useScreen,
  landscape,
  format,
  margin,
  dest,
  executable,
  verbose,
  timeout
}) => {
  const startTime = Date.now();
  const pool = BrowserPagePool.create({
    executablePath: executable
  });
  let page;
  try {
    page = await pool.acquire();
    await goToPage(page, url, {
      timeout,
      waitUntil: 'networkidle0', 
      verbose
    });

    const pageData = await page.evaluate(() => {
      return {
        title: document.title || ''
      };
    });
    if (useScreen) {
      await page.emulateMedia('screen');
    }
    
    const pdfOptions = {
      displayHeaderFooter,
      printBackground: printBg,
      landscape,
      margin: parseMargin(margin)
    };
    if (width) { pdfOptions.width = width; }
    if (height) { pdfOptions.height = height; }
    if (format) { pdfOptions.format = format; }
    const savePath = dest ? dest : path.resolve(process.cwd(), `${util.slugify(pageData.title)}.pdf`);
    pdfOptions.path = savePath;

    await wrapFunc(
      () => {
        return page.pdf(pdfOptions);
      },
      () => {
        if (verbose) {
          logger.note(
            'Prepare to take pdf for page %s.',
            highlight.url(url)
          );
        }
      },
      timeCost => {
        if (verbose) {
          logger.note(
            'PDF %s finish. Take time %sms.',
            highlight.url(url),
            highlight.time(timeCost)
          );
        }
        logger.success(
          `Finish %s. Total time used: %sms.`,
          highlight.url(url),
          highlight.time(Date.now() - startTime)
        );
      }
    );
  } catch (e) {
    logger.error(
      'Fail to take screenshot for %s. Reason: %s',
      highlight.url(url),
      highlight.error(e.message)
    );
  } finally {
    if (page) pool.release(page);
    await pool.destroy();
  }
  
};

module.exports = pdf;
