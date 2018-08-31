const puppteer = require('puppeteer');
const dayjs = require('dayjs');
const util = require('../util');
const fs = require('fs');
const path = require('path');

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
    path
  } = options;
  const browser = await puppteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  await page.setViewport({
    width,
    height
  });
  const imagePath = resolveImagePath(path, imageFormat);
  await page.screenshot({
    path: imagePath,
    type: imageFormat,
    fullPage,
    omitBackground
  });

  await browser.close();
};

module.exports = screenshot;
