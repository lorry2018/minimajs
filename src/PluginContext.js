import Assert from './utility/Assert';
import Extension from './Extension';
import Framework from './core/Framework';
import EventManager from './core/EventManager';
import ServiceManager from './service/ServiceManager';
import ServiceRegistry from './ServiceRegistry';
import Plugin from './Plugin';
import path from 'path';

/**
 * 插件上下文，用户经常需要与该类交互，通过该类获取插件实例、服务、扩展、事件等
 * 
 * @export
 * @class PluginContext
 */
export default class PluginContext {

    /**
     * 创建一个插件上下文
     * 
     * @ignore
     * @param {Framework} framework 
     * @param {Plugin} plugin 
     * @memberof PluginContext
     */
    constructor(framework, plugin) {
        Assert.notNull('framework', framework);
        Assert.notNull('plugin', plugin);

        this._framework = framework;
        this._plugin = plugin;

        this.frameworkStateChangedListeners = new Set();
        this.pluginStateChangedListeners = new Set();
        this.serviceChangedListeners = new Set();
        this.extensionChangedListeners = new Set();

        this.dispose = this.dispose.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.getPlugin = this.getPlugin.bind(this);
        this.getPlugins = this.getPlugins.bind(this);

        this.addService = this.addService.bind(this);
        this.removeService = this.removeService.bind(this);
        this.getServices = this.getServices.bind(this);
        this.getDefaultService = this.getDefaultService.bind(this);

        this.addExtension = this.addExtension.bind(this);
        this.removeExtension = this.removeExtension.bind(this);
        this.getExtensions = this.getExtensions.bind(this);

        this.installPlugin = this.installPlugin.bind(this);

        this.addPluginStateChangedListener = this.addPluginStateChangedListener.bind(this);
        this.removePluginStateChangedListener = this.removePluginStateChangedListener.bind(this);

        this.addFrameworkStateChangedListener = this.addFrameworkStateChangedListener.bind(this);
        this.removeFrameworkStateChangedListener = this.removeFrameworkStateChangedListener.bind(this);

        this.addServiceChangedListener = this.addServiceChangedListener.bind(this);
        this.removeServiceChangedListener = this.removeServiceChangedListener.bind(this);

        this.addExtensionChangedListener = this.addExtensionChangedListener.bind(this);
        this.removeExtensionChangedListener = this.removeExtensionChangedListener.bind(this);
    }

    /**
     * 获取关联的插件
     * 
     * @type {Plugin}
     * @readonly
     * @memberof PluginContext
     */
    get plugin() {
        return this._plugin;
    }

    /**
     * 清理资源
     * 
     * @memberof PluginContext
     */
    dispose() {
        this.frameworkStateChangedListeners.clear();
        this.pluginStateChangedListeners.clear();
        this.serviceChangedListeners.clear();
        this.extensionChangedListeners.clear();
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
     * 注册服务
     * 
     * @param {string} serviceName 服务名称
     * @param {Object} serviceInstance 服务实例
     * @param {Object} [properties={}] 服务属性，默认会设置相应的插件id、name、version
     * @returns {ServiceRegistry} 返回服务注册表
     * @memberof PluginContext
     */
    addService(serviceName, serviceInstance, properties = {}) {
        if (!properties.pluginId) {
            properties.pluginId = this.id;
            properties.pluginName = this.plugin.name;
            properties.pluginVersion = this.plugin.version;
            properties.global = false;
        }
        return this._framework.serviceManager.add(serviceName, serviceInstance, this.plugin, properties);
    }

    /**
     * 卸载服务
     * 
     * @param {ServiceRegistry} serviceRegistry 服务注册表
     * @memberof PluginContext
     */
    removeService(serviceRegistry) {
        this._framework.serviceManager.remove(serviceRegistry);
    }

    /**
     * 获取服务，注意返回的服务不应该没有properties
     * 
     * @param {string} name 服务名称
     * @param {Object} properties 服务属性过滤 
     * @returns {ServiceRegistry[]} 服务对象集合
     * @memberof PluginContext
     */
    getServices(name, properties) {
        return this._framework.serviceManager.findServices(name, properties);
    }

    /**
     * 获取一个默认服务
     * 
     * @param {string} name 服务名称
     * @param {Object} properties 服务属性过滤 ß
     * @returns {Object} 服务对象
     * @memberof PluginContext
     */
    getDefaultService(name, properties) {
        return this._framework.serviceManager.findDefaultService(name, properties);
    }

    /**
     * 注册扩展
     * 
     * @param {Extension} extension 扩展实例
     * @memberof PluginContext
     */
    addExtension(extension) {
        this._framework.extensionManager.add(extension);
    }

    /**
     * 获取扩展集合
     * 
     * @param {string} id 
     * @returns {Set.<Extension>} 返回匹配的扩展集合
     * @memberof PluginContext
     */
    getExtensions(id) {
        return this._framework.extensionManager.find(id);
    }

    /**
     * 删除扩展对象
     * 
     * @param {Extension} extension 扩展实例
     * @memberof PluginContext
     */
    removeExtension(extension) {
        this._framework.extensionManager.remove(extension);
    }

    /**
     * 安装一个插件
     * 
     * @param {string} pluginDirectory 插件目录
     * @returns {Plugin} 插件实例
     * @memberof PluginContext
     */
    installPlugin(pluginDirectory) {
        return this._framework.pluginInstaller.installPlugin(pluginDirectory);
    }

    /**
     * 添加框架状态监听器
     * 
     * @param {function} listener 监听器函数
     * @example 
     * frameworkStateChangedListener(framework, previousState, currentState) {
     *     // ...
     * }
     * @memberof PluginContext
     */
    addFrameworkStateChangedListener(listener) {
        this.frameworkStateChangedListeners.add(listener);
        this._framework.eventManager.addFrameworkStateChangedListener(listener);
    }

    /**
     * 删除框架状态监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removeFrameworkStateChangedListener(listener) {
        this.frameworkStateChangedListeners.delete(listener);
        this._framework.eventManager.removeFrameworkStateChangedListener(listener);
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
        this.pluginStateChangedListeners.add(listener);
        this._framework.eventManager.addPluginStateChangedListener(listener);
    }

    /**
     * 删除插件状态监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removePluginStateChangedListener(listener) {
        this.pluginStateChangedListeners.delete(listener);
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
        this.serviceChangedListeners.add(listener);
        this._framework.eventManager.addServiceChangedListener(listener);
    }

    /**
     * 删除服务变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removeServiceChangedListener(listener) {
        this.serviceChangedListeners.delete(listener);
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
        this.extensionChangedListeners.add(listener);
        this._framework.eventManager.addExtensionChangedListener(listener);
    }

    /**
     * 删除扩展变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof PluginContext
     */
    removeExtensionChangedListener(listener) {
        this.extensionChangedListeners.delete(listener);
        this._framework.eventManager.removeExtensionChangedListener(listener);
    }

    /**
     * 启动上下文
     * 
     * @memberof PluginContext
     */
    start() { // 注册服务、扩展
        for (let service of this.plugin.pluginConfiguration.services) {
            let name = service.name;
            let serviceClass = require(path.join(this.plugin.pluginDirectory, service.service)).default;
            let serviceInstance = new serviceClass();

            this.addService(name, serviceInstance, service.properties);
        }

        for (let extensionData of this.plugin.pluginConfiguration.extensions) {
            let extension = new Extension(extensionData.id, extensionData.data);
            extension.owner = this.plugin;
            this.addExtension(extension);
        }
    }

    /**
     * 停止上下文
     * 
     * @memberof PluginContext
     */
    stop() {
        for (let listener of this.pluginStateChangedListeners) {
            this.removePluginStateChangedListener(listener);
        }
        for (let listener of this.serviceChangedListeners) {
            this.removeServiceChangedListener(listener);
        }
        for (let listener of this.extensionChangedListeners) {
            this.removeExtensionChangedListener(listener);
        }
        for (let listener of this.frameworkStateChangedListeners) {
            this.removeFrameworkStateChangeListener(listener);
        }
        this._framework.extensionManager.removeByOwner(this._plugin);
        this._framework.serviceManager.removeByOwner(this._plugin);
    }
}