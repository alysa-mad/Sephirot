/* eslint-disable max-len */
const express = require('express');
const app = express();
// eslint-disable-next-line no-unused-vars
const colors = require('colors');
const fs = require('fs');
const Peer = require('./local_modules/Peer');
const EncodeConfig = require('./local_modules/EncodeConfig');
const Torrent = require('./local_modules/Torrent');
const defaultConfig = {
  interval: '300',
  tracker_id: 'thatsitwhatyoulookinghere',
  port: 9797,
};

const configPath = 'config.json';
try {
  if (fs.existsSync(configPath)) {
    console.log('[debug]'.green, 'Config file found, loading...');
    // eslint-disable-next-line no-var
    var localConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else {
    console.log('[debug]'.green, 'Config file not found, creating a default one...');
    // eslint-disable-next-line no-var
    var localConfig = defaultConfig;
    try {
      fs.writeFileSync('config.json', JSON.stringify(defaultConfig, null, 4), 'utf8');
    } catch (e) {
      console.error('[error]'.red, 'Cannot write config file ', e);
    }
  };
} catch (e) {
  console.error('[error]'.red, 'Cannot read config file ', e);
};

app.use(
    express.urlencoded({
      extended: true,
    }));

app.use(express.json());


const torrents = [];

setInterval(() => {
  torrents.forEach((torrent) => {
    torrent.loaded = [];
  });
}, 15000);
setInterval(() => {
  console.log('[debug]'.green, 'clearing peer list.');
  torrents.forEach((torrent) => {
    torrent.peers = [];
  });
}, 900000);
app.get('/announce', (req, res) => {
  const getRequest = req;
  let loadedTorrent;
  torrents.forEach((torrent) => {
    if (torrent.infoHash === getRequest['query'].info_hash) {
      loadedTorrent = torrent;
    }
  });
  if (loadedTorrent === undefined) {
    console.log('[debug]'.green, 'torrent data not found, creating...');
    loadedTorrent = new Torrent(getRequest['query'].info_hash).get();
    torrents.push(loadedTorrent);
  }
  if (loadedTorrent.loaded.includes(getRequest['query'].peer_id)) {} else {
    const ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    const peers = loadedTorrent.peers;
    let peerCreate = true;
    peers.forEach((peer) => {
      if (peer.ip == ip.split('::ffff:').pop()) {
        peerCreate = false;
      };
    });
    if (peerCreate) peers.push(new Peer(getRequest['query'].peer_id, ip.split('::ffff:').pop(), getRequest['query'].port).get());
    peerCreate = true;

    /* console.log(getRequest['query']); */

    const pp = [];
    pp.push('l');
    if (getRequest['query'].left == 0 && loadedTorrent.data.complete.includes(getRequest['query'].peer_id) == false) {
      loadedTorrent.data.complete.push(getRequest['query'].peer_id);
      if (loadedTorrent.data.incomplete.includes(getRequest['query'].peer_id)) {
        if (loadedTorrent.data.incomplete.indexOf(getRequest['query'].peer_id) != -1) {
          delete loadedTorrent.data.incomplete[loadedTorrent.data.incomplete.indexOf(getRequest['query'].peer_id)];
        }
      }
    } else if (getRequest['query'].left != 0 && loadedTorrent.data.incomplete.includes(getRequest['query'].peer_id) == false) {
      loadedTorrent.data.incomplete.push(getRequest['query'].peer_id);
      if (loadedTorrent.data.complete.includes(getRequest['query'].peer_id)) {
        if (loadedTorrent.data.complete.indexOf(getRequest['query'].peer_id) != -1) {
          delete loadedTorrent.data.complete[loadedTorrent.data.complete.indexOf(getRequest['query'].peer_id)];
        }
      }
    }
    const trackerIncomplete = loadedTorrent.data.incomplete.length;
    const trackerComplete = loadedTorrent.data.complete.length;
    peers.forEach((peer) => {
      if (peer.ip.includes(':')) {
        peer.ip = peer.ip.split(':').join('');
      }
      stDict = 'd';
      proc = stDict + '2' + ':' + 'ip' + peer.ip.length + ':' + peer.ip + '7' + ':' + 'peer id' + peer.peerId.length + ':' + peer.peerId + '4' + ':' + 'port' + 'i' + peer.port + 'e' + 'e';
      pp.push(proc);
    });
    pp.push('e');
    const processedPeers = pp.join('');
    const config = new EncodeConfig(localConfig.interval, localConfig.tracker_id, trackerComplete, trackerIncomplete, processedPeers);
    encodedResponse = config.encode();
    console.log('______________________________');
    const infoHash = loadedTorrent.infoHash.replace('~', '7e').split('%').join('');
    console.log('[torrent] infoHash:'.red, infoHash);
    console.log('[connection]'.yellow, 'connection called by peer:', getRequest['query'].peer_id, '|', 'complete:', trackerComplete, '|', 'incomplete:', trackerIncomplete, '|', 'peers:', peers.length, '|');
    loadedTorrent.loaded.push(getRequest['query'].peer_id);
    torrents.forEach((torrent) => {
      if (torrent.infoHash === getRequest['query'].info_hash) {
        torrent.peers=peers;
      }
    });
    console.log('[connection]'.yellow, 'response:', encodedResponse);
    console.log('______________________________');
    res.send(encodedResponse);
  }
});

app.listen(localConfig.port, (e) => {
  if (e) {
    console.error('[error]'.red, 'tracker failed to start.', e);
  } console.log('[debug]'.green, 'tracker started successfully and it\'s listening to requests...');
});
