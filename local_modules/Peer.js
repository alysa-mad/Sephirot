/* eslint-disable max-len */
/**
 * Class for peer.
 * @return {object} Return a object of a peer.
 */
class Peer {
  /**
 * Parameters.
 * @param {string} peerId peer id.
 * @param {string} ip peer ip.
 * @param {string} port peer connection port.
 */
  constructor(peerId, ip, port) {
    this.peerId = peerId;
    this.ip = ip;
    this.port = port;
  }
  /**
  * Parameters.
  * @return {object} get object data of object.
  */
  get() {
    const peerGet = {
      'peerId': this.peerId,
      'ip': this.ip,
      'port': this.port,
    };
    return peerGet;
  }
}

module.exports = Peer;
