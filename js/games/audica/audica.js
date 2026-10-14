import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
export class Audica {
    constructor() {
        this.helloEvent = true;
        this.noteMiss = 0;
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
    }
    eHandshake() {
        if (this.helloEvent) {
            console.log("%cAudica v?? | WebSocket v??", Globals.INFO_LOG);
            console.log("\n\n");
            this.helloEvent = false;
        }
    }
    eHandler(dataEvent) {
        switch (dataEvent.eventType) {
            case "SongSelected":
                this.map = dataEvent;
                this.mapInfoParser(dataEvent);
                if (!this._songCard.songCardData.disabled) {
                    this._songCard.songCardData.display = true;
                    this._songCard.songCardData.started = true;
                    this._songCard.songCardData.inProgress = true;
                    this._songCard.songCardData.finished = false;
                }
                break;
            case "SongRestart":
                this.mapInfoParser(this.map);
                break;
            case "SongPlayerStatus":
                this.scoreParser(dataEvent);
                break;
            case "SongProgress":
                this.infoParser(dataEvent);
                break;
            case "TargetMiss":
                this.noteMiss++;
                break;
            case "ReturnToSongList":
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
        this._songCard.songCardPerformance.accuracy = 100;
        this._songCard.songCardPerformance.score = "0";
        this._songCard.songCardData.title = dataEvent.data.songName;
        this._songCard.songCardData.subTitle = "";
        this._songCard.songCardData.mapper = (dataEvent.data.songAuthor !== "") ? "[" + dataEvent.data.songAuthor.trim() + "]" : "";
        this._songCard.songCardData.author = dataEvent.data.songArtist;
        this._songCard.songCardData.bpm = 0;
        this._songCard.songCardData.difficulty = dataEvent.data.difficulty;
        this._songCard.songCardData.difficultyClass = dataEvent.data.difficulty;
        this._songCard.songCardData.hashMap = "";
        this._songCard.songCardData.bsrKey = "";
        this._songCard.songCardData.totalTime = dataEvent.data.songLengthSeconds * 1000;
        this._songCard.songCardData.speedModifier = 1;
        this._songCard.songCardData.cover = (dataEvent.data.albumArtData !== null) ? "data:image/png;base64," + dataEvent.data.albumArtData : "./pictures/default/notFound.jpg";
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.combo = dataEvent.data.streak;
        this._songCard.songCardPerformance.miss = this.noteMiss;
        this._songCard.songCardPerformance.health = dataEvent.data.health;
        this._songCard.songCardPerformance.score = dataEvent.data.score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    infoParser(dataEvent) {
        this._songCard.songCardPerformance.time = dataEvent.data.timeElapsedSeconds * 1000;
    }
    dataParser(data) {
        let dataParsed = JSON.parse(data);
        this.eHandler(dataParsed);
    }
}
