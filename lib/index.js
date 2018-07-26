'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var processor = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(data) {
    var file, url, filePath, base64Str, mimeType;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            file = data.file;
            url = data.url;

            if (!(url[0] === '.' || url[0] === '/' && url[1] !== '/')) {
              _context.next = 14;
              break;
            }

            filePath = _path2.default.resolve(_path2.default.dirname(file), url);
            base64Str = '';
            _context.prev = 5;

            base64Str = _fs2.default.readFileSync(filePath).toString('base64');
            _context.next = 12;
            break;

          case 9:
            _context.prev = 9;
            _context.t0 = _context['catch'](5);
            return _context.abrupt('return', data);

          case 12:
            mimeType = _mime2.default.getType(filePath);

            data.url = 'data:' + mimeType + ';base64,' + base64Str;

          case 14:
            return _context.abrupt('return', data);

          case 15:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[5, 9]]);
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

var URLResolver = function () {
  function URLResolver() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    (0, _classCallCheck3.default)(this, URLResolver);
    this.setting = {
      re: /url\((["']?)(.*?)(\1)\)/g
    };

    (0, _assign2.default)(this.setting, options);
  }

  (0, _createClass3.default)(URLResolver, [{
    key: 'apply',
    value: function () {
      var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(op) {
        var re, type, file, code, urls, match, url, quoteIndex, hashIndex, suffixIndex, urlSuffix, processed;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                re = this.setting.re;
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
                  _context2.next = 22;
                  break;
                }

                match = re.exec(code);

                if (match) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt('break', 22);

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

                urls.push({
                  file: file,
                  string: match[0],
                  quote: match[1],
                  url: url,
                  suffix: urlSuffix
                });
                _context2.next = 7;
                break;

              case 22:
                _context2.next = 24;
                return _promise2.default.all(urls.map(processor));

              case 24:
                processed = _context2.sent;


                processed.forEach(function (url) {
                  code = code.replace(url.string, 'url(' + url.quote + url.url + url.suffix + url.quote + ')');
                });

                op.code = code;

                return _context2.abrupt('return', op.next());

              case 28:
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
