const path = require('path');
const fs = require('fs');
const ora = require('ora');
const slugify = require('slugify');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const { TimeoutError } = require('puppeteer/Errors');
const { Signale } = require('signale');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

const logScope = 'pch';

const logger = new Signale({
  scope: logScope,
});

logger.config({
  displayLabel: false
});

/**
 * get the default image name according to the file extension provided
 * @param {String} ext
 */
const getDefaultImageName = (title, ext) => {
  const prefix = slugify(title) || 'screenshot';
  const dateStr = dayjs().format('YYYYMMDDHHmmss');
  return `${prefix}-${dateStr}.${ext}`;
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
    timeout
  } = options;
  const time = Date.now();
  const page = await pool.acquire();

  if (deviceConfig != null) {
    await page.emulate(deviceConfig);
  } else {
    await page.setViewport({
      width,
      height
    });
  }

  const newUrl = util.fixUrl(url);
  try {
    logger.note('prepare to load page %s', url);
    await page.goto(newUrl, { timeout });
    logger.note('finished page loading %s', url);
  } catch (e) {
    // It's a must to release the resource
    pool.release(page);
    logger.error(`Fail to take screenshot for "${url}". Reason: ${e.message}`);
    return { url };
  }

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

  logger.note('prepare to take screenshot for page %s', url);

  await page.screenshot({
    path: savePath,
    type: imageFormat,
    fullPage,
    omitBackground
  });

  logger.success(`Finished ${url} -> ${savePath}, take time ${Date.now() - time}ms`);
  // It's a must to release the resource
  pool.release(page);

  return {
    url,
    path: savePath,
    filename,
    title: pageData.title,
    timestamp: +new Date()
  };
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
    executable
  } = options;

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
        timeout
      });
    })
  );

  const results = await tasks;

  await pool.destroy();
};

module.exports = screenshot;
