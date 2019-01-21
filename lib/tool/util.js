const path = require('path');
const fs = require('fs');
const GithubSlugger = require('github-slugger');

const slugger = new GithubSlugger();

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
 * @param {String} scheme
 */
const fixUrl = (str, scheme = 'http') => {
  let s = str;
  if (s.startsWith('//')) {
    return `${scheme}:${s}`;
  }
  if (!/^((https?|ftp):)?\/\//.test(s)) {
    s = `${scheme}://${s}`;
  }
  return s;
}

/**
 * Remove the empty key-value pair from the target object. 
 * The key with value **undefined** or **null** will be removed from the object.
 * @param {Object} obj 
 * @returns A new object. shallow copy
 */
const removeEmptyValues = obj => {
  if (obj == null || typeof obj !== 'object') return {};
  const newObj = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] != null) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

/**
 * Return a rejected promise when the task timeout
 * @param {Promise} task 
 * @param {number} timeout 
 */
const failWhenTimeout = (task, timeout = 5000) => {
  const timeoutPromise = new Promise(function(resolve, reject) {
    setTimeout(function() {
      reject(new Error('timeout'));
    }, timeout);
  });
  return Promise.race([task, timeoutPromise]);
}

/**
 * Filter the unique values in the array
 * @param {Array} array 
 */
const filterUnique = array => {
  if(!Array.isArray(array)) return [];
  return [...new Set(array)];
}

/**
 * Turn the value into an array when it's not an array
 * @param {any} value 
 */
const toArray = (value) => {
  return Array.isArray(value) ? value : [value];
}


/**
 * resolve the directory, and create the directory if it doesn't exist
 * @param {String} dir
 */
const resolveDir = dir => {
  let newPath = dir;
  if (!isString(dir) || isEmptyString(dir)) {
    newPath = './';
  } else {
    newPath = dir.trim();
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
 * slugify a string
 * @param {String} str 
 */
const slugify = (str) => slugger.slug(str).replace(/-{2,}/g, '-');

module.exports = {
  isStrNumber,
  parseInteger,
  isSupportedScreenshotFormat,
  isString,
  isEmptyString,
  exitProgram,
  fixUrl,
  removeEmptyValues,
  failWhenTimeout,
  filterUnique,
  toArray,
  resolveDir,
  slugify
};
