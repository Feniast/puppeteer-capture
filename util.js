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
  return str === 'jpeg' || str === 'png';
};

const isString = o => Object.prototype.toString.call(o) === '[object String]';

const isEmptyString = s => (s == null || s.trim() === '');

module.exports = {
  isStrNumber,
  parseInteger,
  isSupportedScreenshotFormat,
  isString,
  isEmptyString
};
