import { HTTP_sira_Status } from '../../../../games/beatSaber/HTTP_sira_Status.js';
export class HttpSiraStatusPlugin {
    constructor(manager) {
        this._httpSiraStatus = new HTTP_sira_Status();
        this.manager = manager;
        this.key = 'httpsirastatus';
        this.manager.initialize(`${this.key}`, 'ws://127.0.0.1:6557/socket', this.handlePrimaryMessage.bind(this));
    }
    handlePrimaryMessage(message) {
        console.log(`[HttpSiraStatus] Message: ${message}`);
        this._httpSiraStatus.dataParser(message);
    }
    sendPrimaryMessage(data) {
        this.manager.sendMessage(this.key, data);
    }
}
