const path = require('path');
const puppeteer = require('puppeteer');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

const defaultImageName = ext => {
  const dateStr = dayjs().format('YYYYMMDDHHmmssSSS');
  return `screenshot-${dateStr}.${ext}`;
}

/**
 * 
 * @param {String} imagePath 
 * @param {String} ext 
 */
const resolveImagePath = (imagePath, ext) => {
  let newPath = imagePath;
  if (!util.isString(imagePath) || util.isEmptyString(imagePath)) {
    newPath = './';
  }
  if (newPath.endsWith('.')) {
    newPath = newPath + '/';
  }
  if (newPath.endsWith('/')) {
    newPath = `${newPath}${defaultImageName(ext)}`;
  }
  const extName = path.extname(newPath);
  if (extName === '') {
    newPath = `${newPath}.${ext}`;
  }
  else if (!util.isSupportedScreenshotFormat(extName.slice(1))){
    newPath = `${newPath.slice(0, newPath.length - extName.length)}.${ext}`;
  }
  return newPath;
};

const screenshot = async (url, options = {}) => {
  const {
    width,
    height,
    fullPage,
    omitBackground,
    imageFormat,
    path,
    device
  } = options;
  const pool = BrowserPagePool.create();
  const page = await pool.acquire();

  // const browser = await puppeteer.launch();
  // const page = await browser.newPage();

  // If device provided, use the device settings. Otherwise set the viewport
  if (util.isString(device)) {
    const deviceConfig = devices[device];
    if(deviceConfig) {
      await page.emulate(deviceConfig);
    } else {
      console.warn(`The device ${device} is not supported. Use the default settings instead.`);
    }
  } else {
    await page.setViewport({
      width,
      height
    });
  }

  await page.goto(url);
  
  const imagePath = resolveImagePath(path, imageFormat);
  await page.screenshot({
    path: imagePath,
    type: imageFormat,
    fullPage,
    omitBackground
  });
  
  await pool.destroy();
};

module.exports = screenshot;
