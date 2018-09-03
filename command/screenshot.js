const path = require('path');
const fs = require('fs');
const dayjs = require('dayjs');
const devices = require('puppeteer/DeviceDescriptors');
const util = require('../tool/util');
const BrowserPagePool = require('../tool/browserPagePool');

/**
 * get the default image name according to the file extension provided
 * @param {String} ext 
 */
const defaultImageName = ext => {
  const dateStr = dayjs().format('YYYYMMDDHHmmssSSS');
  return `screenshot-${dateStr}.${ext}`;
}

/**
 * normalize the image path 
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
  }
  else if (!util.isSupportedScreenshotFormat(extName.slice(1))){
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
}

const screenshot = async (url, options = {}) => {
  const {
    width,
    height,
    fullPage,
    omitBackground,
    imageFormat,
    dest,
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
  
  const imagePath = resolveImagePath(dest, imageFormat);
  const newImageFormat = resolveImageFormat(imagePath);
  await page.screenshot({
    path: imagePath,
    type: newImageFormat,
    fullPage,
    omitBackground
  });
  
  await pool.destroy();
};

module.exports = screenshot;
