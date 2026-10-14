import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
export class Adofai {
    constructor() {
        this.helloEvent = true;
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
        switch (dataEvent.type) {
            case "loadLevel":
                this.mapInfoParser(dataEvent);
                if (!this._songCard.songCardData.disabled) {
                    this._songCard.songCardData.display = true;
                    this._songCard.songCardData.started = true;
                    this._songCard.songCardData.inProgress = false;
                    this._songCard.songCardData.finished = false;
                }
                break;
            case "levelImage":
                this.coverInfoParser(dataEvent);
                break;
            case "update":
                this.infoParser(dataEvent);
                this.scoreParser(dataEvent);
                break;
            case "default":
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
        this._songCard.songCardPerformance.death = 0;
        this._songCard.songCardPerformance.checkpoint = 0;
        this._songCard.songCardPerformance.retry = 0;
        this._songCard.songCardPerformance.te = 0;
        this._songCard.songCardPerformance.ve = 0;
        this._songCard.songCardPerformance.ep = 0;
        this._songCard.songCardPerformance.pp = 0;
        this._songCard.songCardPerformance.lp = 0;
        this._songCard.songCardPerformance.vl = 0;
        this._songCard.songCardPerformance.tl = 0;
        this._songCard.songCardData.title = dataEvent.data?.song.replace(/<\/?[^>]+(>|$)/g, "");
        this._songCard.songCardData.subTitle = "";
        this._songCard.songCardData.mapper = (dataEvent.data?.author !== "") ? "[" + dataEvent.data?.author.trim().replace(/<\/?[^>]+(>|$)/g, "") + "]" : "";
        this._songCard.songCardData.author = dataEvent.data?.artist.replace(/<\/?[^>]+(>|$)/g, "");
        this._songCard.songCardData.bpm = dataEvent.data?.bpm;
        this._songCard.songCardData.difficulty = this.getDifficulty(dataEvent.data?.difficulty);
        this._songCard.songCardData.difficultyClass = this.getDifficulty(dataEvent.data?.difficulty);
        this._songCard.songCardData.hashMap = "";
        this._songCard.songCardData.bsrKey = "";
        this._songCard.songCardData.totalTime = 100;
        this._songCard.songCardData.speedModifier = 1;
    }
    coverInfoParser(dataEvent) {
        this._songCard.songCardData.cover = (dataEvent.data?.previewImage !== null) ? "data:image/" + dataEvent.data?.previewImageExtension + ";base64," + dataEvent.data?.previewImage : "./pictures/default/notFound.jpg";
    }
    getDifficulty(difficulty) {
        switch (difficulty) {
            case 10: return "Hardcore";
            case 9:
            case 8:
            case 7: return "Expert";
            case 6:
            case 5:
            case 4: return "Hard";
            case 3:
            case 2:
            case 1:
            default: return "Easy";
        }
    }
    infoParser(dataEvent) {
        this._songCard.songCardPerformance.time = dataEvent.data?.percentComplete * 100;
        this._songCard.timerSongManual();
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.death = dataEvent.data?.deaths;
        this._songCard.songCardPerformance.checkpoint = dataEvent.data?.checkpoints;
        this._songCard.songCardPerformance.retry = dataEvent.data?.attempts;
        this._songCard.songCardPerformance.te = dataEvent.data?.tooEarly;
        this._songCard.songCardPerformance.ve = dataEvent.data?.veryEarly;
        this._songCard.songCardPerformance.ep = dataEvent.data?.earlyPerfect;
        this._songCard.songCardPerformance.pp = dataEvent.data?.perfect;
        this._songCard.songCardPerformance.lp = dataEvent.data?.latePerfect;
        this._songCard.songCardPerformance.vl = dataEvent.data?.veryLate;
        this._songCard.songCardPerformance.tl = dataEvent.data?.tooLate;
    }
    dataParser(data) {
        let dataParsed = JSON.parse(data);
        this.eHandler(dataParsed);
    }
}
