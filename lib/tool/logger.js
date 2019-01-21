const { Signale } = require('signale');
const chalk = require('chalk');

const logScope = 'pch';
const logger = new Signale({
  scope: logScope
});
logger.config({
  displayLabel: false
});

const highlight = {
  url: chalk.underline.blue,
  error: chalk.red,
  time: chalk.bold.green,
  output: chalk.cyan
}

module.exports = {
  logger,
  highlight
};
