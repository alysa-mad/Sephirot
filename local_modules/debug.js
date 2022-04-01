// Imports
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

exports.debug = function(type='debug', msg=String) {
  if (type === 'debug' && typeof(msg) == 'string') {
    console.log('[debug]'.green, msg);
  } else if (type === 'conn' && typeof(msg) == 'string') {
    console.log('[connection]'.yellow, msg);
  } else if (type === 'error' && typeof(msg) == 'string') {
    console.error('[error]'.red, msg);
  } else if (type === 'torrent' && typeof(msg) == 'string') {
    console.log('[torrent]'.red, msg);
  } else {
    console.error('[error]'.red, 'bad use of debug function');
  }
};
