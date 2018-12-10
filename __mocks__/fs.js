'use strict';

const fs = jest.genMockFromModule('fs');

let fileExists = false;

fs.__setFileExists__ = (exists) => { fileExists = exists; }

fs.existsSync = (path) => fileExists;

fs.mkdirSync = (path) => {}

module.exports = fs;
