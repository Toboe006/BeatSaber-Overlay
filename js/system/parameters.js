import { Globals } from "../globals.js";
import { Tools } from "./tools.js";
import { PlayerCard } from "../modules/playerCard.js";
import { SongCard } from "../modules/songCard.js";
import { Leaderboard } from "../modules/leaderboard.js";
export class Parameters {
    oldURIParamsConverter(key) {
        switch (key) {
            case "pid": return "playerID";
            case "md": return "missDisplay";
            case "pcpos":
            case "scpos": return "position";
            case "pcsc":
            case "scsc": return "scale";
            case "pcsk":
            case "scsk": return "skin";
            default: return key;
        }
    }
    ;
    URIParamsModuleConverter(key) {
        switch (key) {
            case "ip":
            case "token": return "general";
            case "pid":
            case "pcpos":
            case "pcsc":
            case "pcsk": return "playerCard";
            case "scpos":
            case "scsc":
            case "scsk":
            case "md": return "songCard";
            default: return "general";
        }
    }
    constructor() {
        this.oldURIParams = {
            ip: ["ip"],
            playerID: ["pid"],
            position: ["pcpos", "scpos"],
            scale: ["pcsc", "scsc"],
            skin: ["pcsk", "scsk"],
            boolean: ["md"]
        };
        this.uriParams = {
            general: {
                ip: "127.0.0.1",
                token: "",
                scoringSystem: 1
            },
            games: {
                beatSaber: true,
                synthRiders: false,
                audioTrip: false,
                audica: false,
                adofai: false
            },
            plugins: {
                beatSaberPlugins: {
                    beatSaberPlus: true,
                    beatSaberPlusLeaderboard: false,
                    dataPuller: true,
                    httpSiraStatus: true
                },
                synthRidersPlugins: {
                    synthRiders: false
                },
                audioTripPlugins: {
                    audioTrip: false
                },
                audicaPlugins: {
                    audica: false
                },
                adofaiPlugins: {
                    adofai: false
                }
            },
            playerCard: {
                disabled: false,
                alwaysEnabled: false,
                playerID: Globals.DEFAULT_PLAYERID,
                skin: "default",
                position: 1,
                scale: 1.0,
                pos_x: 0,
                pos_y: 0,
            },
            songCard: {
                disabled: false,
                alwaysEnabled: false,
                skin: "default",
                position: 2,
                scale: 1.0,
                pos_x: 0,
                pos_y: 0,
                missDisplay: false,
                bigBSR: false,
                ppMax: false,
                ppEstimated: false,
            },
            leaderboard: {
                disabled: true,
                skin: "default",
                battleRoyal: false,
                position: 0,
                scale: 1.0,
                pos_x: 0,
                pos_y: 0,
                playerRendering: 5,
            }
        };
        this._tools = new Tools();
        this._playerCard = PlayerCard.Instance;
        this._songCard = SongCard.Instance;
        this._leaderboard = Leaderboard.Instance;
        this.findParameters(new URLSearchParams(Globals.URI_NAV_SEARCH));
    }
    findParameters(uri_search) {
        for (let [key, value] of uri_search.entries()) {
            let keyDecoded = decodeURI(key);
            let valueDecoded = decodeURI(value);
            let keyConverted = this.oldURIParamsConverter(keyDecoded);
            let moduleByKey = this.URIParamsModuleConverter(key);
            if (keyConverted in this.uriParams[this.URIParamsModuleConverter(key)]) {
                if (this.parseParameters(keyConverted, this.oldURIParams.position.includes(keyDecoded) ? this._tools.positionNumberConverter(valueDecoded) : valueDecoded, moduleByKey)) {
                    this.uriParams[moduleByKey][keyConverted] = this.oldURIParams.scale.includes(keyDecoded) ? Number(valueDecoded) :
                        this.oldURIParams.boolean.includes(keyDecoded) ? (valueDecoded === "true") :
                            this.oldURIParams.position.includes(keyDecoded) ? this._tools.positionNumberConverter(valueDecoded) :
                                valueDecoded;
                }
            }
        }
    }
    parseParameters(key, value, module) {
        switch (key) {
            case "token":
                if (typeof value !== "boolean" && typeof value !== "number" && value.length === Globals.TOKEN_LENGTH)
                    return !RegExp(/[^-~._\w]/).test(value);
                return false;
            case "ip":
                return RegExp(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/).test(value) || value === "localhost";
            case "playerID":
            case "playerRendering":
            case "scoringSystem":
            case "pos_x":
            case "pos_y":
                return RegExp(/^-?\d+$/).test(value);
            case "disabled":
            case "alwaysEnabled":
            case "beatSaber":
            case "beatSaberPlus":
            case "beatSaberPlusLeaderboard":
            case "dataPuller":
            case "httpSiraStatus":
            case "synthRiders":
            case "audioTrip":
            case "audica":
            case "adofai":
            case "missDisplay":
            case "bigBSR":
            case "ppMax":
            case "ppEstimated":
            case "battleRoyal":
                return (value === "true" || value === "false") || typeof value === "boolean";
            case "skin":
                if (module !== undefined)
                    return this._tools.getModuleSkin(module, value) !== null;
                return false;
            case "position":
                return value in Globals.E_POSITION;
            case "scale":
                return RegExp(/^[+-]?\d+(\.\d+)?$/).test(value);
            default: return false;
        }
    }
    async searchTokenParameters() {
        if ((this.uriParams.general.token !== null) && (this.uriParams.general.token.length === Globals.TOKEN_LENGTH)) {
            const formData = {
                token: this.uriParams.general.token,
                function: "search"
            };
            let dataJson = await this._tools.postMethod(Globals.URI_TOKEN_SCRIPT, formData);
            if ("errorMessage" in dataJson)
                console.log("%c" + dataJson.errorMessage, Globals.ERROR_LOG);
            if ("successMessage" in dataJson) {
                console.log("%c" + dataJson.successMessage, Globals.INFO_LOG);
                for (let [key, value] of Object.entries(dataJson)) {
                    let module;
                    if (key === "successMessage")
                        continue;
                    switch (key) {
                        case "general":
                            module = "general";
                            break;
                        case "playerCard":
                            module = "playerCard";
                            break;
                        case "songCard":
                            module = "songCard";
                            break;
                        case "leaderboard":
                            module = "leaderboard";
                            break;
                        case "games":
                            module = "games";
                            break;
                        case "plugins":
                            module = "plugins";
                            break;
                        default:
                            module = "general";
                            break;
                    }
                    for (let [keyValue, valueValue] of Object.entries(value)) {
                        switch (keyValue) {
                            case "beatSaberPlugins":
                            case "synthRidersPlugins":
                            case "audioTripPlugins":
                            case "audicaPlugins":
                            case "adofaiPlugins":
                                let pluginsModule = keyValue;
                                for (let [keyPluginsValue, valuePluginsValue] of Object.entries(valueValue)) {
                                    if (typeof this.uriParams.plugins[pluginsModule][keyPluginsValue] === "boolean")
                                        if ((keyPluginsValue) in this.uriParams.plugins[pluginsModule])
                                            this.uriParams.plugins[pluginsModule][keyPluginsValue] = (Number(valuePluginsValue) === 1);
                                }
                                break;
                            default:
                                if (typeof this.uriParams[module][keyValue] === "string")
                                    if ((keyValue) in this.uriParams[module])
                                        this.uriParams[module][keyValue] = valueValue;
                                if (typeof this.uriParams[module][keyValue] === "number")
                                    if ((keyValue) in this.uriParams[module])
                                        this.uriParams[module][keyValue] = Number(valueValue);
                                if (typeof this.uriParams[module][keyValue] === "boolean")
                                    if ((keyValue) in this.uriParams[module])
                                        this.uriParams[module][keyValue] = (Number(valueValue) === 1);
                                break;
                        }
                    }
                }
                return true;
            }
        }
        return false;
    }
    async saveTokenParameters() {
        const formData = {
            token: this.uriParams.general.token,
            function: "save",
            data: this.uriParams
        };
        let dataJson = await this._tools.postMethod(Globals.URI_TOKEN_SCRIPT, formData);
        if ("errorMessage" in dataJson)
            console.log("%c" + dataJson.errorMessage, Globals.ERROR_LOG);
        if ("successMessage" in dataJson) {
            console.log("%c" + dataJson.successMessage, Globals.INFO_LOG);
            this.uriParams.general.token = dataJson.token;
        }
        return this.uriParams.general.token !== "";
    }
    async updateTokenParameters() {
        if ((this.uriParams.general.token !== null) && (this.uriParams.general.token.length === Globals.TOKEN_LENGTH)) {
            const formData = {
                token: this.uriParams.general.token,
                function: "update",
                data: this.uriParams
            };
            let dataJson = await this._tools.postMethod(Globals.URI_TOKEN_SCRIPT, formData);
            if ("errorMessage" in dataJson)
                console.log("%c" + dataJson.errorMessage, Globals.ERROR_LOG);
            if ("successMessage" in dataJson) {
                console.log("%c" + dataJson.successMessage, Globals.INFO_LOG);
                return true;
            }
        }
        return false;
    }
    assocValue() {
        this._playerCard.playerCardData.disabled = this.uriParams.playerCard.disabled;
        this._playerCard.playerCardData.alwaysEnabled = this.uriParams.playerCard.alwaysEnabled;
        this._playerCard.playerCardData.skin = this.uriParams.playerCard.skin;
        this._playerCard.playerCardData.position = this.uriParams.playerCard.position;
        this._playerCard.playerCardData.scale = this.uriParams.playerCard.scale;
        this._playerCard.playerCardData.pos_x = this.uriParams.playerCard.pos_x;
        this._playerCard.playerCardData.pos_y = this.uriParams.playerCard.pos_y;
        this._playerCard.playerCardData.scoringSystem = this.uriParams.general.scoringSystem;
        this._playerCard.playerCardData.playerID = this.uriParams.playerCard.playerID;
        this._songCard.songCardData.disabled = this.uriParams.songCard.disabled;
        this._songCard.songCardData.alwaysEnabled = this.uriParams.songCard.alwaysEnabled;
        this._songCard.songCardData.skin = this.uriParams.songCard.skin;
        this._songCard.songCardData.position = this.uriParams.songCard.position;
        this._songCard.songCardData.scale = this.uriParams.songCard.scale;
        this._songCard.songCardData.pos_x = this.uriParams.songCard.pos_x;
        this._songCard.songCardData.pos_y = this.uriParams.songCard.pos_y;
        this._songCard.songCardData.scoringSystem = this.uriParams.general.scoringSystem;
        this._songCard.songCardData.displayMiss = this.uriParams.songCard.missDisplay;
        this._songCard.songCardData.bigBSR = this.uriParams.songCard.bigBSR;
        this._songCard.songCardData.ppMax = this.uriParams.songCard.ppMax;
        this._songCard.songCardData.ppEstimated = this.uriParams.songCard.ppEstimated;
        this._leaderboard.leaderboardData.disabled = this.uriParams.leaderboard.disabled;
        this._leaderboard.leaderboardData.skin = this.uriParams.leaderboard.skin;
        this._leaderboard.leaderboardData.position = this.uriParams.leaderboard.position;
        this._leaderboard.leaderboardData.scale = this.uriParams.leaderboard.scale;
        this._leaderboard.leaderboardData.pos_x = this.uriParams.leaderboard.pos_x;
        this._leaderboard.leaderboardData.pos_y = this.uriParams.leaderboard.pos_y;
        this._leaderboard.leaderboardData.playerRendering = this.uriParams.leaderboard.playerRendering;
        this._leaderboard.leaderboardData.battleRoyal = this.uriParams.leaderboard.battleRoyal;
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
