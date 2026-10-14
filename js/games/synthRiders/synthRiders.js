import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
export class SynthRiders {
    constructor() {
        this.helloEvent = true;
        this.noteMiss = 0;
        this.timeInMapOld = 0;
        this.timeInMapNew = 0;
        this.timeOutIsPlaying = 1500;
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
    }
    eHandshake() {
        if (this.helloEvent) {
            console.log("%cSynth Riders v?? | WebSocket v??", Globals.INFO_LOG);
            console.log("\n\n");
            this.helloEvent = false;
        }
    }
    eHandler(dataEvent) {
        switch (dataEvent.eventType) {
            case "SongStart":
                this.mapInfoParser(dataEvent);
                if (!this._songCard.songCardData.disabled) {
                    this._songCard.songCardData.display = true;
                    this._songCard.songCardData.started = true;
                    this._songCard.songCardData.inProgress = true;
                    this._songCard.songCardData.finished = false;
                }
                break;
            case "SongEnd":
                if (!this._songCard.songCardData.disabled) {
                    this._songCard.songCardData.display = false;
                    this._songCard.songCardData.started = false;
                    this._songCard.songCardData.inProgress = false;
                    this._songCard.songCardData.finished = true;
                }
                break;
            case "NoteHit":
                this.scoreParser(dataEvent);
                break;
            case "NoteMiss":
                this.noteMiss++;
                break;
            case "PlayTime":
                this.infoParser(dataEvent);
                setTimeout(() => {
                    let isPlaying = this.isPlaying();
                    this._songCard.songCardData.inProgress = isPlaying;
                    this._songCard.songCardData.paused = !isPlaying;
                }, this.timeOutIsPlaying);
                break;
            case "ReturnToMenu":
                if (!this._songCard.songCardData.disabled) {
                    this._songCard.songCardData.display = false;
                    this._songCard.songCardData.started = false;
                    this._songCard.songCardData.inProgress = false;
                    this._songCard.songCardData.finished = true;
                }
                break;
        }
        this.eHandshake();
    }
    mapInfoParser(dataEvent) {
        this._songCard.songCardData.needUpdate = false;
        this._songCard.songCardPerformance.time = 0;
        this.timeInMapOld = 0;
        this.timeInMapNew = 0;
        this._songCard.songCardPerformance.score = "0";
        this._songCard.songCardPerformance.miss = 0;
        this._songCard.songCardPerformance.accuracy = 100;
        this._songCard.songCardData.title = dataEvent.data.song;
        this._songCard.songCardData.subTitle = "";
        this._songCard.songCardData.mapper = (dataEvent.data.beatMapper !== "") ? "[" + dataEvent.data.beatMapper.trim() + "]" : "";
        this._songCard.songCardData.author = dataEvent.data.author;
        this._songCard.songCardData.bpm = dataEvent.data.bpm;
        this._songCard.songCardData.difficulty = dataEvent.data.difficulty;
        this._songCard.songCardData.difficultyClass = dataEvent.data.difficulty;
        this._songCard.songCardData.hashMap = "";
        this._songCard.songCardData.bsrKey = "";
        this._songCard.songCardData.totalTime = dataEvent.data.length * 1000;
        this._songCard.songCardData.speedModifier = 1;
        this._songCard.songCardData.cover = (dataEvent.data.albumArt !== null) ? "data:image/png;base64," + dataEvent.data.albumArt : "./pictures/default/notFound.jpg";
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.combo = dataEvent.data.combo;
        this._songCard.songCardPerformance.miss = this.noteMiss;
        this._songCard.songCardPerformance.health = dataEvent.data.lifeBarPercent;
        this._songCard.songCardPerformance.score = dataEvent.data.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    infoParser(dataEvent) {
        this._songCard.songCardPerformance.time = dataEvent.data.playTimeMS;
        this.timeInMapNew = dataEvent.data.playTimeMS;
        this._songCard.timerSongManual();
    }
    isPlaying() {
        if (this.timeInMapNew > this.timeInMapOld) {
            this.timeInMapOld = this.timeInMapNew;
            return true;
        }
        return false;
    }
    dataParser(data) {
        let dataParsed = JSON.parse(data);
        this.eHandler(dataParsed);
    }
}
