import { LoggerService } from '../../../utils/logger.js';
import { BSPlus } from '../../../../games/beatSaber/BSPlus.js';
export class BsPlusPlugin {
    constructor(manager) {
        this._bsPlus = new BSPlus();
        this.secondaryWebsocketLaunched = false;
        this.songCardStatus = {
            isPlaying: false,
            isPaused: false,
        };
        this.songCardPerformance = {
            time: 0,
            score: 0,
            accuracy: 100,
            combo: 0,
            miss: 0,
            currentHealth: 50,
        };
        this.leaderboardCardStatus = {
            isJoined: false,
            status: 'SelectingSong'
        };
        this.manager = manager;
        this.logger = new LoggerService('debug');
        this.key = 'bsplus';
        this.manager.initialize(`${this.key}-primary`, 'ws://127.0.0.1:2947/socket', this.handlePrimaryMessage.bind(this));
        this.songCardMapInfo = new Map();
        this.leaderboardCardPlayerInfo = new Map();
        this.leaderboardCardPlayerPerformanceInfo = new Map();
    }
    secondarySocketLauncher() {
        if (!this.secondaryWebsocketLaunched) {
            this.manager.initialize(`${this.key}-secondary`, 'ws://127.0.0.1:2948/socket', this.handleSecondaryMessage.bind(this));
            this.secondaryWebsocketLaunched = true;
            setTimeout(() => {
                this.secondaryWebsocketLaunched = false;
            }, 5000);
        }
    }
    handlePrimaryMessage(message) {
        this.secondarySocketLauncher();
        let messageParsed = JSON.parse(message);
        const anyMessage = messageParsed;
        if (anyMessage.mapInfoEvent && !anyMessage.mapInfoChanged)
            anyMessage.mapInfoChanged = anyMessage.mapInfoEvent;
        if (anyMessage.mapInfoChanged && !anyMessage.mapInfoEvent)
            anyMessage.mapInfoEvent = anyMessage.mapInfoChanged;
        this._bsPlus.dataParser(JSON.stringify(messageParsed));
        this.routePrimaryMessage(messageParsed);
    }
    routePrimaryMessage(message) {
        switch (message._type) {
            case 'handshake':
                this.handshakePrimaryMessage(message);
                break;
            case 'event':
                switch (message._event) {
                    case 'gameState':
                        this.gameStatePrimaryMessage(message);
                        break;
                    case 'mapInfo':
                        this.mapInfoPrimaryMessage(message.mapInfoEvent);
                        break;
                    case 'score':
                        this.scorePrimaryMessage(message.scoreEvent);
                        break;
                    case 'pause':
                        this.pausePrimaryMessage(message);
                        break;
                    case 'resume':
                        this.resumePrimaryMessage(message);
                        break;
                    default:
                        this.logger.warn(`[BsPlusPlugin][Primary] Unknown _event : ${message._event}`);
                        break;
                }
                break;
            default:
                this.logger.warn(`[BsPlusPlugin][Primary] Unknown _type : ${message._type}`);
                break;
        }
    }
    handshakePrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] Handshake:', message);
        this.logger.info('%c[BSPlus][Primary] Beat Saber v.' + message.gameVersion + ' | Protocol Plugin Version v.' + message.protocolVersion, 'color: green;');
    }
    gameStatePrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] GameState:', message);
        switch (message.gameStateChanged) {
            case 'Playing':
                this.resetScorePrimary();
                this.songCardStatus.isPlaying = true;
                break;
            case 'none':
            case 'Menu':
            default:
                this.songCardStatus.isPlaying = false;
                break;
        }
    }
    mapInfoPrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] MapInfo:', message);
        const currentMap = this.songCardMapInfo.get('currentMap');
        if (!currentMap) {
            this.logger.debug('[BSPlus][Primary] No current map, setting current map to new map');
            this.songCardMapInfo.set('currentMap', message);
            return;
        }
        const keys = ['level_id', 'characteristic', 'difficulty'];
        const isSameMap = keys.every((key) => currentMap[key] === message[key]);
        if (isSameMap) {
            this.logger.debug('[BSPlus][Primary] Map is not changed');
            return;
        }
        this.logger.debug('[BSPlus][Primary] Map is changed, copy previous map to current map');
        this.songCardMapInfo.set('previousMap', currentMap);
        this.logger.debug('[BSPlus][Primary] Set current map to new map');
        this.songCardMapInfo.set('currentMap', message);
        this.logger.debug('[BSPlus][Primary] SongsCard:', this.songCardMapInfo);
    }
    resetScorePrimary() {
        this.logger.debug('[BsPlusPlugin][Primary] Reset performance for new map');
        this.songCardPerformance.time = 0;
        this.songCardPerformance.score = 0;
        this.songCardPerformance.accuracy = 100;
        this.songCardPerformance.combo = 0;
        this.songCardPerformance.miss = 0;
        this.songCardPerformance.currentHealth = 50;
    }
    scorePrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] Score:', message);
        this.songCardPerformance.time = message.time;
        this.songCardPerformance.score = message.score;
        this.songCardPerformance.accuracy = Math.round((message.accuracy * 100 + Number.EPSILON) * 100) / 100;
        this.songCardPerformance.combo = message.combo;
        this.songCardPerformance.miss = message.missCount;
        this.songCardPerformance.currentHealth = message.currentHealth * 100;
        this.logger.debug('[BsPlusPlugin][Primary] SongCardPerformance:', this.songCardPerformance);
    }
    pausePrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] Pause:', message);
        this.songCardStatus.isPaused = true;
        this.songCardPerformance.time = message.pauseTime;
    }
    resumePrimaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Primary] Resume:', message);
        this.songCardStatus.isPaused = false;
        this.songCardPerformance.time = message.resumeTime;
    }
    handleSecondaryMessage(message) {
        let messageParsed = JSON.parse(message);
        this.routeSecondaryMessage(messageParsed);
    }
    routeSecondaryMessage(message) {
        switch (message._type) {
            case 'handshake':
                this.handshakeSecondaryMessage(message);
                break;
            case 'event':
                switch (message._event) {
                    case 'RoomJoined':
                        this.roomJoinedSecondaryMessage(message);
                        break;
                    case 'RoomLeaved':
                        this.roomLeavedSecondaryMessage(message);
                        break;
                    case 'RoomState':
                        this.roomStateSecondaryMessage(message);
                        break;
                    case 'PlayerJoined':
                        this.playerJoinedSecondaryMessage(message.playerJoinedEvent);
                        break;
                    case 'PlayerLeaved':
                        this.playerLeavedSecondaryMessage(message);
                        break;
                    case 'PlayerUpdated':
                        this.playerUpdatedSecondaryMessage(message.playerUpdatedEvent);
                        break;
                    case 'Score':
                        this.scoreSecondaryMessage(message.scoreEvent);
                        break;
                    default:
                        this.logger.debug(`[BsPlusPlugin][Secondary] Unknown _event : ${message._event}`);
                        break;
                }
                break;
            default:
                this.logger.debug(`[BsPlusPlugin][Secondary] Unknown _type : ${message._type}`);
                break;
        }
    }
    handshakeSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] Handshake:', message);
        this.logger.info('%c[BSPlus][Secondary] Beat Saber v.' + message.GameVersion + ' | Protocol Plugin Version v.' + message.ProtocolVersion, 'color: green;');
    }
    roomJoinedSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] RoomJoined:', message);
        this.leaderboardCardStatus.isJoined = true;
    }
    roomLeavedSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] RoomLeaved:', message);
        this.leaderboardCardStatus.isJoined = false;
    }
    roomStateSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] RoomState:', message);
        this.leaderboardCardStatus.status = message.RoomState;
        switch (message.RoomState) {
            case 'WarmingUp':
                this.resetScoreSecondary();
                break;
            default:
                break;
        }
    }
    playerJoinedSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] PlayerJoined:', message);
        this.leaderboardCardPlayerInfo.set(message.LUID, message);
    }
    playerLeavedSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] PlayerDeleted:', message);
    }
    playerUpdatedSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] PlayerUpdated:', message);
        let player = this.leaderboardCardPlayerInfo.get(message.LUID);
        if (player) {
            player.Spectating = message.Spectating;
            this.leaderboardCardPlayerInfo.set(message.LUID, player);
        }
    }
    resetScoreSecondary() {
        this.logger.debug('[BsPlusPlugin][Secondary] Reset performance for new map');
        this.leaderboardCardPlayerPerformanceInfo.forEach((player, key) => {
            this.leaderboardCardPlayerPerformanceInfo.set(key, {
                ...player,
                Score: 0,
                Accuracy: 50,
                Combo: 0,
                MissCount: 0,
                Failed: false,
                Deleted: false
            });
        });
    }
    scoreSecondaryMessage(message) {
        this.logger.debug('[BsPlusPlugin][Secondary] Score:', message);
        let player = {
            ...message,
            Accuracy: Math.round((message.Accuracy * 100 + Number.EPSILON) * 100) / 100,
        };
        this.leaderboardCardPlayerPerformanceInfo.set(message.LUID, player);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(`${this.key}-primary`, data);
    }
    sendSecondaryMessage(data) {
        this.manager.sendMessage(`${this.key}-secondary`, data);
    }
}
