import { ServiceAction, Extension, ExtensionAction, PluginContext, log } from 'minimajs';

export default class Activator {
    /**
     * 插件上下文缓存
     * 
     * @type {PluginContext}
     * @static
     * @memberof Activator
     */
    static context = null;
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.serviceChangedListener = this.serviceChangedListener.bind(this);
        this.extensionChangedListener = this.extensionChangedListener.bind(this);
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        Activator.context = context;
        Activator.context.addServiceChangedListener(this.serviceChangedListener);
        Activator.context.addExtensionChangedListener(this.extensionChangedListener);

        log.logger.info(`INFO: The plugin ${context.plugin.id} is started.`);
    }

    /**
     * 服务监听器
     * 
     * @param {string} name 服务名称
     * @param {ServiceAction} action 服务变化活动
     * @memberof Activator
     */
    serviceChangedListener(name, action) {
        if (name === 'myService' && action === ServiceAction.ADDED) {
            let myService = Activator.context.getDefaultService(name);
            if (myService) {
                log.logger.info(`Get the myService instance successfully.`);
            }
        } else if (action === ServiceAction.REMOVED) {
            log.logger.info(`The service ${name} is removed.`);
        }
    }

    /**
     * 扩展变更监听器
     * 
     * @param {Extension} extension 扩展对象
     * @param {ExtensionAction} action 扩展对象变化活动
     * @memberof Activator
     */
    extensionChangedListener(extension, action) {
        if (action === ExtensionAction.ADDED) {
            log.logger.info(`The extension ${extension.id} is added.`);
            let extensions = Activator.context.getExtensions('myExtension');
            log.logger.info(`The extension count is ${extensions.size}.`);
        }

        if (action === ExtensionAction.REMOVED) {
            log.logger.info(`The extension ${extension.id} is removed.`);
        }
    }

    /**
     * 插件出口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    stop(context) {
        Activator.context = null;
        log.logger.info(`INFO: The plugin ${context.plugin.id} is stopped.`);
    }
}