#!/usr/bin/env node

const program = require('commander');

const util = require('./tool/util');

const screenshot = require('./command/screenshot');
const device = require('./command/device');

const exitProgram = (str) => {
  console.error(str);
  process.exit(1);
}

program
  .version('0.1.0', '-v, --version')
  .usage('[command] <options>');

program
  .command('device')
  .description('Show the list of supported devices which puppeteer can emulate')
  .action(() => {
    device.list();
  });

program
  .command('screenshot <url...>')
  .description('Take a screenshot of a web page')
  .option('-w, --width <number>', 'Viewport width in pixels', 800)
  .option('-l, --height <number>', 'Viewport height in pixels', 600)
  .option('-f, --full-page', 'Take a screenshot of full scrollable page. Defaults to false')
  .option('-o, --omit-background', 'Hides default white background and allows capturing screenshots with transparency. Defaults to false')
  .option('-i, --image-format <string>', 'Image format the screenshot uses', 'png')
  .option('-p, --path <string>', 'The file path to save the screenshot to. Defaults to current directory')
  .option('-d, --device <string>', 'The device to emulate, such as "iPhone 7"')
  .action((url, options) => {
    const width = util.parseInteger(options.width);
    if(isNaN(width)) {
      exitProgram(`The width '${options.width}' is not a valid number. Provide something like 1000, 2000, etc.`);
    }

    const height = util.parseInteger(options.height);
    if(isNaN(height)) {
      exitProgram(`The height '${options.height}' is not a valid number. Provide something like 1000, 2000, etc.`);
    }

    const imageFormat = options.imageFormat;
    // suppose jpg is same as jpeg
    if (imageFormat === 'jpg') imageFormat = 'jpeg';
    if(!util.isSupportedScreenshotFormat(imageFormat)) {
      exitProgram(`The image format '${imageFormat}' is not supported. Please use 'jpeg' or 'png'.`);
    }

    const fullPage = options.fullPage || false;
    const omitBackground = options.omitBackground || false;
    const path = options.path;
    const device = options.device;

    const screenshotOptions = {
      width,
      height,
      imageFormat,
      fullPage,
      omitBackground,
      path,
      device
    };

    screenshot(url[0], screenshotOptions).then(result => {

    }).catch(e => {
      console.error(e);
      exitProgram(e.message);
    }).finally(() => {
      // browserPagePool.close();
    });
  });

program
  .command('pdf <url>')
  .option('-p, --paper-format <string>', 'Paper format. Used in PDF mode. Defaults to "Letter"', 'Letter')
  .action((url, options) => {
    console.log(url, options);
  });

program
  .parse(process.argv);

if (!program.args.length) program.help();