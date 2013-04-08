var opbeat = require('../');
opbeat.parsers = require('../lib/parsers');

describe('opbeat.parsers', function () {
  describe('#parseText()', function () {
    it('should parse some text without kwargs', function () {
      var parsed = opbeat.parsers.parseText('Howdy');
      parsed['message'].should.equal('Howdy');
    });

    it('should parse some text with kwargs', function () {
      var parsed = opbeat.parsers.parseText('Howdy', {'foo': 'bar'});
      parsed['message'].should.equal('Howdy');
      parsed['foo'].should.equal('bar');
    });
  });

  describe('#parseRequest()', function () {
    it('should parse a request object', function () {
      var mockReq = {
        method: 'GET',
        url: '/some/path?key=value',
        headers: {
          host: 'mattrobenolt.com'
        },
        body: '',
        cookies: {},
        socket: {
          encrypted: true
        }
      };
      var parsed = opbeat.parsers.parseRequest(mockReq);
      parsed.should.have.property('http');
      parsed['http'].url.should.equal('https://mattrobenolt.com/some/path?key=value');
      parsed['http'].env.NODE_ENV.should.equal(process.env.NODE_ENV);
    });
  });

  describe('#parseError()', function () {
    it('should parse plain Error object', function (done) {
      opbeat.parsers.parseError(new Error(), {}, function (parsed) {
        parsed['message'].should.equal('Error: <no message>');
        parsed.should.have.property('exception');
        parsed['exception']['type'].should.equal('Error');
        parsed['exception']['value'].should.equal('');
        parsed.should.have.property('stacktrace');
        parsed['stacktrace'].should.have.property('frames');
        done();
      });
    });

    it('should parse Error with message', function (done) {
      opbeat.parsers.parseError(new Error('Crap'), {}, function (parsed) {
        parsed['message'].should.equal('Error: Crap');
        parsed.should.have.property('exception');
        parsed['exception']['type'].should.equal('Error');
        parsed['exception']['value'].should.equal('Crap');
        parsed.should.have.property('stacktrace');
        parsed['stacktrace'].should.have.property('frames');
        done();
      });
    });

    it('should parse TypeError with message', function (done) {
      opbeat.parsers.parseError(new TypeError('Crap'), {}, function (parsed) {
        parsed['message'].should.equal('TypeError: Crap');
        parsed.should.have.property('exception');
        parsed['exception']['type'].should.equal('TypeError');
        parsed['exception']['value'].should.equal('Crap');
        parsed.should.have.property('stacktrace');
        parsed['stacktrace'].should.have.property('frames');
        done();
      });
    });

    it('should parse thrown Error', function (done) {
      try {
        throw new Error('Derp');
      } catch(e) {
        opbeat.parsers.parseError(e, {}, function (parsed) {
          parsed['message'].should.equal('Error: Derp');
          parsed.should.have.property('exception');
          parsed['exception']['type'].should.equal('Error');
          parsed['exception']['value'].should.equal('Derp');
          parsed.should.have.property('stacktrace');
          parsed['stacktrace'].should.have.property('frames');
          done();
        });
      }
    });

    it('should parse caught real error', function (done) {
      try {
        var o = {};
        o['...']['Derp']();
      } catch(e) {
        opbeat.parsers.parseError(e, {}, function (parsed) {
          parsed['message'].should.equal('TypeError: Cannot call method \'Derp\' of undefined');
          parsed.should.have.property('exception');
          parsed['exception']['type'].should.equal('TypeError');
          parsed['exception']['value'].should.equal('Cannot call method \'Derp\' of undefined');
          parsed.should.have.property('stacktrace');
          parsed['stacktrace'].should.have.property('frames');
          done();
        });
      }
    });
  });
});
