'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var processor = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
    var file, url, filePath, content, mimeType;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            file = data.file;
            url = data.url;

            if (!isFilePath(url)) {
              _context.next = 17;
              break;
            }

            filePath = _path2.default.isAbsolute(url) ? url : _path2.default.resolve(_path2.default.dirname(file), url);


            filePath = _path2.default.normalize(filePath);

            content = '';
            _context.prev = 6;
            _context.next = 9;
            return readFile(filePath, 500);

          case 9:
            content = _context.sent;
            _context.next = 15;
            break;

          case 12:
            _context.prev = 12;
            _context.t0 = _context['catch'](6);
            return _context.abrupt('return', data);

          case 15:
            mimeType = _mime2.default.getType(filePath);

            data.url = 'data:' + mimeType + ';base64,' + base64Str.toString('base64');

          case 17:
            return _context.abrupt('return', data);

          case 18:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[6, 12]]);
  }));

  return function processor(_x) {
    return _ref.apply(this, arguments);
  };
}();

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function readFile(file, timeout) {
  var startTime = Date.now();
  var content = '';
  return new _promise2.default(function (resolve, reject) {
    (function readFile() {
      try {
        content = _fs2.default.readFileSync(file);
      } catch (err) {}

      if (content.length) {
        return resolve(content);
      }

      if (Date.now() - startTime > timeout) {
        reject(new Error('timeout'));
      }

      process.nextTick(readFile);
    })();
  });
}

function isFilePath(url) {
  if (protocolRelative(url)) {
    return false;
  }

  url = url.replace(/\\/g, '/');

  if (_path2.default.isAbsolute(url)) {
    return true;
  }

  if (url[0] === '.' || url[0] === '/') {
    return true;
  }

  return false;
}

function protocolRelative(url) {
  return url[0] === '/' && url[1] === '/';
}

function replaceAlias(path, alias) {
  (0, _keys2.default)(alias).forEach(function (str) {
    if (path.indexOf(str) === 0) {
      path = alias[str] + '/' + path.slice(str.length);
    }
  });

  return path;
}

var URLResolver = function () {
  function URLResolver() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, URLResolver);
    this.setting = {
      re: /url\((["']?)(.*?)(\1)\)/g,
      alias: {
        '@': _path2.default.join(process.cwd(), 'src')
      }
    };

    (0, _assign2.default)(this.setting, options);
  }

  (0, _createClass3.default)(URLResolver, [{
    key: 'apply',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(op) {
        var _setting, re, alias, type, file, code, urls, match, url, quoteIndex, hashIndex, suffixIndex, urlSuffix, processed;

        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _setting = this.setting, re = _setting.re, alias = _setting.alias;
                type = op.type, file = op.file;
                code = op.code;

                if (!(!code || type !== 'css')) {
                  _context2.next = 5;
                  break;
                }

                return _context2.abrupt('return', op.next());

              case 5:
                urls = [];
                match = void 0;

              case 7:
                if (!true) {
                  _context2.next = 23;
                  break;
                }

                match = re.exec(code);

                if (match) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt('break', 23);

              case 11:
                url = match[2];
                quoteIndex = url.indexOf('?');
                hashIndex = url.indexOf('#');
                suffixIndex = url.length;

                if (quoteIndex !== -1) {
                  suffixIndex = Math.min(suffixIndex, quoteIndex);
                }
                if (hashIndex !== -1) {
                  suffixIndex = Math.min(suffixIndex, hashIndex);
                }

                urlSuffix = url.slice(suffixIndex);

                url = url.slice(0, suffixIndex);

                url = replaceAlias(url, alias);

                urls.push({
                  file: file,
                  string: match[0],
                  quote: match[1],
                  url: url,
                  suffix: urlSuffix
                });
                _context2.next = 7;
                break;

              case 23:
                _context2.next = 25;
                return new _promise2.default(function (resolve) {
                  return process.nextTick(resolve);
                });

              case 25:
                _context2.next = 27;
                return _promise2.default.all(urls.map(processor));

              case 27:
                processed = _context2.sent;


                processed.forEach(function (url) {
                  code = code.replace(url.string, 'url(' + url.quote + url.url + url.suffix + url.quote + ')');
                });

                op.code = code;

                return _context2.abrupt('return', op.next());

              case 31:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function apply(_x3) {
        return _ref2.apply(this, arguments);
      }

      return apply;
    }()
  }]);
  return URLResolver;
}();

exports.default = URLResolver;
module.exports = exports['default'];
