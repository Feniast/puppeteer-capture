const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const { TimeoutError } = require('puppeteer/Errors');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

/**
 * get the default image name according to the file extension provided
 * @param {String} ext
 */
const defaultImageName = ext => {
  const dateStr = dayjs().format('YYYYMMDDHHmmssSSS');
  return `screenshot-${dateStr}.${ext}`;
};

/**
 * resolve the image path
 * @param {String} imagePath
 * @param {String} ext
 */
const resolveImagePath = (imagePath, ext) => {
  let newPath = imagePath;
  if (!util.isString(imagePath) || util.isEmptyString(imagePath)) {
    newPath = './';
  }
  const extName = path.extname(newPath);
  if (extName === '') {
    // Try to detect if this is a directory
    if (!path.isAbsolute(newPath)) {
      newPath = path.resolve(process.cwd(), newPath);
    }
    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath);
    }
    if (!newPath.endsWith('/')) newPath = newPath + '/';
    newPath = newPath + defaultImageName(ext);
  } else if (!util.isSupportedScreenshotFormat(extName.slice(1))) {
    newPath = `${newPath.slice(0, newPath.length - extName.length)}.${ext}`;
  }
  return newPath;
};

/**
 * get the image file extension of the filename
 * @param {String} filename
 */
const resolveImageFormat = filename => {
  if (!util.isString(filename) || util.isEmptyString(filename)) {
    return '';
  }
  const ext = path.extname(filename).slice(1);
  if (ext === 'jpg') return 'jpeg';
  return ext;
};

/**
 * resolve the directory
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
    console.warn(`Fail to take screenshot for "${url}". Reason: ${e.message}`);
    return { url };
  }

  const pageData = await page.evaluate(() => {
    return {
      title: document.title || '',
    }
  });

  let savePath = dest;
  savePath += savePath.endsWith('/') ? '' : '/';
  savePath += defaultImageName(imageFormat);
  savePath = path.normalize(savePath);
  const filename = path.basename(savePath);
  
  await page.screenshot({
    path: savePath,
    type: imageFormat,
    fullPage,
    omitBackground
  });

  console.log(`screenshot for ${url} finished, written to ${filename}`);

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

  const pool = BrowserPagePool.create({
    executablePath: executable,
    headless: false,
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
