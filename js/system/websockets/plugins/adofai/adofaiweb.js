import { Adofai } from '../../../../games/adofai/adofai.js';
export class AdofaiWebPlugin {
    constructor(manager) {
        this._adofai = new Adofai();
        this.manager = manager;
        this.key = 'adofaiweb';
        this.manager.initialize(`${this.key}`, 'ws://127.0.0.1:420/server', this.handlePrimaryMessage.bind(this));
    }
    handlePrimaryMessage(message) {
        console.log(`[AdofaiWebPlugin] Message: ${message}`);
        this._adofai.dataParser(message);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(this.key, data);
    }
}
