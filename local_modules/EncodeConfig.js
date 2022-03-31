/* eslint-disable max-len */
/**
* encode config in bencode
* @return {object} return encoder object
*/
class EncodeConfig {
  /**
 * Parameters.
 * @param {string} interval interval for call tracker.
 * @param {string} trackerId tracker id.
 * @param {string} complete number of completed downloads.
 * @param {string} incomplete number of incomplete downloads.
 * @param {string} peers peers list.
 */
  constructor(interval='300', trackerId='thatsitwhatyoulookinghere', complete=0, incomplete=0, peers='le') {
    this.interval = interval;
    this.trackerId = trackerId;
    this.complete = complete;
    this.incomplete = incomplete;
    this.peers = peers;
  };
  /** encode config in bencode
* @return {object} return encoded config
*/
  encode() {
    const objConfig = 'd' + '8' + ':' + 'interval' + 'i' + this.interval + 'e' + '10' + ':' + 'tracker id' + this.trackerId.length + ':' + this.trackerId + '8' + ':' + 'complete' + 'i' + this.complete + 'e' + '10' + ':' + 'incomplete' + 'i' + this.incomplete + 'e' + '5' + ':' + 'peers' + this.peers + 'e';
    return objConfig;
  }
};

module.exports = EncodeConfig;
