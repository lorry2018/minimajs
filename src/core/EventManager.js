import Extension from '../Extension';
import ExtensionAction from '../ExtensionAction';
import Framework from './Framework';
import FrameworkState from './FrameworkState';
import PluginState from '../PluginState';
import ServiceAction from '../ServiceAction';
import log from '../utility/log';

/**
 * 事件管理器，用于监听、取消监听、触发事件
 * 
 * @ignore
 * @export
 * @class EventManager
 */
export default class EventManager {
    /**
     * 创建一个事件管理器
     * 
     * @ignore
     * @memberof EventManager
     */
    constructor() {
        this.frameworkStateChangedListeners = new Set();
        this.pluginStateChangedListeners = new Set();
        this.serviceChangedListeners = new Set();
        this.extensionChangedListeners = new Set();

        this.dispose = this.dispose.bind(this);

        this.addPluginStateChangedListener = this.addPluginStateChangedListener.bind(this);
        this.firePluginStateChanged = this.firePluginStateChanged.bind(this);
        this.removePluginStateChangedListener = this.removePluginStateChangedListener.bind(this);

        this.addFrameworkStateChangedListener = this.addFrameworkStateChangedListener.bind(this);
        this.fireFrameworkStateChanged = this.fireFrameworkStateChanged.bind(this);
        this.removeFrameworkStateChangedListener = this.removeFrameworkStateChangedListener.bind(this);

        this.addServiceChangedListener = this.addServiceChangedListener.bind(this);
        this.fireServiceChanged = this.fireServiceChanged.bind(this);
        this.removeServiceChangedListener = this.removeServiceChangedListener.bind(this);

        this.addExtensionChangedListener = this.addExtensionChangedListener.bind(this);
        this.fireExtensionChanged = this.fireExtensionChanged.bind(this);
        this.removeExtensionChangedListener = this.removeExtensionChangedListener.bind(this);
    }

    /**
     * 清理资源
     * 
     * @memberof EventManager
     */
    dispose() {
        this.frameworkStateChangedListeners.clear();
        this.pluginStateChangedListeners.clear();
        this.serviceChangedListeners.clear();
        this.extensionChangedListeners.clear();
    }

    /**
     * 添加框架状态监听器
     * 
     * @param {function} listener 监听器函数
     * @example 
     * frameworkStateChangedListener(framework, previousState, currentState) {
     *     // ...
     * }
     * @memberof EventManager
     */
    addFrameworkStateChangedListener(listener) {
        if (!this.frameworkStateChangedListeners.has(listener)) {
            this.frameworkStateChangedListeners.add(listener);
        }
    }

    /**
     * 删除框架状态监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof EventManager
     */
    removeFrameworkStateChangedListener(listener) {
        if (this.frameworkStateChangedListeners.has(listener)) {
            this.frameworkStateChangedListeners.delete(listener);
        }
    }

    /**
     * 触发框架状态变更
     * 
     * @param {Framework} framework 框架实例
     * @param {FrameworkState} previousState 前一个状态
     * @param {FrameworkState} currentState 当前状态
     * @memberof EventManager
     */
    fireFrameworkStateChanged(framework, previousState, currentState) {
        for (let listener of this.frameworkStateChangedListeners) {
            try {
                listener(framework, previousState, currentState);
            } catch (error) {
                log.logger.error('Failed to invoke the frameworkStateChanged listener.', error);
            }
        }
    }

    /**
     * 添加插件状态监听器
     * 
     * @param {function} listener 监听器函数
     * @example
     * pluginStateChangedListener(id, previous, current) {
     *     // ...
     * }
     * @memberof EventManager
     */
    addPluginStateChangedListener(listener) {
        if (!this.pluginStateChangedListeners.has(listener)) {
            this.pluginStateChangedListeners.add(listener);
        }
    }

    /**
     * 删除插件状态监听器
     * 
     * @param {function} listener 监听器函数 
     * @memberof EventManager
     */
    removePluginStateChangedListener(listener) {
        if (this.pluginStateChangedListeners.has(listener)) {
            this.pluginStateChangedListeners.delete(listener);
        }
    }

    /**
     * 触发插件状态变更
     * 
     * @param {string} id 插件Id
     * @param {PluginState} previousState 前一个状态
     * @param {PluginState} currentState 当前状态
     * @memberof EventManager
     */
    firePluginStateChanged(id, previousState, currentState) {
        for (let listener of this.pluginStateChangedListeners) {
            try {
                listener(id, previousState, currentState);
            } catch (error) {
                log.logger.error('Failed to invoke the pluginStateChanged listener.', error);
            }
        }
    }

    /**
     * 添加服务变更监听器
     * 
     * @param {function} listener 监听器函数
     * @example 
     * serviceChangedListener(name, action) {
     * }
     * @memberof EventManager
     */
    addServiceChangedListener(listener) {
        if (!this.serviceChangedListeners.has(listener)) {
            this.serviceChangedListeners.add(listener);
        }
    }

    /**
     * 删除服务变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof EventManager
     */
    removeServiceChangedListener(listener) {
        if (this.serviceChangedListeners.has(listener)) {
            this.serviceChangedListeners.delete(listener);
        }
    }

    /**
     * 触发服务变更事件
     * 
     * @param {string} name 服务名称
     * @param {ServiceAction} action 变化活动
     * @memberof EventManager
     */
    fireServiceChanged(name, action) {
        for (let listener of this.serviceChangedListeners) {
            try {
                listener(name, action);
            } catch (error) {
                log.logger.error('Failed to invoke the serviceChanged listener.', error);
            }
        }
    }

    /**
     * 添加扩展变更监听器
     * 
     * @param {function} listener 监听器函数
     * @example
     * extensionChangedListener(extension, action) {
     *     // ......
     * }
     * @memberof EventManager
     */
    addExtensionChangedListener(listener) {
        if (!this.extensionChangedListeners.has(listener)) {
            this.extensionChangedListeners.add(listener);
        }
    }

    /**
     * 删除扩展变更监听器
     * 
     * @param {function} listener 监听器函数
     * @memberof EventManager
     */
    removeExtensionChangedListener(listener) {
        if (this.extensionChangedListeners.has(listener)) {
            this.extensionChangedListeners.delete(listener);
        }
    }

    /**
     * 触发扩展变更时间
     * 
     * @param {Extension} extension 扩展对象
     * @param {ExtensionAction} action 变化活动
     * @memberof EventManager
     */
    fireExtensionChanged(extension, action) {
        for (let listener of this.extensionChangedListeners) {
            try {
                listener(extension, action);
            } catch (error) {
                log.logger.error('Failed to invoke the extensionChanged listener.', error);
            }
        }
    }
}