const { exitProgram } = require('../tool/util');
const pdf = require('../actions/pdf');

exports.command = 'pdf <url>';

exports.describe = 'Generate pdf of target web page';

const DEFAULT_TIMEOUT = 30000;

exports.builder = {
  'w': {
    alias: 'width',
    type: 'string',
    describe: 'Paper width, accepts values labeled with units. Possible units: px, in, cm, mm.'
  },
  'l': {
    alias: 'height',
    type: 'string',
    describe: 'Paper height, accepts values labeled with units. Possible units: px, in, cm, mm.'
  },
  'display-header-footer': {
    type: 'boolean',
    describe: 'Display header and footer. Defaults to false.'
  },
  'print-bg': {
    type: 'boolean',
    describe: 'Print background graphics. Defaults to false.'
  },
  'use-screen': {
    type: 'boolean',
    describe: 'Use screen media instead of print media.'
  },
  'landscape': {
    type: 'boolean',
    describe: 'Paper orientation. Defaults to false.'
  },
  'f': {
    alias: 'format',
    type: 'string',
    describe: 'Paper format. If set, takes priority over width or height options.'
  },
  'm': {
    alias: 'margin',
    type: 'string',
    describe: 'Paper margins, defaults to none. CSS-style margin is allowed.'
  },
  'p': {
    alias: 'path',
    type: 'string',
    describe: 'The file path to save the PDF to. Defaults to current working directory with name of page title.'
  },
  't': {
    alias: 'timeout',
    type: 'number',
    default: DEFAULT_TIMEOUT,
    describe: 'Maximum page navigation time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.'
  },
  'e': {
    alias: 'chrome-executable',
    type: 'string',
    describe: 'Path to a Chromium or Chrome executable to run instead of the bundled Chromium.'
  },
  'v': {
    alias: 'verbose',
    type: 'boolean',
    describe: 'Output more detailed log info.'
  }
};

exports.handler = function (argv) {
  const {
    url,
    width,
    height,
    displayHeaderFooter = false,
    printBg = false,
    useScreen = false,
    landscape = false,
    format,
    margin,
    path,
    chromeExecutable: executable,
    verbose = false,
  } = argv;
  let { timeout } = argv; 
  if(isNaN(argv.timeout)) {
    console.warn(`The timeout is not a valid number. Use the defaults`);
    timeout = DEFAULT_TIMEOUT;
  }
  if(timeout < 0) timeout = 0;

  const pdfOptions = {
    width,
    height,
    displayHeaderFooter,
    printBg,
    useScreen,
    landscape,
    format,
    margin,
    dest: path,
    chromeExecutable: executable,
    verbose,
    timeout
  };

  pdf(url, pdfOptions).catch(err => {
    exitProgram(err);
  });
}
