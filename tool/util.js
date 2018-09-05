/**
 * check if a string is number
 * @param {String} string
 * @returns {Boolean}
 */
const isStrNumber = string => /^\d+(\.\d*)?$/.test(string);

/**
 * convert a string to a integer
 * @param {String} str
 * @returns {(Number | NaN)}
 */
const parseInteger = str => {
  if (!isStrNumber(str)) {
    return NaN;
  }
  return parseInt(str);
};

/**
 * check if the provided format is supported
 * @param {String} str
 */
const isSupportedScreenshotFormat = str => {
  return str === 'jpeg' || str === 'jpg' || str === 'png';
};

/**
 * check if something is a string
 * @param {any} o 
 */
const isString = o => Object.prototype.toString.call(o) === '[object String]';

/**
 * check if a string is empty
 * @param {String} s 
 */
const isEmptyString = s => (s == null || s.trim() === '');

/**
 * exit the process with the error message
 * @param {String} str 
 */
const exitProgram = (str) => {
  console.error(str);
  process.exit(1);
}

/**
 * add required prefix to the url so that puppeteer can go to the url successfully
 * WARNING: this function cannot fix a wrong url or a non-existent url
 * @param {String} str 
 */
const fixUrl = str => {
  let s = str;
  if (!/^((https?|ftp):)?\/\//.test(s)) {
    s = '//' + str;
  }
  return s;
}


module.exports = {
  isStrNumber,
  parseInteger,
  isSupportedScreenshotFormat,
  isString,
  isEmptyString,
  exitProgram,
  fixUrl
};
