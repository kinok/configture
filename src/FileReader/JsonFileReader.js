const BaseFileReader = require('./BaseFileReader');
const { realpathSync } = require('fs');

class JsonFileReader extends BaseFileReader {
  /**
   * Returns config from file
   * @returns {*}
   */
  read() {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    return require(realpathSync(this._file));
  }
}

module.exports = JsonFileReader;
