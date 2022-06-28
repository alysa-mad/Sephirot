/* eslint-disable max-len */
/**
 * Class for User.
 * @return {object} Return a object of a user.
 */
class User {
  /**
 * Parameters.
 * @param {string} hashId hash of user.
 * @param {string} ip peer ip.
 * @param {string} port peer connection port.
 * @param {string} downloaded downloaded bytes of the user.
 * @param {string} uploaded uploaded bytes of the user.
 */
  constructor(hashId, ip, port, downloaded, uploaded) {
    this.hashId = hashId;
    this.ip = ip;
    this.port = port;
    this.downloaded = downloaded;
    this.uploaded = uploaded;
  }
  /**
  * Parameters.
  * @return {object} get object data of object.
  */
  get() {
    const userGet = {
      'hashId': this.hashId,
      'ip': this.ip,
      'port': this.port,
      'port': this.downloaded,
      'port': this.uploaded,
    };
    return userGet;
  }
}

module.exports = User;
