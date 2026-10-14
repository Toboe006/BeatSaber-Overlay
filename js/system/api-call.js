import { Globals } from "../globals.js";
import { Tools } from "./tools.js";
export class ScoreSaber {
    constructor() {
        this._tools = new Tools();
    }
    async getPlayerInfo(playerID) {
        return await this._tools.getMethod(Globals.SCORESABER_API_PROXY_URI + "/?playerID=" + playerID);
    }
}
export class BeatLeader {
    constructor() {
        this._tools = new Tools();
    }
    async getPlayerInfo(playerID) {
        return await this._tools.getMethod(Globals.BEATLEADER_API_PROXY_URI + "/?playerID=" + playerID);
    }
    async getSongInfo(songHash) {
        return await this._tools.getMethod(Globals.BEATLEADER_SONG_API_PROXY_URI + "/?hash=" + songHash);
    }
}
export class BeatSaver {
    constructor() {
        this._tools = new Tools();
    }
    async getSongInfo(songHash) {
        return await this._tools.getMethod(Globals.BEATSAVER_API_URI + "/maps/hash/" + songHash);
    }
}
export class AudioTripSong {
    constructor() {
        this._tools = new Tools();
    }
    async getSongInfo(songHash) {
        return await this._tools.getMethod(Globals.AUDIO_TRIP_SONG_PROXY + "/?hash=" + songHash);
    }
}
