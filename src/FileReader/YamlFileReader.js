const BaseFileReader = require('./BaseFileReader');
const yaml = require('js-yaml');
const { readFileSync } = require('fs');

class YamlFileReader extends BaseFileReader {
  /**
   * Returns config from file
   * @returns {*}
   */
  read() {
    return yaml.load(readFileSync(this._file));
  }
}

module.exports = YamlFileReader;
