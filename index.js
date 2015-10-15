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
        this.firstPlayStartPosition = window.peer5 ? peer5.getConfig('MEDIA_LIVE_START_POS') || 0 : 0;
        this.lowBufferLength = window.peer5 ? peer5.getConfig('MEDIA_LOWBUFFER') || 3 : 3;
        this.minBufferLength = window.peer5 ? peer5.getConfig('MEDIA_MINBUFFER') || -1 : -1;
        this.maxBufferLength = window.peer5 ? peer5.getConfig('MEDIA_MAXBUFFER') || 30 : 30;
        this.native = window.peer5 ? peer5.getConfig('CLAPPR_NATIVE_FALLBACK') || false : false;

        // start prefetching in p2p
        if (window.peer5 && peer5.prefetch) {
            peer5.prefetch(this.src);
        }
    }

    addListeners() {
        super.addListeners();

        var id = this.cid;

        Clappr.Mediator.on(this.cid + ":error", (code, url, message) => peer5.flashls.trigger('error', [code, url, message]));
        Clappr.Mediator.on(this.cid + ":requestplaylist", (instanceId, url, callbackLoaded, callbackFailure) => peer5.flashls.trigger('requestPlaylist', [id, url, callbackLoaded, callbackFailure]));
        Clappr.Mediator.on(this.cid + ":abortplaylist", (instanceId) => peer5.flashls.trigger('abortPlaylist', [id]));
        Clappr.Mediator.on(this.cid + ":requestfragment", (instanceId, url, callbackLoaded, callbackFailure) => peer5.flashls.trigger('requestFragment', [id, url, callbackLoaded, callbackFailure]));
        Clappr.Mediator.on(this.cid + ":abortfragment", (instanceId) => peer5.flashls.trigger('abortFragment', [id]));
        Clappr.Mediator.on(this.cid + ":fpsdrop", (realFps, droppedFps) => peer5.flashls.trigger('fpsDrop', [realFps, droppedFps]));
    }

    stopListening() {
        super.stopListening();

        Clappr.Mediator.off(this.cid + ":error");
        Clappr.Mediator.off(this.cid + ":requestplaylist");
        Clappr.Mediator.off(this.cid + ":abortplaylist");
        Clappr.Mediator.off(this.cid + ":requestfragment");
        Clappr.Mediator.off(this.cid + ":abortfragment");
        Clappr.Mediator.off(this.cid + ":fpsdrop");
    }

    setFlashSettings() {
        super.setFlashSettings();

        // enable support for flashls JS Loader
        this.el.playerSetJSURLStream(true);
        this.el.playerSetlowBufferLength(this.lowBufferLength);
        this.el.playerSetminBufferLength(this.minBufferLength);
        this.el.playerSetmaxBufferLength(this.maxBufferLength);
    }

    firstPlay() {
        if (this.el && this.el.CallFunction) {
            this.setFlashSettings(); //ensure flushLiveURLCache will work (#327)
            this.el.playerLoad(this.src);
            Clappr.Mediator.once(this.cid + ":manifestloaded", () => this.el.playerPlay(this.firstPlayStartPosition));
            this.srcLoaded = true;
        }
    }
}

Peer5Playback.canPlay = function(resource, mimeType) {
    return window.peer5 && !!(window.webkitRTCPeerConnection || window.mozRTCPeerConnection) && Browser.hasFlash && window.btoa && (!!resource.match(/^http(.*)\.m3u8?/) || mimeType === "application/x-mpegURL");
};


module.exports = window.Peer5Playback = Peer5Playback;
