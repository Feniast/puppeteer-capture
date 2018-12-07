const device = require('../command/device');

exports.command = 'device';

exports.describe = 'Show the list of supported devices which puppeteer can emulate';

exports.builder = {
  
};

exports.handler = function (argv) {
  return device.list();
}
