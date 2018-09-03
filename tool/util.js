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

module.exports = {
  isStrNumber,
  parseInteger,
  isSupportedScreenshotFormat,
  isString,
  isEmptyString
};
