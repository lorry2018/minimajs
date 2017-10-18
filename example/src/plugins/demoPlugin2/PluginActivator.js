import { ServiceAction, PluginContext, Plugin, log } from 'minimajs';

export default class PluginActivator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.serviceChangedListener = this.serviceChangedListener.bind(this);
    }

    /**
     * 启动插件
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof PluginActivator
     */
    start(context) {
        log.logger.info(`INFO: The plugin ${context.plugin.id} is started.`);
        context.addServiceChangedListener(this.serviceChangedListener);
    }

    /**
     * 服务监听
     * 
     * @param {string} name 服务名称
     * @param {ServiceAction} action 服务活动
     * @memberof PluginActivator
     */
    serviceChangedListener(name, action) {
        if (action === ServiceAction.ADDED) {
            log.logger.info(`Service ${name} is register.`);
        } else {
            log.logger.info(`Service ${name} is unregister.`);
        }
    }

    /**
     * 停止插件
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof PluginActivator
     */
    stop(context) {
        log.logger.info(`INFO: The plugin ${context.plugin.id} is stopped.`);
    }
}