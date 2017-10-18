import EventManager from './EventManager';
import FrameworkState from './FrameworkState';
import PluginInstaller from './PluginInstaller';
import PluginResolver from './PluginResolver';
import PluginStarter from './PluginStarter';
import ServiceManager from '../service/ServiceManager';
import ExtensionManager from '../plugin/ExtensionManager';
import Assert from '../utility/Assert';
import log from '../utility/log';
import Minima from '../Minima';

/**
 * 插件框架核心类，组合各个模块实现插件框架启动和停止。暂时不支持直接框架重启，如果要支持重启，则需要对组合的资源进行释放。
 * 
 * @ignore
 * @export
 * @class Framework
 */
export default class Framework {

    /**
     * 创建一个插件框架实例
     * 
     * @ignore
     * @param {Minima} minima 插件框架外部类
     * @memberof Framework
     */
    constructor(minima) {
        Assert.notNull('minima', minima);

        this._minima = minima;
        this._startLevel = minima.startLevel;
        this._pluginsDirectories = minima.pluginsDirectories;

        this._state = FrameworkState.CREATED;

        this._eventManager = new EventManager();
        this._serviceManager = new ServiceManager(this);
        this._extensionManager = new ExtensionManager(this);
        this._pluginInstaller = new PluginInstaller(this);

        this._pluginResolver;
        this._pluginStarter;

        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.doStop = this.doStop.bind(this);
    }

    /**
     * 插件框架目前的状态
     * 
     * @type {FrameworkState}
     * @memberof Framework
     */
    get state() {
        return this._state;
    }

    /**
     * 更改插件框架状态，仅内部使用
     * 
     * @type {FrameworkState}
     * @memberof Framework
     */
    set state(state) {
        let previous = this._state;
        this._state = state;
        this._eventManager.fireFrameworkStateChanged(this, previous, state);
    }

    /**
     * 插件集合的目录
     * 
     * @type {string[]}
     * @readonly
     * @memberof Framework
     */
    get pluginsDirectories() {
        return this._pluginsDirectories;
    }

    /**
     * 事件管理器
     * 
     * @type {EventManager}
     * @readonly
     * @memberof Framework
     */
    get eventManager() {
        return this._eventManager;
    }

    /**
     * 服务管理器
     * 
     * @type {ServiceManager}
     * @readonly
     * @memberof Framework
     */
    get serviceManager() {
        return this._serviceManager;
    }

    /**
     * 扩展点管理器
     * 
     * @type {ExtensionManager}
     * @readonly
     * @memberof Framework
     */
    get extensionManager() {
        return this._extensionManager;
    }

    /**
     * 插件安装器
     * 
     * @type {PluginInstaller}
     * @readonly
     * @memberof Framework
     */
    get pluginInstaller() {
        return this._pluginInstaller;
    }

    /**
     * 插件解析器
     * 
     * @type {PluginResolver}
     * @readonly
     * @memberof Framework
     */
    get pluginResolver() {
        return this._pluginResolver;
    }

    /**
     * 插件框架启动级别
     * 
     * @type {number}
     * @readonly
     * @memberof Framework
     */
    get startLevel() {
        return this._startLevel;
    }

    /**
     * 启动插件框架
     * 
     * @memberof Framework
     */
    start() {
        this._pluginInstaller.installPlugins();
        let pluginConfigurations = [];
        for (let pair of this._pluginInstaller.plugins) {
            let plugin = pair[1];
            pluginConfigurations.push(plugin.pluginConfiguration);
        }
        this._pluginResolver = new PluginResolver(pluginConfigurations);
        this._pluginResolver.resolve();

        this._pluginStarter = new PluginStarter(this, this._pluginInstaller.plugins);
        this._pluginStarter.startPlugins();

        this.state = FrameworkState.STARTED;
    }

    /**
     * 停止插件框架
     * 
     * @memberof Framework
     */
    stop() {
        if (this.state !== FrameworkState.STARTED) {
            return;
        }

        this.state = FrameworkState.STOPPING;
        try {
            this.doStop();
        } catch (error) {
            log.logger.error(`Failed to stop the framework since the error ${error.message}.`, error);
        } finally {
            this.state = FrameworkState.STOPPED;
        }
    }

    /**
     * 停止插件框架，清理资源
     * 
     * @memberof Framework
     */
    doStop() {
        this._pluginStarter.stopPlugins();

        this._eventManager.dispose();
        this._extensionManager.dispose();
        this._serviceManager.dispose();
        this._pluginStarter.dispose();
        this._pluginResolver.dispose();
        this._pluginInstaller.dispose();
    }
}