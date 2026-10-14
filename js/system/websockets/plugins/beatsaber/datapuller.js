import { DataPuller } from '../../../../games/beatSaber/dataPuller.js';
export class DataPullerPlugin {
    constructor(manager) {
        this._dataPuller = new DataPuller();
        this.secondaryWebsocketLaunched = false;
        this.manager = manager;
        this.key = 'datapuller';
        this.manager.initialize(`${this.key}-primary`, 'ws://127.0.0.1:2946/BSDataPuller/MapData', this.handlePrimaryMessage.bind(this));
    }
    secondarySocketLauncher() {
        if (!this.secondaryWebsocketLaunched) {
            this.manager.initialize(`${this.key}-secondary`, 'ws://127.0.0.1:2946/BSDataPuller/LiveData', this.handleSecondaryMessage.bind(this));
            this.secondaryWebsocketLaunched = true;
            setTimeout(() => {
                this.secondaryWebsocketLaunched = false;
            }, 5000);
        }
    }
    handlePrimaryMessage(message) {
        this.secondarySocketLauncher();
        console.log(`[DataPuller][Primary] Message: ${message}`);
        this._dataPuller.dataParser(message, "mapData");
    }
    handleSecondaryMessage(message) {
        console.log(`[DataPuller][Secondary] Message: ${message}`);
        this._dataPuller.dataParser(message, "liveData");
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(`${this.key}-primary`, data);
    }
    sendSecondaryMessage(data) {
        this.manager.sendMessage(`${this.key}-primary`, data);
    }
}
