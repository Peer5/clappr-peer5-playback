var Playback = require('playback');
var JST = require('./jst');

class ClapprPeer5Playback extends Playback {
    get name() { return 'clappr_peer5_playback' }

    render() {
        console.log("rendering", this.name);
        var style = $('<style>').html(JST.CSS[this.name]);
        this.$el.append(style);
        return this;
    }

}

ClapprPeer5Playback.canPlay = function(source) {
    //should return true for the supported media source
    return false;
};


module.exports = window.ClapprPeer5Playback = ClapprPeer5Playback;
