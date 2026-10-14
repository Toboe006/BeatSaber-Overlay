import { WebSocketManager } from "./websockets/websocketsManager.js";
import { BsPlusPlugin } from './websockets/plugins/beatsaber/bsplus.js';
import { HttpSiraStatusPlugin } from './websockets/plugins/beatsaber/httpsirastatus.js';
import { DataPullerPlugin } from './websockets/plugins/beatsaber/datapuller.js';
import { AdofaiWebPlugin } from './websockets/plugins/adofai/adofaiweb.js';
import { AudicaWebsocketServerPlugin } from './websockets/plugins/audica/audicawebsocketserver.js';
import { AtsTypesPlugin } from './websockets/plugins/audiotrip/atstypes.js';
import { SynthRidersWebsocketModPlugin } from './websockets/plugins/synthriders/synthriderswebsocketmod.js';
export class Plugins {
    constructor() {
        this.manager = new WebSocketManager();
        this.setupDisplay = false;
    }
    async connection() {
        new BsPlusPlugin(this.manager);
        new HttpSiraStatusPlugin(this.manager);
        new DataPullerPlugin(this.manager);
        new AdofaiWebPlugin(this.manager);
        new AudicaWebsocketServerPlugin(this.manager);
        new AtsTypesPlugin(this.manager);
        new SynthRidersWebsocketModPlugin(this.manager);
    }
    removeConnection() {
        return new Promise(resolve => {
            this.manager.disconnectAll();
            setTimeout(() => resolve(""), 250);
        });
    }
    static get Instance() {
        return this._instance || (this._instance = new this());
    }
}
