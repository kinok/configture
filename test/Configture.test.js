require('should');
const Configture = require('../src/Configture');

describe('Configture', () => {
  const env = Object.assign({}, process.env);

  after(() => {
    process.env = env;
  });

  describe('.constructor()', () => {
    it('should return an instance of Configture', () => {
      const configture = new Configture({});
      configture.should.be.an.instanceof(Configture);
    });
  });

  describe('.load()', () => {
    it('should load config from simple json file', () => {
      const configture = new Configture({
        path: 'test/config/json',
      });
      const config = configture.load();

      config.test.json.should.be.True();
    });

    it('should load config from yaml files', () => {
      const configture = new Configture({
        path: 'test/config/yaml',
      });
      const config = configture.load();

      config.toto.yaml.should.be.True();
      config.test.yml.should.be.True();
    });

    it('should load config from json and/or yaml nested files', () => {
      const configture = new Configture({
        path: 'test/config',
        deepRead: true,
      });
      const config = configture.load();

      config.json.test.json.should.be.True();
      config.yaml.test.yml.should.be.True();
      config.yaml.toto.yaml.should.be.True();
    });

    it('should load config from simple json file from the right node env', () => {
      const configture = new Configture({
        nodeEnv: 'preprod',
        path: 'test/config/json',
      });
      const config = configture.load();

      config.test.json.should.be.deepEqual('works');
      config.test.randomValue.should.deepEqual(123);
    });

    it('should load config with overriden values from env', () => {
      process.env.CONFIGTURE_TEST_JSON = 'toto';
      const configture = new Configture({
        path: 'test/config/json',
      });

      const config = configture.load();
      config.test.json.should.deepEqual(process.env.CONFIGTURE_TEST_JSON);
    });

    it('should load config and get rid of env prefix', () => {
      process.env.TEST_JSON = 'titi';
      const configture = new Configture({
        prefixEnv: null,
        path: 'test/config/json',
      });

      const config = configture.load();
      config.test.json.should.deepEqual(process.env.TEST_JSON);
    });
  });
});
