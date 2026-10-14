import { Globals } from "../globals.js";
export class Tools {
    constructor() {
        this.compareVersions = ((prep, l, i, r) => (a, b) => {
            a = prep(a);
            b = prep(b);
            l = Math.max(a.length, b.length);
            i = 0;
            r = i;
            while (!r && i < l) {
                r = ~~a[i] - ~~b[i++];
            }
            return r < 0 ? -1 : (r ? 1 : 0);
        })((t) => ("" + t)
            .replace(/[^\d.]+/g, c => "." + (c.replace(/[\W_]+/, "").toUpperCase().charCodeAt(0) - 65536) + ".")
            .replace(/(?:\.0+)*(\.-\d+(?:\.\d+)?)\.*$/g, "$1")
            .split("."));
    }
    async getMethod(URI, options) {
        return await fetch(URI, {
            method: "GET",
            headers: options
        })
            .then(response => response.json());
    }
    async postMethod(URI, parameters, options) {
        return await fetch(URI, {
            method: "POST",
            headers: options,
            body: JSON.stringify(parameters)
        })
            .then(response => response.json());
    }
    moduleStringConverter(module) {
        switch (module) {
            case 0: return "playerCard";
            case 1: return "songCard";
            case 2: return "leaderboard";
            case 3: return "menuSetup";
            case 4: return "optionSetup";
            default: return "";
        }
    }
    positionStringConverter(position) {
        switch (position) {
            case Globals.E_POSITION.TOP_LEFT: return "top-left";
            case Globals.E_POSITION.TOP_RIGHT: return "top-right";
            case Globals.E_POSITION.BOTTOM_LEFT: return "bottom-left";
            case Globals.E_POSITION.BOTTOM_RIGHT: return "bottom-right";
            default: return "top-right";
        }
    }
    positionNumberConverter(position) {
        switch (position) {
            case "top-left": return Globals.E_POSITION.TOP_LEFT;
            case "top-right": return Globals.E_POSITION.TOP_RIGHT;
            case "bottom-left": return Globals.E_POSITION.BOTTOM_LEFT;
            case "bottom-right": return Globals.E_POSITION.BOTTOM_RIGHT;
            default: return Globals.E_POSITION.TOP_LEFT;
        }
    }
    getModuleSkin(module, skin) {
        let moduleSkins = null;
        switch (module) {
            case "playerCard":
                moduleSkins = Globals.SKIN_AVAILABLE[Globals.E_MODULES.PLAYERCARD];
                break;
            case "songCard":
                moduleSkins = Globals.SKIN_AVAILABLE[Globals.E_MODULES.SONGCARD];
                break;
            case "leaderboard":
                moduleSkins = Globals.SKIN_AVAILABLE[Globals.E_MODULES.LEADERBOARD];
                break;
            case "menuSetup":
                moduleSkins = Globals.SKIN_AVAILABLE[Globals.E_MODULES.MENU_SETUP];
                break;
            case "optionSetup":
                moduleSkins = Globals.SKIN_AVAILABLE[Globals.E_MODULES.OPT_SETUP];
                break;
        }
        if (moduleSkins === null)
            return null;
        if (moduleSkins.hasOwnProperty(skin))
            return moduleSkins[skin];
        if (moduleSkins.hasOwnProperty("default"))
            return moduleSkins["default"];
        return null;
    }
    checkGames(gamesSupported, pluginConnected) {
        switch (pluginConnected) {
            case Globals.WEBSOCKET_MODS.BSPLUS:
            case Globals.WEBSOCKET_MODS.DATAPULLER:
            case Globals.WEBSOCKET_MODS.HTTPSIRASTATUS:
                return gamesSupported.beatSaber;
            case Globals.WEBSOCKET_MODS.SYNTHRIDERS:
                return gamesSupported.synthRiders;
            case Globals.WEBSOCKET_MODS.AUDIOTRIP:
                return gamesSupported.audioTrip;
            case Globals.WEBSOCKET_MODS.AUDICA:
                return gamesSupported.audica;
            case Globals.WEBSOCKET_MODS.ADOFAI:
                return gamesSupported.adofai;
            default: return false;
        }
    }
    checkPlugins(module, pluginConnected) {
        switch (module) {
            case Globals.E_MODULES.SONGCARD:
            case Globals.E_MODULES.PLAYERCARD:
                switch (pluginConnected) {
                    case Globals.WEBSOCKET_MODS.BSPLUS:
                    case Globals.WEBSOCKET_MODS.DATAPULLER:
                    case Globals.WEBSOCKET_MODS.HTTPSIRASTATUS: return true;
                    case Globals.WEBSOCKET_MODS.SYNTHRIDERS:
                    case Globals.WEBSOCKET_MODS.AUDIOTRIP:
                    case Globals.WEBSOCKET_MODS.AUDICA:
                    case Globals.WEBSOCKET_MODS.ADOFAI:
                    default: return false;
                }
            default: return false;
        }
    }
}
