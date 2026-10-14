export class LoggerService {
    constructor(logLevel = 'info') {
        this.logLevel = logLevel;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    info(message, ...optionalParams) {
        if (this.shouldLog('info'))
            console.log(`[INFO]: ${message}`, ...optionalParams);
    }
    warn(message, ...optionalParams) {
        if (this.shouldLog('warn'))
            console.warn(`[WARN]: ${message}`, ...optionalParams);
    }
    error(message, ...optionalParams) {
        if (this.shouldLog('error'))
            console.error(`[ERROR]: ${message}`, ...optionalParams);
    }
    debug(message, ...optionalParams) {
        if (this.shouldLog('debug'))
            console.debug(`[DEBUG]: ${message}`, ...optionalParams);
    }
    shouldLog(level) {
        const levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        return levels[level] >= levels[this.logLevel];
    }
}
