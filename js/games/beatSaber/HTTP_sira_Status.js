import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
export class HTTP_sira_Status {
    constructor() {
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
    }
    eHandler(dataEvent) {
        switch (dataEvent.event) {
            case "hello":
                console.log("%cBeat Saber " + dataEvent.status.game.gameVersion + " | HTTP(sira)Status " + dataEvent.status.game.pluginVersion, "background-color: green;");
                console.log("\n\n");
                this._songCard.songCardData.display = false;
                this._songCard.songCardData.started = false;
                this._songCard.songCardData.paused = false;
                this._songCard.songCardData.inProgress = false;
                this._songCard.songCardData.finished = false;
                if (!this._playerCard.playerCardData.disabled) {
                    this._playerCard.playerCardData.needUpdate = true;
                    this._playerCard.playerCardData.display = true;
                }
                if (dataEvent.status.beatmap !== null) {
                    this._songCard.songCardData.display = true;
                    this._songCard.songCardData.started = true;
                    this._songCard.songCardData.finished = false;
                    if (!this._playerCard.playerCardData.disabled)
                        this._playerCard.playerCardData.display = false;
                    this.mapInfoParser(dataEvent);
                    if (dataEvent.status.beatmap.paused !== null) {
                        if (dataEvent.status.beatmap.start !== null)
                            this._songCard.songCardPerformance.time = dataEvent.status.beatmap.paused - dataEvent.status.beatmap.start;
                        this._songCard.songCardData.paused = true;
                        this._songCard.songCardData.inProgress = false;
                    }
                    else {
                        if (dataEvent.status.beatmap.start !== null)
                            this._songCard.songCardPerformance.time = dataEvent.time - dataEvent.status.beatmap.start;
                        this._songCard.songCardData.paused = false;
                        this._songCard.songCardData.inProgress = true;
                    }
                    this.scoreParser(dataEvent);
                }
                break;
            case "songStart":
                this._songCard.songCardData.display = true;
                this._songCard.songCardData.started = true;
                this._songCard.songCardData.paused = false;
                this._songCard.songCardData.inProgress = true;
                this._songCard.songCardData.finished = false;
                if (!this._playerCard.playerCardData.disabled)
                    this._playerCard.playerCardData.display = false;
                this.mapInfoParser(dataEvent);
                break;
            case "pause":
                this._songCard.songCardData.paused = true;
                this._songCard.songCardData.inProgress = false;
                break;
            case "resume":
                this._songCard.songCardData.paused = false;
                this._songCard.songCardData.inProgress = true;
                break;
            case "finished":
                if (!this._playerCard.playerCardData.disabled)
                    this._playerCard.playerCardData.needUpdate = true;
                this._songCard.songCardData.finished = true;
                break;
            case "menu":
                setTimeout(() => {
                    this._songCard.songCardData.display = false;
                }, Globals.MS_TIMER);
                if (!this._playerCard.playerCardData.disabled)
                    this._playerCard.playerCardData.display = true;
                this._songCard.songCardData.started = false;
                this._songCard.songCardData.paused = false;
                this._songCard.songCardData.inProgress = false;
                break;
            case "noteMissed":
            case "scoreChanged":
                this.scoreParser(dataEvent);
                break;
        }
    }
    mapInfoParser(dataEvent) {
        this._songCard.songCardData.needUpdate = true;
        this._songCard.songCardPerformance.combo = 0;
        this._songCard.songCardPerformance.miss = 0;
        this._songCard.songCardPerformance.accuracy = 100;
        this._songCard.songCardData.speedModifier = 1;
        this._songCard.songCardPerformance.score = "0";
        this._songCard.songCardData.pluginBsrKey = "";
        this._songCard.songCardData.title = dataEvent.status.beatmap?.songName;
        this._songCard.songCardData.subTitle = dataEvent.status.beatmap?.songSubName;
        this._songCard.songCardData.mapper = (dataEvent.status.beatmap?.levelAuthorName !== null) ? "[" + dataEvent.status.beatmap?.levelAuthorName.trim() + "]" : "";
        this._songCard.songCardData.author = dataEvent.status.beatmap?.songAuthorName;
        this._songCard.songCardData.hashMap = dataEvent.status.beatmap?.songHash;
        this._songCard.songCardData.levelId = dataEvent.status.beatmap?.levelId;
        this._songCard.songCardData.difficulty = dataEvent.status.beatmap?.difficulty;
        this._songCard.songCardData.difficultyClass = dataEvent.status.beatmap?.difficultyEnum;
        this._songCard.songCardData.bpm = dataEvent.status.beatmap?.songBPM;
        this._songCard.songCardData.totalTime = dataEvent.status.beatmap?.length;
        this._songCard.songCardData.cover = (dataEvent.status.beatmap?.songCover !== null) ? "data:image/png;base64," + dataEvent.status.beatmap?.songCover : "./pictures/default/notFound.jpg";
        this._songCard.songCardPerformance.time = (dataEvent.status.beatmap?.start !== null && dataEvent.status.beatmap?.start !== undefined) ? dataEvent.time - dataEvent.status.beatmap?.start : 0;
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.health = 1;
        this._songCard.songCardPerformance.combo = dataEvent.status.performance?.combo;
        this._songCard.songCardPerformance.miss = dataEvent.status.performance?.missedNotes;
        this._songCard.songCardPerformance.accuracy = (dataEvent.status.performance?.relativeScore !== undefined) ?
            Number(Math.round((dataEvent.status.performance.relativeScore * 100 + Number.EPSILON) * 100) / 100)
            : Number(Math.round(((dataEvent.status.performance?.score * 100 + Number.EPSILON) * 100) / dataEvent.status.performance?.currentMaxScore) / 100);
        this._songCard.songCardPerformance.score = (dataEvent.status.performance?.score).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    dataParser(data) {
        let dataParsed = JSON.parse(data);
        this.eHandler(dataParsed);
    }
}
