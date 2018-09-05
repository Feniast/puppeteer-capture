#!/usr/bin/env node

const yargs = require('yargs');

yargs.usage('Usage: $0 <command> [options]')
  .scriptName('puppeteer-capture-helper')
  .commandDir('./cmds')
  .demandCommand()
  .help('h')
  .alias('h', 'help')
  .alias('v', 'version')
  .wrap(120)
  .strict() // enforce unrecognized commands report as errors
  .argv;

