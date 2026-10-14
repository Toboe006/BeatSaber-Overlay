import { AudioTrip } from '../../../../games/audioTrip/audioTrip.js';
export class AtsTypesPlugin {
    constructor(manager) {
        this._audiotrip = new AudioTrip();
        this.manager = manager;
        this.key = 'atstypes';
        this.manager.initialize(`${this.key}`, 'ws://127.0.0.1:48998/', this.handlePrimaryMessage.bind(this));
    }
    handlePrimaryMessage(message) {
        console.log(`[AtsTypes] Message: ${message}`);
        this._audiotrip.dataParser(message);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(this.key, data);
    }
}
