import Constants from './Constants';
import FrameworkState from './core/FrameworkState';
import PluginState from './PluginState';
import ServiceAction from './ServiceAction';
import ExtensionAction from './ExtensionAction';
import Extension from './Extension';
import MinimaConfiguration from './MinimaConfiguration';
import Framework from './core/Framework';
import log from './utility/log';
import Assert from './utility/Assert';
import ServiceRegistry from './ServiceRegistry';
import Plugin from './Plugin';
import PluginContext from './PluginContext';
import PluginConfiguration from './PluginConfiguration';
import PluginInstaller from './core/PluginInstaller';
import PluginResolver from './core/PluginResolver';
import PluginStarter from './core/PluginStarter';
import EventManager from './core/EventManager';
import ServiceManager from './service/ServiceManager';
import ExtensionManager from './plugin/ExtensionManager';
import Version from './Version';
import path from 'path';
import fs from 'fs';

/**
 * 创建一个Minima插件框架
 * 
 * @example
 * //1 创建插件框架、启动并从插件集合目录加载运行插件
 * let minima = new Minima(__dirname + './plugins');
 * 
 * // 2 注册全局服务（可以忽略该步骤）
 * let myService = new MyService();
 * minima.addService('myService', myService);
 * 
 * // 3 启动插件框架
 * minima.start();
 * 
 * // 4 获取插件
 * let plugin = minima.getPlugin('demoPlugin');
 * 
 * // 5 停止插件框架
 * minima.stop();
 * 
 * @export
 * @class Minima
 */
export default class Minima {
    /**
     * 插件框架静态实例
     * 
     * @type {Minima}
     * @static
     * @memberof Minima
     */
    static instance = null;
    /**
     * 创建一个插件框架
     * 
     * @ignore
     * @param {string[]} pluginsDirectories 插件集合目录 
     * @memberof Minima
     */
    constructor(...pluginsDirectories) {
        if (pluginsDirectories === null || pluginsDirectories.length === 0) {
            pluginsDirectories = [];
            let defaultPluginsDirectories = [path.resolve('./plugins'), path.resolve('./node_modules')];
            for (let defaultPluginsDirectory of defaultPluginsDirectories) {
                if (fs.existsSync(defaultPluginsDirectory)) {
                    pluginsDirectories.push(defaultPluginsDirectory);
                }
            }
            Assert.notEmptyArray('pluginsDirectories', pluginsDirectories);
        } else {
            for (let pluginsDirectory of pluginsDirectories) {
                Assert.notExists(pluginsDirectory);
            }
        }

        Minima.instance = this;

        this.pluginsDirectories = pluginsDirectories;
        this.startLevel = MinimaConfiguration.startLevel;

        this._framework = new Framework(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.addService = this.addService.bind(this);
        this.getServices = this.getServices.bind(this);
        this.getDefaultService = this.getDefaultService.bind(this);
        this.removeService = this.removeService.bind(this);

        this.getExtensions = this.getExtensions.bind(this);

        this.getPlugin = this.getPlugin.bind(this);
        this.getPlugins = this.getPlugins.bind(this);

        this.addPluginStateChangedListener = this.addPluginStateChangedListener.bind(this);
        this.removePluginStateChangedListener = this.removePluginStateChangedListener.bind(this);

        this.addServiceChangedListener = this.addServiceChangedListener.bind(this);
        this.removeServiceChangedListener = this.removeServiceChangedListener.bind(this);

        this.addExtensionChangedListener = this.addExtensionChangedListener.bind(this);
        this.removeExtensionChangedListener = this.removeExtensionChangedListener.bind(this);
    }

    /**
     * 内部框架类
     * 
     * @readonly
     * @memberof Minima
     */
    get framework() {
        return this._framework;
    }

    /**
     * 注册全局服务
     * 
     * @param {string} serviceName 服务名称
     * @param {Object} serviceInstance 服务实例
     * @param {Object} [properties={}] 服务注册属性，用于服务的绑定过滤
     * @returns {ServiceRegistry} 返回服务注册表对象
     * @memberof Minima
     */
    addService(serviceName, serviceInstance, properties = {}) {
        if (!properties.global) {
            properties.global = true;
        }
        return this._framework.serviceManager.add(serviceName, serviceInstance, this, properties);
    }

    /**
     * 删除一个服务
     * 
     * @param {ServiceRegistry} serviceRegistry 服务注册表
     * @memberof Minima
     */
    removeService(serviceRegistry) {
        this._framework.serviceManager.remove(serviceRegistry);
    }

    /**
     * 获取匹配的所有服务实例，注意，返回的服务没有了Properties，不合适。
     * 
     * @param {string} name 服务名称
     * @param {Object} properties 服务过滤属性
     * @returns {ServiceRegistry[]} 服务实例的集合
     * @memberof Minima
     */
    getServices(name, properties) {
        return this._framework.serviceManager.findServices(name, properties);
    }

    /**
     * 匹配一个服务
     * 
     * @param {string} name 服务名称
     * @param {Object} properties 服务过滤属性
     * @returns {Object} 服务实例
     * @memberof Minima
     */
    getDefaultService(name, properties) {
        return this._framework.serviceManager.findDefaultService(name, properties);
    }

    /**
     * 获取插件实例
     * 
     * @param {string} id 插件id
     * @returns {Plugin} 返回指定id的插件
     * @memberof Minima
     */
    getPlugin(id) {
        return this._framework.pluginInstaller.getPlugin(id);
    }

    /**
     * 获取所有插件
     * 
     * @returns {Map.<string, Plugin>} 插件Map
     * @memberof Minima
     */
    getPlugins() {
        return this._framework.pluginInstaller.getPlugins();
    }

    /**
     * 获取扩展点信息
     * 
     * @param {string} id 扩展点id
     * @returns {Set.<Extension>} 扩展点集合
     * @memberof Minima
     */
    getExtensions(id) {
        return this._framework.extensionManager.find(id);
    }

    /**
     * 添加插件状态监听器
     * 
     * @param {function} listener 监听器函数
     * @example
     * pluginStateChangedListener(id, previous, current) {
     *     // ...
     * }
     * @memberof PluginContext
     */
    addPluginStateChangedListener(listener) {
        this._framework.eventManager.addPluginStateChangedListener(listener);
    }

    /**
     * 删除插件状态监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removePluginStateChangedListener(listener) {
        this._framework.eventManager.removePluginStateChangedListener(listener);
    }

    /**
     * 添加服务变更监听器
     * 
     * @param {function} listener 监听器函数
     * @example 
     * serviceChangedListener(name, action) {
     * }
     * @memberof PluginContext
     */
    addServiceChangedListener(listener) {
        this._framework.eventManager.addServiceChangedListener(listener);
    }

    /**
     * 删除服务变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removeServiceChangedListener(listener) {
        this._framework.eventManager.removeServiceChangedListener(listener);
    }

    /**
     * 添加扩展变更监听器
     * 
     * @param {function} listener 监听器函数
     * @example
     * extensionChangedListener(extension, action) {
     *     // ......
     * }
     * @memberof PluginContext
     */
    addExtensionChangedListener(listener) {
        this._framework.eventManager.addExtensionChangedListener(listener);
    }

    /**
     * 删除扩展变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removeExtensionChangedListener(listener) {
        this._framework.eventManager.removeExtensionChangedListener(listener);
    }

    /**
     * 启动插件框架
     * 
     * @memberof Minima
     */
    start() {
        this._framework.start();
    }

    /**
     * 停止插件框架
     * 
     * @memberof Minima
     */
    stop() {
        this._framework.stop();
    }
}

exports.Constants = Constants;
exports.Minima = Minima;
exports.FrameworkState = FrameworkState;
exports.PluginState = PluginState;
exports.ServiceAction = ServiceAction;
exports.ExtensionAction = ExtensionAction;
exports.log = log;
exports.Assert = Assert;
exports.ServiceRegistry = ServiceRegistry;
exports.Plugin = Plugin;
exports.PluginContext = PluginContext;
exports.PluginConfiguration = PluginConfiguration;
exports.PluginInstaller = PluginInstaller;
exports.PluginResolver = PluginResolver;
exports.PluginStarter = PluginStarter;
exports.EventManager = EventManager;
exports.ServiceManager = ServiceManager;
exports.ExtensionManager = ExtensionManager;
exports.Extension = Extension;
exports.Version = Version;