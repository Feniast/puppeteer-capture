#!/usr/bin/env node

const yargs = require('yargs');

yargs.usage('Usage: $0 <command> [options]')
  .scriptName('pch')
  .commandDir('./lib/cmds')
  .example('$0 screenshot www.google.com www.github.com', 'Take screenshots for google and github')
  .demandCommand()
  .help('h')
  .alias('h', 'help')
  .alias('V', 'version')
  .wrap(120)
  .strict() // enforce unrecognized commands report as errors
  .argv;

