const devices = require('puppeteer/DeviceDescriptors');

const showDeviceList = () => {
  const deviceNames = devices.map(d => d.name);
  console.log(deviceNames.join('\n'));
  return deviceNames;
}

module.exports = {
  list: showDeviceList
};
