(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var HLS = require('hls');
var Browser = require('browser');
var JST = require('./jst');

var Peer5Playback = (function (_HLS) {
    function Peer5Playback(options) {
        _classCallCheck(this, Peer5Playback);

        _get(Object.getPrototypeOf(Peer5Playback.prototype), 'constructor', this).call(this, options);

        this.playlistXhr = null;
        this.fragmentXhr = null;

        // configs
        this.firstPlayStartPosition = peer5.getConfig('MEDIA_LIVE_START_POS') || 0;
        this.maxBufferLength = peer5.getConfig('MEDIA_MAXBUFFER') || 30;
    }

    _inherits(Peer5Playback, _HLS);

    _createClass(Peer5Playback, [{
        key: 'name',
        get: function () {
            return 'hls';
        }
    }, {
        key: 'addListeners',
        value: function addListeners() {
            var _this2 = this;

            _get(Object.getPrototypeOf(Peer5Playback.prototype), 'addListeners', this).call(this);

            Clappr.Mediator.on(this.cid + ':error', function (code, url, message) {
                return _this2.onError(code, url, message);
            });
            Clappr.Mediator.on(this.cid + ':requestplaylist', function (instanceId, url, callbackLoaded, callbackFailure) {
                return _this2.onPlaylistRequest(instanceId, url, callbackLoaded, callbackFailure);
            });
            Clappr.Mediator.on(this.cid + ':abortplaylist', function (instanceId) {
                return _this2.onPlaylistAbort(instanceId);
            });
            Clappr.Mediator.on(this.cid + ':requestfragment', function (instanceId, url, callbackLoaded, callbackFailure) {
                return _this2.onFragmentRequest(instanceId, url, callbackLoaded, callbackFailure);
            });
            Clappr.Mediator.on(this.cid + ':abortfragment', function (instanceId) {
                return _this2.onFragmentAbort(instanceId);
            });
        }
    }, {
        key: 'stopListening',
        value: function stopListening() {
            _get(Object.getPrototypeOf(Peer5Playback.prototype), 'stopListening', this).call(this);

            Clappr.Mediator.off(this.cid + ':error');
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
        value: function onPlaylistRequest(instanceId, url, callbackLoaded, callbackFailure) {
            var _this = this;

            // prepare request
            this.playlistXhr = new peer5.Request();
            this.playlistXhr.open('GET', url);
            this.playlistXhr.responseType = 'text';

            this.playlistXhr.onload = function (e) {
                if (!e.currentTarget.response) {
                    _this.playlistXhr = null;
                    return _this.el[callbackFailure] && _this.el[callbackFailure]();
                }

                _this.playlistXhr = null;
                return _this.el[callbackLoaded] && _this.el[callbackLoaded](e.currentTarget.response);
            };

            // error handlers
            this.playlistXhr.onerror = this.playlistXhr.onabort = function (e) {
                _this.playlistXhr = null;
                return _this.el[callbackFailure] && _this.el[callbackFailure]();
            };

            this.playlistXhr.send();
        }
    }, {
        key: 'onPlaylistAbort',
        value: function onPlaylistAbort(instanceId) {
            if (this.playlistXhr) {
                this.playlistXhr.onabort = null;
                this.playlistXhr.abort();
            }
        }
    }, {
        key: 'onFragmentRequest',
        value: function onFragmentRequest(instanceId, url, callbackLoaded, callbackFailure) {
            var _this = this;

            // prepare request
            this.fragmentXhr = new peer5.Request();
            this.fragmentXhr.open('GET', url);
            this.fragmentXhr.responseType = 'arraybuffer';

            this.fragmentXhr.onload = function (e) {
                if (!e.currentTarget.response) {
                    _this.fragmentXhr = null;
                    return _this.el[callbackFailure] && _this.el[callbackFailure]();
                }

                var b64 = _this.arrayBufferToBase64(e.currentTarget.response);
                var len = e.currentTarget.response.byteLength;

                _this.fragmentXhr = null;
                return _this.el[callbackLoaded] && _this.el[callbackLoaded](b64, len);
            };

            // error handlers
            this.fragmentXhr.onerror = this.fragmentXhr.onabort = function (e) {
                _this.fragmentXhr = null;
                return _this.el[callbackFailure] && _this.el[callbackFailure]();
            };

            this.fragmentXhr.send();
        }
    }, {
        key: 'onFragmentAbort',
        value: function onFragmentAbort(instanceId) {
            if (this.fragmentXhr) {
                this.fragmentXhr.onabort = null;
                this.fragmentXhr.abort();
            }
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
        key: 'setFlashSettings',
        value: function setFlashSettings() {
            _get(Object.getPrototypeOf(Peer5Playback.prototype), 'setFlashSettings', this).call(this);

            // enable support for flashls JS Loader
            this.el.playerSetJSURLStream(true);
            this.el.playerSetmaxBufferLength(this.maxBufferLength);
        }
    }, {
        key: 'firstPlay',
        value: function firstPlay() {
            var _this3 = this;

            this.setFlashSettings(); //ensure flushLiveURLCache will work (#327)
            this.el.playerLoad(this.src);
            Clappr.Mediator.once(this.cid + ':manifestloaded', function () {
                return _this3.el.playerPlay(_this3.firstPlayStartPosition);
            });
            this.srcLoaded = true;
        }
    }]);

    return Peer5Playback;
})(HLS);

Peer5Playback.canPlay = function (resource, mimeType) {
    return typeof peer5 !== 'undefined' && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*).m3u8?/) || mimeType === 'application/x-mpegURL');
};

module.exports = window.Peer5Playback = Peer5Playback;

},{"./jst":2,"browser":"browser","hls":"hls"}],2:[function(require,module,exports){
//This file is generated by bin/hook.js
'use strict';

var template = require('template');
module.exports = {

  CSS: {}
};

},{"template":"template"}]},{},[1]);
