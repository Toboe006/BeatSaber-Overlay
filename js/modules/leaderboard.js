import { Globals } from "../globals.js";
import { Template } from "../system/template.js";
export class Leaderboard {
    constructor() {
        this.leaderboardGames = {
            beatSaber: true,
            synthRiders: false,
            audioTrip: false,
            audica: false,
            adofai: false
        };
        this.leaderboardData = {
            disabled: true,
            display: false,
            needUpdate: true,
            endedUpdate: false,
            skin: "default",
            position: 0,
            scale: 1.0,
            pos_x: 0,
            pos_y: 0,
            playerRendering: 5,
            battleRoyal: false,
            playerLocalId: "0",
            playerLocalLUID: 0,
            playerLocalName: "",
            playerLocalPosition: 0,
            roomState: "None"
        };
        this._template = new Template();
        this._leaderboardMap = new Map();
    }
    playerAvatar(playerUserID) {
        if (playerUserID === null || playerUserID === "")
            return "https://cdn.scoresaber.com/avatars/oculus.png";
        return "https://cdn.scoresaber.com/avatars/" + playerUserID + ".jpg";
    }
    playerAccuracy(playerAccuracy, playerDeleted) {
        return playerAccuracy * (playerDeleted ? 0.01 : 1);
    }
    sortLeaderboard(sortBy, sortOrder) {
        let rankPosition = 1;
        const leaderboardSorted = new Map([...this._leaderboardMap].sort((a, b) => sortOrder === "asc" ? a[1][sortBy] - b[1][sortBy] : b[1][sortBy] - a[1][sortBy]));
        for (let [key, value] of leaderboardSorted) {
            if (value.Accuracy === 0 && value.Score === 0 || value.Accuracy === 1 && value.Score === 0) {
                this._leaderboardMap.get(key).Position = 0;
                continue;
            }
            this._leaderboardMap.get(key).Position = rankPosition;
            rankPosition++;
        }
        return leaderboardSorted;
    }
    refreshLeaderboard() {
        let leaderboardSorted = this._leaderboardMap;
        if (!this.leaderboardGames.beatSaber || this.leaderboardData.disabled) {
            this.leaderboardData.disabled = true;
            return;
        }
        if (this.leaderboardData.roomState === "None")
            return;
        leaderboardSorted = this.sortLeaderboard("Accuracy", "desc");
        this._template.refreshUIMap(this._leaderboardMap, Globals.E_MODULES.LEADERBOARD);
        this._template.sortingRows(leaderboardSorted, this.leaderboardData.playerLocalLUID, this._leaderboardMap.size, this.leaderboardData.playerRendering, this.leaderboardData.position, this.leaderboardData.skin, this.leaderboardData.battleRoyal, this.leaderboardData.scale);
        if (!this.leaderboardData.battleRoyal) {
            this._template.moduleScale(Globals.E_MODULES.LEADERBOARD, this.leaderboardData.position, this.leaderboardData.scale);
        }
        else {
            this._template.moduleScaleLeaderboard(Globals.E_MODULES.LEADERBOARD, this.leaderboardData.position, this.leaderboardData.scale);
        }
        this._template.moduleCorners(Globals.E_MODULES.LEADERBOARD, this.leaderboardData.position);
        this._template.modulePosition(Globals.E_MODULES.LEADERBOARD, this.leaderboardData.pos_x, this.leaderboardData.pos_y, !(this.leaderboardData.battleRoyal));
        for (let [key, value] of this._leaderboardMap) {
            this._template.joinClass(key, value);
            this._template.missClass(key, value);
            this._template.positionClass(key, value);
            this._leaderboardMap.get(key).Joined = false;
            this._leaderboardMap.get(key).Missed = false;
        }
    }
    addPlayer(player) {
        this._leaderboardMap.set(player.PlayerJoined.LUID, {
            UserID: player.PlayerJoined.UserID,
            UserName: player.PlayerJoined.UserName,
            UserAvatar: this.playerAvatar(player.PlayerJoined.UserID),
            Position: 0,
            Score: 0,
            Accuracy: 0,
            Combo: 0,
            MissCount: 0,
            Joined: true,
            Leaved: false,
            Failed: false,
            Deleted: false,
            Missed: false,
            Spectating: player.PlayerJoined.Spectating
        });
        if (player.PlayerJoined.UserName === this.leaderboardData.playerLocalName)
            this.leaderboardData.playerLocalLUID = player.PlayerJoined.LUID;
        setTimeout(() => {
            this._template.createRow(player.PlayerJoined.LUID, this._leaderboardMap.get(player.PlayerJoined.LUID), this.leaderboardData.playerLocalLUID, this._leaderboardMap.size, this.leaderboardData.playerRendering, this.leaderboardData.skin);
        }, Globals.MS_TIMER);
    }
    deletePlayer(playerLUID) {
        this._leaderboardMap.delete(playerLUID);
        this._template.deleteRow(playerLUID, this._leaderboardMap.size, this.leaderboardData.playerRendering);
    }
    updatePlayer(player, event) {
        const playerLUID = (event === "PlayerUpdated" || event === "Score") ? player.LUID : null;
        Object.entries(player).forEach(entry => {
            let [key, value] = entry;
            if (key === "LUID")
                return;
            if (playerLUID !== null) {
                if (key === "MissCount" && this._leaderboardMap.get(playerLUID)?.MissCount !== value)
                    this._leaderboardMap.get(playerLUID).Missed = true;
                if (key === "Deleted")
                    this._leaderboardMap.get(playerLUID).Accuracy = this.playerAccuracy(this._leaderboardMap.get(playerLUID).Accuracy, value);
                this._leaderboardMap.get(playerLUID)[key] = value;
            }
        });
    }
    roomLeaved() {
        for (let [key] of this._leaderboardMap) {
            this.deletePlayer(key);
        }
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
