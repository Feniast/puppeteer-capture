const { exitProgram } = require('../tool/util');
const screenshot = require('../command/screenshot');

const DEFAULT_TIMEOUT = 30000;

exports.command = 'screenshot <urls...>'

exports.describe = 'Take a screenshot of a web page'

exports.builder = {
  'w': {
    alias: 'width',
    type: 'number',
    default: 800,
    describe: 'Viewport width in pixels'
  },
  'l': {
    alias: 'height',
    type: 'number',
    default: 600,
    describe: 'Viewport height in pixels'
  },
  'f': {
    alias: 'full-page',
    type: 'boolean',
    describe: 'Take a screenshot of full scrollable page. Defaults to false'
  },
  'o': {
    alias: 'omit-background',
    type: 'boolean',
    describe: 'Hides default white background and allows capturing screenshots with transparency. Defaults to false'
  },
  'i': {
    alias: 'image-format',
    choices: ['jpeg', 'png'],
    default: 'png',
    describe: 'Image format the screenshot outputs'
  },
  'p': {
    alias: 'path',
    type: 'string',
    describe: 'The file path to save the screenshot to. Defaults to current directory'
  },
  'd': {
    alias: 'device',
    type: 'string',
    describe: 'The device to emulate, such as "iPhone 7"'
  },
  't': {
    alias: 'timeout',
    type: 'number',
    default: DEFAULT_TIMEOUT,
    describe: 'Maximum navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.'
  },
  'e': {
    alias: 'chrome-executable',
    type: 'string',
    describe: ' Path to a Chromium or Chrome executable to run instead of the bundled Chromium.'
  }
}

exports.handler = function (argv) {
  const {
    width,
    height,
    imageFormat,
    urls,
    fullPage = false,
    omitBackground = false,
    path: dest,
    device,
    chromeExecutable: executable
  } = argv;
  let { timeout } = argv; 
  if(isNaN(argv.width)) {
    exitProgram(`The width is not a valid number. Provide something like 1000, 2000, etc.`);
  }
  if(isNaN(argv.height)) {
    exitProgram(`The height is not a valid number. Provide something like 1000, 2000, etc.`);
  }
  if(isNaN(argv.timeout)) {
    console.warn(`The timeout is not a valid number. Use the defaults`);
    timeout = DEFAULT_TIMEOUT;
  }
  if(timeout < 0) timeout = 0;

  const screenshotOptions = {
    width,
    height,
    imageFormat,
    fullPage,
    omitBackground,
    dest,
    device,
    timeout,
    executable
  };

  screenshot(urls, screenshotOptions).catch(e => {
    exitProgram(e.message);
  });
  
}