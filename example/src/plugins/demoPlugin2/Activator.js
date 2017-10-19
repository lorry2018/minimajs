import { Extension, ExtensionAction, PluginContext, log } from 'minimajs';

export default class Activator {
    static logService = null;

    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        let logService = context.getDefaultService('logService');
        if (!logService) {
            throw new Error('The logServie can not be null.');
        }
        Activator.logService = logService;

        logService.log('Get the logService successfully.');
    }

    stop(context) {

    }
}