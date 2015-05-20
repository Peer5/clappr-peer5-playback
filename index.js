var HLS = require('hls');
var Browser = require('browser');
var JST = require('./jst');

class ClapprPeer5Playback extends HLS {
    get name() {
        return 'hls';
    }

    constructor(options) {
        super(options);

        this.playlistXhr = null;
        this.fragmentXhr = null;
    }

    addListeners() {
        super.addListeners();

        Clappr.Mediator.on(this.cid + ":error", (data) => this.onError(data.code, data.url, data.message));
        Clappr.Mediator.on(this.cid + ":playlistrequest", (data) => this.onPlaylistRequest(data.objectId, data.url, data.callbackLoaded, data.callbackFailure));
        Clappr.Mediator.on(this.cid + ":playlistabort", (objectId) => this.onPlaylistAbort(objectId));
        Clappr.Mediator.on(this.cid + ":fragmentrequest", (data) => this.onFragmentRequest(data.objectId, data.url, data.callbackLoaded, data.callbackFailure));
        Clappr.Mediator.on(this.cid + ":fragmentabort", (objectId) => this.onFragmentAbort(objectId));
    }

    stopListening() {
        super.stopListening();

        Clappr.Mediator.off(this.cid + ":requestplaylist");
        Clappr.Mediator.off(this.cid + ":abortplaylist");
        Clappr.Mediator.off(this.cid + ":requestfragment");
        Clappr.Mediator.off(this.cid + ":abortfragment");
    }

    onError(code, url, message) {
        console.error('flashls error:', code, url, message);
    }

    onPlaylistRequest(objectId, url, callbackLoaded, callbackFailure) {
        var _this = this;

        // prepare request
        this.playlistXhr = new peer5.Request();
        this.playlistXhr.open("GET", url);
        this.playlistXhr.responseType = 'text';

        this.playlistXhr.onload = function(e) {
            if (!e.currentTarget.response) {
                return _this.el[callbackFailure]();
            }

            return _this.el[callbackLoaded](e.currentTarget.response);
        };

        // error handlers
        this.playlistXhr.onerror = this.playlistXhr.onabort = function(e) {
            return _this.el[callbackFailure]();
        };

        this.playlistXhr.send();
    }

    onPlaylistAbort(objectId) {
        if (this.playlistXhr) {
            this.playlistXhr.abort();
        }
    }

    onFragmentRequest(objectId, url, callbackLoaded, callbackFailure) {
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

            return _this.el[callbackLoaded](b64, len);
        };

        // error handlers
        this.fragmentXhr.onerror = this.fragmentXhr.onabort = function(e) {
            _this.el[callbackFailure]();
        };

        this.fragmentXhr.send();
    }

    arrayBufferToBase64(arrayBuffer) {
        var bytes = new Uint8Array(arrayBuffer);
        var binary = '';
        for (var i = 0, length = bytes.length; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    onFragmentAbort(objectId) {
        if (this.fragmentXhr) {
            this.fragmentXhr.abort();
        }
    }

    setFlashSettings() {
        super.setFlashSettings();

        // enable support for flashls JS Loader
        this.el.playerSetJSURLStream(true);
    }
}

ClapprPeer5Playback.canPlay = function(resource) {
    return (typeof peer5 !== 'undefined') && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*).m3u8?/) || mimeType === "application/x-mpegURL");
};


module.exports = window.ClapprPeer5Playback = ClapprPeer5Playback;
