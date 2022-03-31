/* eslint-disable max-len */

/**
 * Class for saving torrent data.
 * @return {object} Return a Torrent object.
 */
class Torrent {
  /**
 * Parameters.
 * @param {string} infoHash infohash from torrent.
 * @param {string} peers peers list.
 * @param {string} data extra data(if needed).
 * @param {string} loaded loaded peers.
 * @param {string} complete number of completed downloads.
 * @param {string} incomplete number of incomplete downloads.
 */
  constructor(infoHash=undefined, peers=[], data={}, loaded=[], complete=[], incomplete=[]) {
    this.infoHash = infoHash;
    this.peers = peers;
    this.data = {
      complete: complete,
      incomplete: incomplete,
    };
    this.loaded = loaded;
  }
  /**
  * Class for saving torrent data.
  * @return {object} Return a Torrent object.
  **/
  get() {
    return {infoHash: this.infoHash, peers: this.peers, data: this.data, loaded: this.loaded};
  }
};

module.exports = Torrent;
