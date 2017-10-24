import path from 'path';
import { Express } from 'express';
import { PluginContext } from 'minimajs';

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
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        Activator.context = context;
    }

    /**
     * 插件出口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    stop(context) {
        Activator.context = null;
    }
}