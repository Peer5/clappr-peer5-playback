var HLS = require('hls');
var Browser = require('browser');
var JST = require('./jst');

class Peer5Playback extends HLS {
    get name() {
        return 'hls';
    }

    constructor(options) {
        super(options);

        // configs
        this.firstPlayStartPosition = peer5.getConfig('MEDIA_LIVE_START_POS') || 0;
        this.maxBufferLength = peer5.getConfig('MEDIA_MAXBUFFER') || 30;
        this.native = peer5.getConfig('CLAPPR_NATIVE_FALLBACK') || false;
    }

    addListeners() {
        super.addListeners();

        Clappr.Mediator.on(this.cid + ":error", (code, url, message) => peer5.flashls.trigger('error', [code, url, message]));
        Clappr.Mediator.on(this.cid + ":requestplaylist", (instanceId, url, callbackLoaded, callbackFailure) => peer5.flashls.trigger('requestPlaylist', [instanceId, url, callbackLoaded, callbackFailure]));
        Clappr.Mediator.on(this.cid + ":abortplaylist", (instanceId) => peer5.flashls.trigger('abortPlaylist', [instanceId]));
        Clappr.Mediator.on(this.cid + ":requestfragment", (instanceId, url, callbackLoaded, callbackFailure) => peer5.flashls.trigger('requestFragment', [instanceId, url, callbackLoaded, callbackFailure]));
        Clappr.Mediator.on(this.cid + ":abortfragment", (instanceId) => peer5.flashls.trigger('abortFragment', [instanceId]));
    }

    stopListening() {
        super.stopListening();

        Clappr.Mediator.off(this.cid + ":error");
        Clappr.Mediator.off(this.cid + ":requestplaylist");
        Clappr.Mediator.off(this.cid + ":abortplaylist");
        Clappr.Mediator.off(this.cid + ":requestfragment");
        Clappr.Mediator.off(this.cid + ":abortfragment");
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
    return (typeof peer5 !== 'undefined') && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*)\.m3u8?/) || mimeType === "application/x-mpegURL");
};


module.exports = window.Peer5Playback = Peer5Playback;
