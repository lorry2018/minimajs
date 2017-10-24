import path from 'path';
import { Express } from 'express';
import { PluginContext } from 'minimajs';
import PluginService from './services/PluginService';

export default class Activator {
    /**
     * 插件上下文缓存
     * 
     * @type {PluginContext}
     * @static
     * @memberof Activator
     */
    static context = null;
    /**
     * Express 实例
     * 
     * @type {Express}
     * @static
     * @memberof Activator
     */
    static app = null;
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
        Activator.context = context;
        Activator.app = context.getDefaultService('app');

        this.pluginService = new PluginService(context.plugin, Activator.app);
        this.pluginService.register();
    }

    /**
     * 插件出口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    stop(context) {
        this.pluginService.unregister();
        Activator.context = null;
        Activator.app = null;
    }
}