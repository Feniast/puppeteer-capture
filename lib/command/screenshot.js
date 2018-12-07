const path = require('path');
const fs = require('fs');
const ora = require('ora');
const slugify = require('slugify');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const { TimeoutError } = require('puppeteer/Errors');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

const spinner = ora();

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
 * resolve the directory, and create the directory if it doesn't exist
 * @param {String} dir
 */
const resolveDir = dir => {
  let newPath = dir;
  if (!util.isString(dir) || util.isEmptyString(dir)) {
    newPath = './';
  } else {
    newPath = dir.replace(/\\/g, '/');
  }
  if (!path.isAbsolute(newPath)) {
    newPath = path.resolve(process.cwd(), newPath);
  }
  if (!fs.existsSync(newPath)) {
    fs.mkdirSync(newPath);
  }
  return newPath;
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
    await page.goto(newUrl, { timeout });
  } catch (e) {
    // It's a must to release the resource
    pool.release(page);
    spinner.fail(`Fail to take screenshot for "${url}". Reason: ${e.message}`);
    return { url };
  }

  const pageData = await page.evaluate(() => {
    return {
      title: document.title || '',
    }
  });

  let savePath = dest;
  savePath += savePath.endsWith('/') ? '' : '/';
  savePath += getDefaultImageName(pageData.title, imageFormat);
  savePath = path.normalize(savePath);
  const filename = path.basename(savePath);
  
  await page.screenshot({
    path: savePath,
    type: imageFormat,
    fullPage,
    omitBackground
  });

  spinner.succeed(`Finished ${url} -> ${savePath}`);
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
  spinner.start();
  const pool = BrowserPagePool.create({
    executablePath: executable
  });

  const deviceConfig = devices[device];
  if (!util.isEmptyString(device) && !deviceConfig) {
    console.warn(
      `The device ${device} is not supported. The default settings will be used instead.`
    );
  }

  let srcUrls = Array.isArray(urls) ? urls : [urls];
  srcUrls = util.filterUnique(srcUrls);
  let destPath = resolveDir(dest);
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
