var HLS = require('hls');
var Browser = require('browser');
var JST = require('./jst');

class Peer5Playback extends HLS {
    get name() {
        return 'hls';
    }

    constructor(options) {
        super(options);

        this.playlistXhr = null;
        this.fragmentXhr = null;

        // configs
        this.firstPlayStartPosition = peer5.getConfig('MEDIA_LIVE_START_POS') || 0;
        this.maxBufferLength = peer5.getConfig('MEDIA_MAXBUFFER') || 30;
    }

    addListeners() {
        super.addListeners();

        Clappr.Mediator.on(this.cid + ":error", (code, url, message) => this.onError(code, url, message));
        Clappr.Mediator.on(this.cid + ":requestplaylist", (instanceId, url, callbackLoaded, callbackFailure) => this.onPlaylistRequest(instanceId, url, callbackLoaded, callbackFailure));
        Clappr.Mediator.on(this.cid + ":abortplaylist", (instanceId) => this.onPlaylistAbort(instanceId));
        Clappr.Mediator.on(this.cid + ":requestfragment", (instanceId, url, callbackLoaded, callbackFailure) => this.onFragmentRequest(instanceId, url, callbackLoaded, callbackFailure));
        Clappr.Mediator.on(this.cid + ":abortfragment", (instanceId) => this.onFragmentAbort(instanceId));
    }

    stopListening() {
        super.stopListening();

        Clappr.Mediator.off(this.cid + ":error");
        Clappr.Mediator.off(this.cid + ":requestplaylist");
        Clappr.Mediator.off(this.cid + ":abortplaylist");
        Clappr.Mediator.off(this.cid + ":requestfragment");
        Clappr.Mediator.off(this.cid + ":abortfragment");
    }

    onError(code, url, message) {
        console.error('flashls error:', code, url, message);
    }

    onPlaylistRequest(instanceId, url, callbackLoaded, callbackFailure) {
        var _this = this;

        // prepare request
        this.playlistXhr = new peer5.Request();
        this.playlistXhr.open("GET", url);
        this.playlistXhr.responseType = 'text';

        this.playlistXhr.onload = function(e) {
            if (!e.currentTarget.response) {
                return _this.el[callbackFailure]();
            }

            _this.playlistXhr = null;
            return _this.el[callbackLoaded](e.currentTarget.response);
        };

        // error handlers
        this.playlistXhr.onerror = this.playlistXhr.onabort = function(e) {
            _this.playlistXhr = null;
            return _this.el[callbackFailure]();
        };

        this.playlistXhr.send();
    }

    onPlaylistAbort(instanceId) {
        if (this.playlistXhr) {
            this.playlistXhr.abort();
        }
    }

    onFragmentRequest(instanceId, url, callbackLoaded, callbackFailure) {
        var _this = this;

        // prepare request
        this.fragmentXhr = new peer5.Request();
        this.fragmentXhr.open("GET", url);
        this.fragmentXhr.responseType = 'arraybuffer';

        this.fragmentXhr.onload = function(e) {
            if (!e.currentTarget.response) {
                return _this.el[callbackFailure]();
            }

            var b64 = _this.arrayBufferToBase64(e.currentTarget.response);
            var len = e.currentTarget.response.byteLength;

            _this.fragmentXhr = null;
            return _this.el[callbackLoaded](b64, len);
        };

        // error handlers
        this.fragmentXhr.onerror = this.fragmentXhr.onabort = function(e) {
            _this.fragmentXhr = null;
            return _this.el[callbackFailure]();
        };

        this.fragmentXhr.send();
    }

    onFragmentAbort(instanceId) {
        if (this.fragmentXhr) {
            this.fragmentXhr.abort();
        }
    }

    arrayBufferToBase64(arrayBuffer) {
        var bytes = new Uint8Array(arrayBuffer);
        var binary = '';
        for (var i = 0, length = bytes.length; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    setFlashSettings() {
        super.setFlashSettings();

        // enable support for flashls JS Loader
        this.el.playerSetJSURLStream(true);
        this.el.playerSetmaxBufferLength(this.maxBufferLength);
    }

    firstPlay() {
        this.setFlashSettings(); //ensure flushLiveURLCache will work (#327)
        this.el.playerLoad(this.src);
        Clappr.Mediator.once(this.cid + ":manifestloaded", () => this.el.playerPlay(this.firstPlayStartPosition));
        this.srcLoaded = true;
    }
}

Peer5Playback.canPlay = function(resource, mimeType) {
    return (typeof peer5 !== 'undefined') && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*).m3u8?/) || mimeType === "application/x-mpegURL");
};


module.exports = window.Peer5Playback = Peer5Playback;
