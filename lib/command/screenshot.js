const path = require('path');
const slugify = require('slugify');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const { Signale } = require('signale');
const chalk = require('chalk');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

const logScope = 'pch';
const logger = new Signale({
  scope: logScope
});
logger.config({
  displayLabel: false
});

const highlightUrl = chalk.blue;
const highlightError = chalk.red;
const highlightTime = chalk.green;

/**
 * get the default image name according to the file extension provided
 * @param {String} ext
 */
const getDefaultImageName = (title, ext) => {
  const prefix = slugify(title) || 'screenshot';
  const dateStr = dayjs().format('YYYYMMDDHHmmss');
  return `${prefix}-${dateStr}.${ext}`;
};

const wrapFunc = async (fn, beforeFn, afterFn) => {
  const time = Date.now();
  if (beforeFn) beforeFn(time);
  const result = await fn();
  if (afterFn) afterFn(Date.now() - time);
  return result;
};

/**
 * Take a screenshot for a single page
 * @param {String} url
 * @param {Object} options
 */
const makeScreenshot = async (url, options = {}) => {
  const {
    width,
    height,
    fullPage,
    omitBackground,
    imageFormat,
    dest,
    deviceConfig,
    pool,
    timeout,
    verbose,
    onComplete
  } = options;

  let page;

  try {
    page = await pool.acquire();
    const startTime = Date.now();
    if (deviceConfig != null) {
      await page.emulate(deviceConfig);
    } else {
      await page.setViewport({
        width,
        height
      });
    }
    const newUrl = util.fixUrl(url);
    await wrapFunc(
      () => {
        return page.goto(newUrl, { timeout });
      },
      () => {
        if (verbose) {
          logger.note('Prepare to load page %s.', highlightUrl(url));
        }
      },
      timeCost => {
        if (verbose) {
          logger.note(
            'Finish loading page %s. Take time %sms.',
            highlightUrl(url),
            highlightTime(timeCost)
          );
        }
      }
    );

    const pageData = await page.evaluate(() => {
      return {
        title: document.title || ''
      };
    });

    let savePath = dest;
    savePath += savePath.endsWith('/') ? '' : '/';
    savePath += getDefaultImageName(pageData.title, imageFormat);
    savePath = path.normalize(savePath);
    const filename = path.basename(savePath);

    await wrapFunc(
      () => {
        return page.screenshot({
          path: savePath,
          type: imageFormat,
          fullPage,
          omitBackground
        });
      },
      () => {
        if (verbose) {
          logger.note(
            'Prepare to take screenshot for page %s.',
            highlightUrl(url)
          );
        }
      },
      timeCost => {
        if (verbose) {
          logger.note(
            'Finish screenshot %s. Take time %sms.',
            highlightUrl(url),
            highlightTime(timeCost)
          );
        }
        logger.success(
          `Finish screenshot %s. Total time used: %sms.`,
          highlightUrl(url),
          highlightTime(Date.now() - startTime)
        );
      }
    );

    return {
      url,
      success: true,
      path: savePath,
      filename,
      title: pageData.title,
      timestamp: +new Date()
    };
  } catch (e) {
    logger.error(
      'Fail to take screenshot for %s. Reason: %s',
      highlightUrl(url),
      highlightError(e.message)
    );
    return { url, success: false };
  } finally {
    // It's a must to release the resource
    if (page) pool.release(page);
    onComplete && onComplete();
  }
};

/**
 * the screenshot command executor function
 * @param {Array<String>} urls
 * @param {Object} options
 */
const screenshot = async (urls, options = {}) => {
  const {
    width,
    height,
    fullPage,
    omitBackground,
    imageFormat,
    dest,
    device,
    timeout,
    executable,
    verbose,
    printOutputPath
  } = options;

  const startTime = Date.now();

  if (urls.length === 0) return;
  const pool = BrowserPagePool.create({
    executablePath: executable
  });

  const deviceConfig = devices[device];
  if (!util.isEmptyString(device) && !deviceConfig) {
    logger.warn(
      `The device ${device} is not supported. The default settings will be used instead.`
    );
  }

  const srcUrls = util.filterUnique(util.toArray(urls));
  const destPath = util.resolveDir(dest);

  const total = srcUrls.length;

  const tasks = Promise.all(
    srcUrls.map(url => {
      return makeScreenshot(url, {
        width,
        height,
        fullPage,
        omitBackground,
        imageFormat,
        dest: destPath,
        deviceConfig,
        pool,
        timeout,
        verbose
      });
    })
  );

  const results = await tasks;
  const failedCount = results.filter(item => !item.success).length;

  if (printOutputPath) {
    results
      .filter(item => item.success)
      .forEach(item => {
        logger.note('%s -> %s', item.url, item.path);
      });
  }

  logger.complete(
    'All tasks complete. Failed: %s. Total time used: %sms.',
    highlightError(failedCount),
    highlightTime(Date.now() - startTime)
  );

  await pool.destroy();
};

module.exports = screenshot;
