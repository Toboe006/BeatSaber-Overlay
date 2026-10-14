export var Globals;
(function (Globals) {
    Globals.TITLE_LOG = "color: purple;   font-size: 1.5em;   background-color: white;    padding: 2px 4px; border-radius: 2px;";
    Globals.WARN_LOG = "color: white;    font-size: 1em;     background-color: orange;   padding: 2px 4px; border-radius: 2px;";
    Globals.ERROR_LOG = "color: white;    font-size: 1em;     background-color: red;      padding: 2px 4px; border-radius: 2px;";
    Globals.SUCCESS_LOG = "color: white;    font-size: 1em;     background-color: green;    padding: 2px 4px; border-radius: 2px;";
    Globals.INFO_LOG = "color: white;    font-size: 1em;     background-color: blue;     padding: 2px 4px; border-radius: 2px;";
    let E_MODULES;
    (function (E_MODULES) {
        E_MODULES[E_MODULES["PLAYERCARD"] = 0] = "PLAYERCARD";
        E_MODULES[E_MODULES["SONGCARD"] = 1] = "SONGCARD";
        E_MODULES[E_MODULES["LEADERBOARD"] = 2] = "LEADERBOARD";
        E_MODULES[E_MODULES["MENU_SETUP"] = 3] = "MENU_SETUP";
        E_MODULES[E_MODULES["OPT_SETUP"] = 4] = "OPT_SETUP";
    })(E_MODULES = Globals.E_MODULES || (Globals.E_MODULES = {}));
    let E_SCORING_SYSTEM;
    (function (E_SCORING_SYSTEM) {
        E_SCORING_SYSTEM[E_SCORING_SYSTEM["SCORESABER"] = 1] = "SCORESABER";
        E_SCORING_SYSTEM[E_SCORING_SYSTEM["BEATLEADER"] = 2] = "BEATLEADER";
    })(E_SCORING_SYSTEM = Globals.E_SCORING_SYSTEM || (Globals.E_SCORING_SYSTEM = {}));
    let WEBSOCKET_STATUS;
    (function (WEBSOCKET_STATUS) {
        WEBSOCKET_STATUS[WEBSOCKET_STATUS["DISCONNECTED"] = 0] = "DISCONNECTED";
        WEBSOCKET_STATUS[WEBSOCKET_STATUS["CONNECTED"] = 1] = "CONNECTED";
    })(WEBSOCKET_STATUS = Globals.WEBSOCKET_STATUS || (Globals.WEBSOCKET_STATUS = {}));
    let WEBSOCKET_MODS;
    (function (WEBSOCKET_MODS) {
        WEBSOCKET_MODS[WEBSOCKET_MODS["NONE"] = 0] = "NONE";
        WEBSOCKET_MODS[WEBSOCKET_MODS["BSPLUS"] = 1] = "BSPLUS";
        WEBSOCKET_MODS[WEBSOCKET_MODS["DATAPULLER"] = 2] = "DATAPULLER";
        WEBSOCKET_MODS[WEBSOCKET_MODS["HTTPSIRASTATUS"] = 3] = "HTTPSIRASTATUS";
        WEBSOCKET_MODS[WEBSOCKET_MODS["SYNTHRIDERS"] = 4] = "SYNTHRIDERS";
        WEBSOCKET_MODS[WEBSOCKET_MODS["AUDIOTRIP"] = 5] = "AUDIOTRIP";
        WEBSOCKET_MODS[WEBSOCKET_MODS["AUDICA"] = 6] = "AUDICA";
        WEBSOCKET_MODS[WEBSOCKET_MODS["ADOFAI"] = 7] = "ADOFAI";
    })(WEBSOCKET_MODS = Globals.WEBSOCKET_MODS || (Globals.WEBSOCKET_MODS = {}));
    Globals.URI_NAV_SEARCH = window.location.search;
    Globals.MS_TIMER = 100;
    Globals.TOKEN_LENGTH = 32;
    Globals.TIME_BEFORE_RETRY = 5000;
    Globals.DEFAULT_PLAYERID = "0";
    Globals.URI_TOKEN_SCRIPT = "./php/token.php";
    Globals.SCORESABER_API_PROXY_URI = "./php/scoreSaberProxy.php";
    Globals.BEATLEADER_API_PROXY_URI = "./php/beatLeaderPlayerProxy.php";
    Globals.BEATLEADER_SONG_API_PROXY_URI = "./php/beatLeaderSongProxy.php";
    Globals.BEATSAVER_API_URI = "https://api.beatsaver.com";
    Globals.AUDIO_TRIP_SONG_PROXY = "./php/audioTripProxy.php";
    Globals.FPS_REFRESH = 1000 / 5;
    let E_POSITION;
    (function (E_POSITION) {
        E_POSITION[E_POSITION["TOP_LEFT"] = 0] = "TOP_LEFT";
        E_POSITION[E_POSITION["TOP_RIGHT"] = 1] = "TOP_RIGHT";
        E_POSITION[E_POSITION["BOTTOM_LEFT"] = 2] = "BOTTOM_LEFT";
        E_POSITION[E_POSITION["BOTTOM_RIGHT"] = 3] = "BOTTOM_RIGHT";
    })(E_POSITION = Globals.E_POSITION || (Globals.E_POSITION = {}));
    Globals.cssPosition = ["top-left", "top-right", "bottom-left", "bottom-right"];
    Globals.SKIN_AVAILABLE = {
        0: {
            default: ["./skins/playerCard/default/", "index.html", "style.css"],
            freemium: ["./skins/playerCard/freemium/", "index.html", "style.css"]
        },
        1: {
            default: ["./skins/songCard/default/", "index.html", "style.css"],
            freemium: ["./skins/songCard/freemium/", "index.html", "style.css"],
            reselim: ["./skins/songCard/reselim/", "index.html", "style.css"],
            dietah: ["./skins/songCard/dietah/", "index.html", "style.css"]
        },
        2: {
            default: ["./skins/leaderboard/default/", "index.html", "rows.html", "style.css"],
            minify: ["./skins/leaderboard/minify/", "index.html", "rows.html", "style.css"]
        },
        3: {
            default: ["./skins/setup/default/", "indexMenu.html", "generalMenu.html", "gamesAndPluginsMenu.html", "overlayMenu.html", "style.css"]
        },
        4: {
            default: ["./skins/setup/default/", "indexOptions.html", "generalOptions.html", "gamesAndPluginsOptions.html", "overlayOptions.html", "playerCardOptions.html", "songCardOptions.html", "leaderboardOptions.html", "style.css"]
        }
    };
})(Globals || (Globals = {}));
