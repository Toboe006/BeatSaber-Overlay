import { Audica } from '../../../../games/audica/audica.js';
export class AudicaWebsocketServerPlugin {
    constructor(manager) {
        this._audica = new Audica();
        this.manager = manager;
        this.key = 'audicawebsocketserver';
        this.manager.initialize(`${this.key}`, 'ws://127.0.0.1:8085/AudicaStats', this.handlePrimaryMessage.bind(this));
    }
    handlePrimaryMessage(message) {
        console.log(`[AudicaWebsocketServerPlugin] Message: ${message}`);
        this._audica.dataParser(message);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(this.key, data);
    }
}
