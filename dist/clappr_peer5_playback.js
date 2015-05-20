(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var HLS = require('hls');
var Browser = require('browser');
var JST = require('./jst');

var ClapprPeer5Playback = (function (_HLS) {
    function ClapprPeer5Playback(options) {
        _classCallCheck(this, ClapprPeer5Playback);

        _get(Object.getPrototypeOf(ClapprPeer5Playback.prototype), 'constructor', this).call(this, options);

        this.playlistXhr = null;
        this.fragmentXhr = null;
    }

    _inherits(ClapprPeer5Playback, _HLS);

    _createClass(ClapprPeer5Playback, [{
        key: 'name',
        get: function () {
            return 'hls';
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this2 = this;

            _get(Object.getPrototypeOf(ClapprPeer5Playback.prototype), 'addListeners', this).call(this);

            Clappr.Mediator.on(this.cid + ':error', function (data) {
                return _this2.onError(data.code, data.url, data.message);
            });
            Clappr.Mediator.on(this.cid + ':playlistrequest', function (data) {
                return _this2.onPlaylistRequest(data.objectId, data.url, data.callbackLoaded, data.callbackFailure);
            });
            Clappr.Mediator.on(this.cid + ':playlistabort', function (objectId) {
                return _this2.onPlaylistAbort(objectId);
            });
            Clappr.Mediator.on(this.cid + ':fragmentrequest', function (data) {
                return _this2.onFragmentRequest(data.objectId, data.url, data.callbackLoaded, data.callbackFailure);
            });
            Clappr.Mediator.on(this.cid + ':fragmentabort', function (objectId) {
                return _this2.onFragmentAbort(objectId);
            });
        }
    }, {
        key: 'stopListening',
        value: function stopListening() {
            _get(Object.getPrototypeOf(ClapprPeer5Playback.prototype), 'stopListening', this).call(this);

            Clappr.Mediator.off(this.cid + ':requestplaylist');
            Clappr.Mediator.off(this.cid + ':abortplaylist');
            Clappr.Mediator.off(this.cid + ':requestfragment');
            Clappr.Mediator.off(this.cid + ':abortfragment');
        }
    }, {
        key: 'onError',
        value: function onError(code, url, message) {
            console.error('flashls error:', code, url, message);
        }
    }, {
        key: 'onPlaylistRequest',
        value: function onPlaylistRequest(objectId, url, callbackLoaded, callbackFailure) {
            var _this = this;

            // prepare request
            this.playlistXhr = new peer5.Request();
            this.playlistXhr.open('GET', url);
            this.playlistXhr.responseType = 'text';

            this.playlistXhr.onload = function (e) {
                if (!e.currentTarget.response) {
                    return _this.el[callbackFailure]();
                }

                return _this.el[callbackLoaded](e.currentTarget.response);
            };

            // error handlers
            this.playlistXhr.onerror = this.playlistXhr.onabort = function (e) {
                return _this.el[callbackFailure]();
            };

            this.playlistXhr.send();
        }
    }, {
        key: 'onPlaylistAbort',
        value: function onPlaylistAbort(objectId) {
            if (this.playlistXhr) {
                this.playlistXhr.abort();
            }
        }
    }, {
        key: 'onFragmentRequest',
        value: function onFragmentRequest(objectId, url, callbackLoaded, callbackFailure) {
            var _this = this;

            // prepare request
            this.fragmentXhr = new peer5.Request();
            this.fragmentXhr.open('GET', url);
            this.fragmentXhr.responseType = 'arraybuffer';

            this.fragmentXhr.onload = function (e) {
                if (!e.currentTarget.response) {
                    return _this.el[callbackFailure]();
                }

                var b64 = _this.arrayBufferToBase64(e.currentTarget.response);
                var len = e.currentTarget.response.byteLength;

                return _this.el[callbackLoaded](b64, len);
            };

            // error handlers
            this.fragmentXhr.onerror = this.fragmentXhr.onabort = function (e) {
                _this.el[callbackFailure]();
            };

            this.fragmentXhr.send();
        }
    }, {
        key: 'arrayBufferToBase64',
        value: function arrayBufferToBase64(arrayBuffer) {
            var bytes = new Uint8Array(arrayBuffer);
            var binary = '';
            for (var i = 0, length = bytes.length; i < length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            return window.btoa(binary);
        }
    }, {
        key: 'onFragmentAbort',
        value: function onFragmentAbort(objectId) {
            if (this.fragmentXhr) {
                this.fragmentXhr.abort();
            }
        }
    }, {
        key: 'setFlashSettings',
        value: function setFlashSettings() {
            _get(Object.getPrototypeOf(ClapprPeer5Playback.prototype), 'setFlashSettings', this).call(this);

            // enable support for flashls JS Loader
            this.el.playerSetJSURLStream(true);
        }
    }]);

    return ClapprPeer5Playback;
})(HLS);

ClapprPeer5Playback.canPlay = function (resource) {
    return typeof peer5 !== 'undefined' && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*).m3u8?/) || mimeType === 'application/x-mpegURL');
};

module.exports = window.ClapprPeer5Playback = ClapprPeer5Playback;

},{"./jst":2,"browser":"browser","hls":"hls"}],2:[function(require,module,exports){
//This file is generated by bin/hook.js
'use strict';

var template = require('template');
module.exports = {

  CSS: {}
};

},{"template":"template"}]},{},[1]);