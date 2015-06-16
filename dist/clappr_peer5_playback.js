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

        // configs
        this.firstPlayStartPosition = peer5.getConfig('MEDIA_LIVE_START_POS') || 0;
        this.maxBufferLength = peer5.getConfig('MEDIA_MAXBUFFER') || 30;
        this.native = peer5.getConfig('CLAPPR_NATIVE_FALLBACK') || false;
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
            _get(Object.getPrototypeOf(Peer5Playback.prototype), 'addListeners', this).call(this);

            Clappr.Mediator.on(this.cid + ':error', function (code, url, message) {
                return peer5.flashls.trigger('error', [code, url, message]);
            });
            Clappr.Mediator.on(this.cid + ':requestplaylist', function (instanceId, url, callbackLoaded, callbackFailure) {
                return peer5.flashls.trigger('requestPlaylist', [instanceId, url, callbackLoaded, callbackFailure]);
            });
            Clappr.Mediator.on(this.cid + ':abortplaylist', function (instanceId) {
                return peer5.flashls.trigger('abortPlaylist', [instanceId]);
            });
            Clappr.Mediator.on(this.cid + ':requestfragment', function (instanceId, url, callbackLoaded, callbackFailure) {
                return peer5.flashls.trigger('requestFragment'[(instanceId, url, callbackLoaded, callbackFailure)]);
            });
            Clappr.Mediator.on(this.cid + ':abortfragment', function (instanceId) {
                return peer5.flashls.trigger('abortFragment', [instanceId]);
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
            var _this = this;

            this.setFlashSettings(); //ensure flushLiveURLCache will work (#327)
            this.el.playerLoad(this.src);
            Clappr.Mediator.once(this.cid + ':manifestloaded', function () {
                return _this.el.playerPlay(_this.firstPlayStartPosition);
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
