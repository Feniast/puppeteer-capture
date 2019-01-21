const device = require('../actions/device');

exports.command = 'device';

exports.describe = 'Show the list of supported devices which puppeteer can emulate';

exports.builder = {
  
};

exports.handler = function () {
  return device.list();
}
