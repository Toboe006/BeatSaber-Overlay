import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
import { AudioTripSong } from "../../system/api-call.js";
export class AudioTrip {
    constructor() {
        this.helloEvent = true;
        this.alreadyDid = false;
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
        this._audioTripSong = new AudioTripSong();
    }
    eHandshake(dataEvent) {
        if (this.helloEvent) {
            console.log("%cAudioTrip " + dataEvent.gameVersion + " | WebSocket v??", Globals.INFO_LOG);
            console.log("\n\n");
            this.helloEvent = false;
        }
    }
    eHandler(dataEvent) {
        if (dataEvent.inSong) {
            if (!this.alreadyDid)
                this.mapInfoParser(dataEvent);
            this.scoreParser(dataEvent);
            this.infoParser(dataEvent);
            if (!this._songCard.songCardData.disabled) {
                this._songCard.songCardData.display = true;
                this._songCard.songCardData.started = true;
                this._songCard.songCardData.inProgress = true;
                this._songCard.songCardData.finished = false;
            }
        }
        else {
            this.alreadyDid = false;
            if (!this._songCard.songCardData.disabled) {
                this._songCard.songCardData.display = false;
                this._songCard.songCardData.started = false;
                this._songCard.songCardData.inProgress = false;
                this._songCard.songCardData.finished = true;
            }
        }
        this.eHandshake(dataEvent);
    }
    async mapInfoParser(dataEvent) {
        this._songCard.songCardPerformance.time = 0;
        this._songCard.songCardPerformance.accuracy = 100;
        this._songCard.songCardData.title = dataEvent.songTitle;
        this._songCard.songCardData.subTitle = "";
        this._songCard.songCardData.mapper = (dataEvent.choreographer !== "") ? "[" + dataEvent.choreographer.trim() + "]" : "";
        this._songCard.songCardData.author = dataEvent.songArtist;
        this._songCard.songCardData.bpm = 0;
        this._songCard.songCardData.difficulty = dataEvent.choreoName;
        this._songCard.songCardData.difficultyClass = dataEvent.choreoName;
        this._songCard.songCardData.hashMap = "";
        this._songCard.songCardData.bsrKey = "";
        this._songCard.songCardData.totalTime = dataEvent.songLength * 1000;
        this._songCard.songCardData.totalTimeToLetters = this._songCard.timeToLetters(this._songCard.songCardData.totalTime);
        this._songCard.songCardData.speedModifier = 1;
        this._songCard.songCardData.cover = await this.getCover(dataEvent.songID);
        this._songCard.songCardData.needUpdate = true;
        this.alreadyDid = true;
    }
    async getCover(hash) {
        let data = await this._audioTripSong.getSongInfo(hash);
        let coverLink = "./pictures/default/notFound.jpg";
        if (data.coverLink !== undefined) {
            coverLink = "./pictures/coverSong/" + data.coverLink;
        }
        return coverLink;
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.combo = 0;
        this._songCard.songCardPerformance.miss = 0;
        this._songCard.songCardPerformance.health = (dataEvent.playerHealth !== -1) ? dataEvent.playerHealth : 0;
        this._songCard.songCardPerformance.score = dataEvent.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    infoParser(dataEvent) {
        this._songCard.songCardPerformance.time = dataEvent.curSongTime * 1000;
    }
    dataParser(data) {
        let dataParsed = JSON.parse(data);
        this.eHandler(dataParsed);
    }
}
