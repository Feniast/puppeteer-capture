const { logger, highlight } = require('../tool/logger');
const util = require('../tool/util');

exports.goToPage = async (page, url, { verbose, timeout, waitUntil } = {}) => {
  const startTime = Date.now();
  if (verbose) {
    logger.note('Prepare to load page %s.', highlight.url(url));
  }
  const fixedUrl = util.fixUrl(url);
  await page.goto(fixedUrl, { timeout, waitUntil });
  if (verbose) {
    logger.note(
      'Finish loading page %s. Take time %sms.',
      highlight.url(url),
      highlight.time(Date.now() - startTime)
    );
  }
};


/**
 * do something before and after the function
 * a time cost will be passed to the after function
 * @param {Function} fn 
 * @param {Function} beforeFn 
 * @param {Function} afterFn 
 */
exports.wrapFunc = async (fn, beforeFn, afterFn) => {
  const time = Date.now();
  if (beforeFn) beforeFn(time);
  const result = await fn();
  if (afterFn) afterFn(Date.now() - time);
  return result;
};