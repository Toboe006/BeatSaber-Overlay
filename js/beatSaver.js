import { Globals } from "./global.js";
import { Tools } from "./tools.js";
export class BeatSaver {
    constructor() {
        this._tools = new Tools();
    }
    /////////////////////
    // PUBLIC FUNCTION //
    /////////////////////
    async getSongInfo(songHash) {
        return await this._tools.getMethod(Globals.BEATSAVER_API_URL + "/maps/hash/" + songHash);
    }
}
