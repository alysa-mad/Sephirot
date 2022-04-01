/* eslint-disable max-len */
// Imports
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const log = require('./debug');
const fs = require('fs');

exports.configLoad = function(configPath, defaultConfig) {
  try {
    if (fs.existsSync(configPath)) {
      log.debug('debug', 'Config file found, loading...');
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } else {
      log.debug('debug', 'Config file not found, creating a default one...');
      try {
        fs.writeFileSync('config.json', JSON.stringify(defaultConfig, null, 4), 'utf8');
        return defaultConfig;
      } catch (e) {
        log.debug('error', 'Cannot write config file ', e);
      }
    };
  } catch (e) {
    log.debug('error', 'Cannot read config file ', e);
  };
};
