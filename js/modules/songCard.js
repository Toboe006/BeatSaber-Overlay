import { Globals } from "../globals.js";
import { Template } from "../system/template.js";
import { BeatSaver, BeatLeader } from "../system/api-call.js";
import { Tools } from "../system/tools.js";
export class SongCard {
    constructor() {
        this.songCardGames = {
            beatSaber: true,
            synthRiders: true,
            audioTrip: true,
            audica: true,
            adofai: true
        };
        this.songCardData = {
            disabled: false,
            display: false,
            alwaysEnabled: false,
            needUpdate: true,
            endedUpdate: false,
            position: 2,
            skin: "default",
            scale: 1.0,
            pos_x: 0,
            pos_y: 0,
            scoringSystem: 1,
            displayMiss: false,
            bigBSR: false,
            ppMax: false,
            ppEstimated: false,
            started: false,
            inProgress: false,
            paused: false,
            finished: false,
            cover: "https://eu.cdn.beatsaver.com/280378d7157542f5b160e8a464f0dcfdc3a1de56.jpg",
            title: "Love yiff!",
            subTitle: "Subtitle",
            mapper: "Yasu",
            author: "Camellia",
            pluginBsrKey: "",
            bsrKey: "2319e",
            hashMap: "280378d7157542f5b160e8a464f0dcfdc3a1de56",
            levelId: "custom_level_280378d7157542f5b160e8a464f0dcfdc3a1de56",
            bpm: 272,
            builtIn: false,
            difficulty: "Expert+",
            difficultyClass: "ExpertPlus",
            ranked: false,
            qualified: false,
            ppByStars: 500,
            totalTime: 274000,
            totalTimeToLetters: "4:24",
            speedModifier: 1
        };
        this.songCardPerformance = {
            endedUpdate: false,
            time: 137000,
            timeToLetters: "2:17",
            timeToPercentage: 50,
            timeToPercentageLetter: "50%",
            accuracy: 69.69,
            accuracyToLetters: "A",
            accuracyToLetterClass: "a",
            score: "124,256",
            ppActual: 267.23,
            combo: 234,
            miss: 2,
            death: 0,
            checkpoint: 0,
            retry: 0,
            te: 0,
            ve: 0,
            ep: 0,
            pp: 0,
            lp: 0,
            vl: 0,
            tl: 0,
            health: 100
        };
        this._template = new Template();
        this._beatSaver = new BeatSaver();
        this._beatLeader = new BeatLeader();
        this._tools = new Tools();
        this.timerSong();
    }
    timerSong() {
        setInterval(() => {
            if (this.songCardData.disabled || !this.songCardData.display)
                return;
            if (!this.songCardData.started && !this.songCardData.alwaysEnabled) {
                this.songCardPerformance.time = 0;
                this.songCardData.totalTime = 0;
                this.songCardPerformance.timeToLetters = "0:00";
                this.songCardPerformance.timeToPercentage = 0;
                this.songCardPerformance.timeToPercentageLetter = "0%";
            }
            if (!this.songCardData.started && this.songCardData.finished) {
                this.songCardPerformance.time = this.songCardData.totalTime;
                this.songCardPerformance.timeToLetters = this.timeToLetters(this.songCardPerformance.time);
                this.songCardPerformance.timeToPercentage = 100;
                this.songCardPerformance.timeToPercentageLetter = "100%";
            }
            if (this.songCardData.started && this.songCardData.inProgress && !this.songCardData.paused) {
                this.songCardPerformance.time += (100 * this.songCardData.speedModifier);
                this.songCardPerformance.timeToLetters = this.timeToLetters(this.songCardPerformance.time);
                this.songCardPerformance.timeToPercentage = this.timeToPercentage();
                this.songCardPerformance.timeToPercentageLetter = this.timeToPercentageLetter();
            }
            this.songCardPerformance.endedUpdate = true;
        }, Globals.MS_TIMER);
    }
    accuracyToLetter() {
        if (this.songCardPerformance.accuracy >= 90)
            return "SS";
        if (this.songCardPerformance.accuracy < 90 && this.songCardPerformance.accuracy >= 80)
            return "S";
        if (this.songCardPerformance.accuracy < 80 && this.songCardPerformance.accuracy >= 65)
            return "A";
        if (this.songCardPerformance.accuracy < 65 && this.songCardPerformance.accuracy >= 50)
            return "B";
        if (this.songCardPerformance.accuracy < 50 && this.songCardPerformance.accuracy >= 35)
            return "C";
        if (this.songCardPerformance.accuracy < 35 && this.songCardPerformance.accuracy >= 20)
            return "D";
        if (this.songCardPerformance.accuracy < 20)
            return "E";
        return "E";
    }
    accuracyToLetterClass() {
        switch (this.songCardPerformance.accuracyToLetters) {
            case "SS": return "ss";
            case "S": return "s";
            case "A": return "a";
            case "B": return "b";
            case "C": return "c";
            case "D": return "de";
            case "E": return "de";
            default: return "de";
        }
    }
    timeToPercentage() {
        return Math.floor((this.songCardPerformance.time / this.songCardData.totalTime) * 100);
    }
    timeToPercentageLetter() {
        return Math.floor((this.songCardPerformance.time / this.songCardData.totalTime) * 100).toFixed(0).toString() + "%";
    }
    async updateSongInfo() {
        this.songCardData.builtIn = !this.songCardData.levelId.includes('custom_level_');
        if (this.songCardData.disabled || !this.songCardData.needUpdate || !this._tools.checkGames(this.songCardGames, this.websocketMod) || !this._tools.checkPlugins(Globals.E_MODULES.SONGCARD, this.websocketMod)) {
            this.songCardData.needUpdate = false;
            this.songCardData.endedUpdate = true;
            return;
        }
        this.songCardData.needUpdate = false;
        let data;
        if (!this.songCardData.builtIn) {
            if (this.songCardData.scoringSystem === Globals.E_SCORING_SYSTEM.BEATLEADER)
                data = await this._beatLeader.getSongInfo(this.songCardData.hashMap);
            else
                data = await this._beatSaver.getSongInfo(this.songCardData.hashMap);
            if (data.errorMessage !== undefined || data.error !== undefined || data.success === false) {
                this.songCardData.ranked = false;
                this.songCardData.qualified = false;
                this.songCardData.bsrKey = (this.songCardData.pluginBsrKey === "")
                    ? (this.songCardData.levelId.includes('WIP'))
                        ? 'WIP' : "NotFound"
                    : this.songCardData.pluginBsrKey;
                this.songCardData.endedUpdate = true;
                return;
            }
            this.songCardData.bsrKey = (data.id === "") ? this.songCardData.pluginBsrKey : data.id.replace(/x/g, "");
            this.songCardData.cover = ("versions" in data) ? data.versions[0].coverURL : data.coverImage;
            if (this.songCardData.scoringSystem === Globals.E_SCORING_SYSTEM.SCORESABER) {
                this.songCardData.ranked = ("ranked" in data) ? data.ranked : false;
                this.songCardData.qualified = ("qualified" in data) ? (this.songCardData.ranked) ? false : data.qualified : false;
            }
            else if (this.songCardData.scoringSystem === Globals.E_SCORING_SYSTEM.BEATLEADER) {
                if ("difficulties" in data) {
                    for (let i = 0; i <= data.difficulties.length; i++) {
                        if (data.difficulties[i]["difficultyName"] === this.songCardData.difficultyClass) {
                            if (data.difficulties[i]["rankedTime"] > 0) {
                                this.songCardData.ranked = true;
                                this.songCardData.qualified = false;
                            }
                            else if (data.difficulties[i]["qualifiedTime"] > 0) {
                                this.songCardData.ranked = false;
                                this.songCardData.qualified = true;
                            }
                            else if (data.difficulties[i]["rankedTime"] === 0 && data.difficulties[i]["qualifiedTime"] === 0) {
                                this.songCardData.ranked = data.difficulties[i]["stars"] > 0;
                                this.songCardData.qualified = false;
                            }
                            break;
                        }
                    }
                }
            }
        }
        else {
            this.songCardData.bsrKey = 'OST Map';
            if (this.songCardData.mapper === '' || this.songCardData.mapper === null)
                this.songCardData.mapper = '[BeatGames]';
        }
        this.songCardData.totalTimeToLetters = this.timeToLetters(this.songCardData.totalTime);
        this.songCardData.endedUpdate = true;
    }
    timeToLetters(time) {
        let minutes = Math.floor((time / 1000) / 60).toFixed(0);
        let seconds = ((time / 1000) % 60).toFixed(0);
        if (+(seconds) < 10)
            seconds = "0" + seconds;
        return minutes + ":" + seconds;
    }
    timerSongManual() {
        this.songCardPerformance.timeToLetters = this.timeToLetters(this.songCardPerformance.time);
        this.songCardPerformance.timeToPercentage = this.timeToPercentage();
        this.songCardPerformance.timeToPercentageLetter = this.timeToPercentageLetter();
        this.songCardData.totalTimeToLetters = this.timeToLetters(this.songCardData.totalTime);
        this.songCardPerformance.endedUpdate = true;
    }
    refreshSongCard() {
        this.updateSongInfo().then(() => {
            this.songCardPerformance.accuracyToLetters = this.accuracyToLetter();
            this.songCardPerformance.accuracyToLetterClass = this.accuracyToLetterClass();
            this._template.refreshUI(this.songCardData, Globals.E_MODULES.SONGCARD);
            this.songCardData.endedUpdate = false;
            this._template.refreshUI(this.songCardPerformance, Globals.E_MODULES.SONGCARD);
            this.songCardPerformance.endedUpdate = false;
            this._template.moduleScale(Globals.E_MODULES.SONGCARD, this.songCardData.position, this.songCardData.scale);
            this._template.moduleCorners(Globals.E_MODULES.SONGCARD, this.songCardData.position);
            if (this.songCardData.skin !== "dietah")
                this._template.modulePosition(Globals.E_MODULES.SONGCARD, this.songCardData.pos_x, this.songCardData.pos_y, true);
            this._template.stopOrStart(Globals.E_MODULES.SONGCARD, this.songCardData.started, this.songCardData.paused);
            this._template.missDisplay(this.songCardData.displayMiss);
            this._template.bigBSR(this.songCardData.bigBSR, this.songCardData.skin);
            if (this.songCardData.skin === "reselim")
                this._template.timerToCircleBar(this.songCardPerformance.timeToPercentage);
            if (this.songCardData.skin === "dietah")
                this._template.missChanger(this.songCardPerformance.miss);
            this._template.changeWithPluginUse(Globals.E_MODULES.SONGCARD, this.songCardData.skin, this.websocketMod);
        });
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
