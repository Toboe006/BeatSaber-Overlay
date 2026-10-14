import { Globals } from "../../globals.js";
import { PlayerCard } from "../../modules/playerCard.js";
import { SongCard } from "../../modules/songCard.js";
import { Tools } from '../../system/tools.js';
export class DataPuller {
    constructor() {
        this.helloEvent = true;
        this.oldVersion = false;
        this.timeResolve = false;
        this.oldVersionArray = ["2.0.12"];
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
        this._tools = new Tools();
    }
    eHandshake(dataEvent) {
        if (this.helloEvent) {
            console.log("%cBeat Saber " + dataEvent.GameVersion + " | DataPuller " + dataEvent.PluginVersion, Globals.INFO_LOG);
            console.log("\n\n");
            this.helloEvent = false;
            this.oldVersion = (this.oldVersionArray.includes(dataEvent.PluginVersion));
        }
    }
    eHandlerMapData(dataEvent) {
        if (dataEvent.InLevel) {
            if (!this._songCard.songCardData.started)
                this.mapInfoParser(dataEvent);
            if (!this._playerCard.playerCardData.disabled)
                this._playerCard.playerCardData.display = false;
            if (this.helloEvent || dataEvent.PracticeMode)
                this.timeResolve = true;
            this._songCard.songCardData.display = true;
            this._songCard.songCardData.started = true;
            this._songCard.songCardData.paused = false;
            this._songCard.songCardData.inProgress = true;
            this._songCard.songCardData.finished = false;
        }
        else {
            setTimeout(() => {
                this._songCard.songCardData.display = false;
            }, Globals.MS_TIMER);
            this._songCard.songCardData.started = false;
            this._songCard.songCardData.paused = false;
            this._songCard.songCardData.inProgress = false;
            this._songCard.songCardData.finished = true;
            if (!this._playerCard.playerCardData.disabled) {
                this._playerCard.playerCardData.needUpdate = true;
                this._playerCard.playerCardData.display = true;
            }
        }
        if (dataEvent.LevelPaused) {
            this._songCard.songCardData.paused = true;
            this._songCard.songCardData.inProgress = false;
        }
        if (dataEvent.LevelFinished) {
            if (!this._playerCard.playerCardData.disabled)
                this._playerCard.playerCardData.needUpdate = true;
            this._songCard.songCardData.finished = true;
        }
        if (dataEvent.LevelQuit)
            this._songCard.songCardData.finished = false;
        this.eHandshake(dataEvent);
    }
    eHandlerLiveData(dataEvent) {
        this.scoreParser(dataEvent);
        if (this.timeResolve) {
            this._songCard.songCardPerformance.time = dataEvent.TimeElapsed * 1000;
            this.timeResolve = false;
        }
    }
    mapInfoParser(dataEvent) {
        this._songCard.songCardData.needUpdate = true;
        this._songCard.songCardPerformance.time = 0;
        this._songCard.songCardPerformance.accuracy = 100;
        this._songCard.songCardData.title = dataEvent.SongName;
        this._songCard.songCardData.subTitle = dataEvent.SongSubName;
        this._songCard.songCardData.mapper = (dataEvent.Mapper !== "") ? "[" + dataEvent.Mapper.trim() + "]" : "";
        this._songCard.songCardData.author = dataEvent.SongAuthor;
        this._songCard.songCardData.bpm = dataEvent.BPM;
        this._songCard.songCardData.difficultyClass = dataEvent.Difficulty;
        this._songCard.songCardData.hashMap = dataEvent.Hash;
        const versions = this._tools.compareVersions(dataEvent.PluginVersion, '2.1.11');
        if (versions >= 0) {
            if (dataEvent.LevelID === null)
                this._songCard.songCardData.levelId = 'custom_level_' + dataEvent.Hash;
            else
                this._songCard.songCardData.levelId = dataEvent.LevelID;
        }
        else {
            if (dataEvent.Hash !== null) {
                this._songCard.songCardData.levelId = 'custom_level_' + dataEvent.Hash;
            }
            else {
                if (dataEvent.CustomDifficultyLabel !== null) {
                    this._songCard.songCardData.levelId = 'custom_level_' + dataEvent.SongName + ' WIP';
                }
                else {
                    this._songCard.songCardData.levelId = dataEvent.SongName;
                }
            }
        }
        this._songCard.songCardData.cover = (dataEvent.coverImage !== null) ? "data:image/png;base64," + dataEvent.coverImage : "./pictures/default/notFound.jpg";
        this._songCard.songCardData.pluginBsrKey = (dataEvent.BSRKey !== null) ? dataEvent.BSRKey : "";
        this._songCard.songCardData.difficulty = (dataEvent.Difficulty === "ExpertPlus") ? "Expert +" : dataEvent.Difficulty;
        this._songCard.songCardData.totalTime = (this.oldVersion) ? dataEvent.Length * 1000 : dataEvent.Duration * 1000;
        this._songCard.songCardData.speedModifier = this.speedParser(dataEvent);
    }
    speedParser(dataEvent) {
        if (dataEvent.PracticeMode)
            return (this.oldVersion) ? dataEvent.PracticeModeModifiers.songSpeedMul : dataEvent.PracticeModeModifiers.SongSpeedMul;
        if (this.oldVersion) {
            if (dataEvent.Modifiers.fasterSong)
                return 1.20;
            if (dataEvent.Modifiers.superFastSong)
                return 1.50;
            if (dataEvent.Modifiers.slowerSong)
                return 0.85;
        }
        else {
            if (dataEvent.Modifiers.FasterSong)
                return 1.20;
            if (dataEvent.Modifiers.SuperFastSong)
                return 1.50;
            if (dataEvent.Modifiers.SlowerSong)
                return 0.85;
        }
        return 1;
    }
    scoreParser(dataEvent) {
        this._songCard.songCardPerformance.combo = dataEvent.Combo;
        this._songCard.songCardPerformance.miss = dataEvent.Misses;
        this._songCard.songCardPerformance.health = dataEvent.PlayerHealth;
        this._songCard.songCardPerformance.accuracy = Number(Math.round((dataEvent.Accuracy + Number.EPSILON) * 100) / 100);
        this._songCard.songCardPerformance.score = dataEvent.Score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    dataParser(data, endPoint) {
        if (endPoint === "MapData") {
            let dataParsed = JSON.parse(data);
            this.eHandlerMapData(dataParsed);
        }
        if (endPoint === "LiveData") {
            let dataParsed = JSON.parse(data);
            this.eHandlerLiveData(dataParsed);
        }
    }
}
