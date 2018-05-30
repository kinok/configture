const _ = require('lodash');
const fs = require('fs');
const { YamlFileReader, JsonFileReader } = require('./FileReader');

class Configture {
  /**
   * Constructor
   * @param path
   * @param prefixEnv
   * @param nodeEnv
   * @param deepRead
   */
  constructor({
    path = './config',
    prefixEnv = 'CONFIGTURE',
    nodeEnv,
    deepRead = false,
  }) {
    this._path = path;
    this._prefix = prefixEnv;
    this._nodeEnv = nodeEnv || process.env.NODE_ENV || 'default';
    this._deepRead = deepRead;
    this._removableCharactersRegex = /[-_\s]/gi;
  }

  /**
   * Load config files from given path
   * @param path
   * @returns {*}
   */
  load(path = null) {
    const config = {};
    const currentPath = path || this._path;
    const configFiles = fs.readdirSync(currentPath);

    _.forEach(configFiles, file => {
      const fullpath = `${currentPath}/${file}`;
      const fileStat = fs.statSync(fullpath);
      if (fileStat.isDirectory()) {
        /* istanbul ignore else */
        if (this._deepRead) {
          _.assign(config, { [file]: this.load(fullpath) });
        }
      } else {
        const Reader = Configture.getReader(fullpath);
        const reader = new Reader(fullpath);

        const allEnv = reader.read();
        const filename = this._getNormalizedFilename(file);
        if (this._nodeEnv !== 'default' && _.has(allEnv, this._nodeEnv)) {
          const part = _.defaultsDeep(allEnv[this._nodeEnv], allEnv.default);
          _.assign(config, { [filename]: part });
        } else {
          _.assign(config, { [filename]: allEnv.default });
        }
      }
    });

    return this._injectEnv(config);
  }

  /**
   * Get reader for input file
   * @param filename
   */
  static getReader(filename) {
    const extension = _.last(_.split(filename, '.'));
    switch (extension) {
      case 'yml':
      case 'yaml':
        return YamlFileReader;
      case 'json':
      default:
        return JsonFileReader;
    }
  }

  /**
   * Get filename without forbidden chararcters
   * @param file
   * @returns {*}
   * @private
   */
  _getNormalizedFilename(file) {
    const normalizedFilename = file.replace(this._removableCharactersRegex, '');
    return _.head(_.split(normalizedFilename, '.'));
  }

  /**
   * Inject environment variables
   * @param config
   * @param prefix
   * @param reference
   * @returns {Array|Object}
   * @private
   */
  _injectEnv(config, prefix = '', reference) {
    const currentConfig = reference || config;
    return _.forEach(config, (value, key) => {
      const prefixedKey = `${prefix}.${key}`;
      if (_.isObject(value) && !_.has(process.env, this._toEnv(prefixedKey))) {
        this._injectEnv(value, prefix === '' ? key : prefixedKey, config[key]);
      } else if (_.has(process.env, this._toEnv(prefixedKey))) {
        currentConfig[key] = process.env[this._toEnv(prefixedKey)];
      }
      return currentConfig;
    });
  }

  /**
   * Return given string to environment case
   * @param string
   * @returns {string}
   * @private
   */
  _toEnv(string) {
    const prefix = this._prefix ? `${this._prefix}_` : '';
    const upper = string.replace(/\./gi, '_').toUpperCase();
    return prefix + upper;
  }
}

module.exports = Configture;
