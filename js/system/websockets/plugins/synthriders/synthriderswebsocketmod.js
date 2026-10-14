import { SynthRiders } from '../../../../games/synthRiders/synthRiders.js';
export class SynthRidersWebsocketModPlugin {
    constructor(manager) {
        this._synthriders = new SynthRiders();
        this.manager = manager;
        this.key = 'synthriderswebsocketmod';
        this.manager.initialize(`${this.key}`, 'ws://127.0.0.1:9000/', this.handlePrimaryMessage.bind(this));
    }
    handlePrimaryMessage(message) {
        console.log(`[SynthRidersWebsocketMod] Message: ${message}`);
        this._synthriders.dataParser(message);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(this.key, data);
    }
}
