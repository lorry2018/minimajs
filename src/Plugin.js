import PluginState from './PluginState';
import PluginContext from './PluginContext';
import ResolveState from './core/ResolveState';
import PluginClassLoader from './plugin/PluginClassLoader';
import Strings from './utility/Strings';
import Constants from './Constants';
import log from './utility/log';
import fs from 'fs';
import path from 'path';
import Framework from './core/Framework';
import PluginConfiguration from './PluginConfiguration';
import Version from './Version';
import FrameworkState from './core/FrameworkState';

/**
 * 插件类，表示由框架加载的一个插件
 * 
 * @export
 * @class Plugin
 */
export default class Plugin {
    /**
     * 创建一个插件实例
     * 
     * @ignore
     * @param {Framework} framework 插件框架内部类
     * @param {string} pluginDirectory 插件所在目录
     * @param {PluginConfiguration} pluginConfiguration 插件配置解析结果
     * @memberof Plugin
     */
    constructor(framework, pluginDirectory, pluginConfiguration) {
        this.framework = framework;
        this.pluginClassLoader = new PluginClassLoader(this);
        this.activator = null;

        this._pluginDirectory = pluginDirectory;
        this._pluginConfiguration = pluginConfiguration;
        this._state = PluginState.INSTALLED;
        this._context;

        this.assertResolved = this.assertResolved.bind(this);
        this.assertUninstalled = this.assertUninstalled.bind(this);

        this.loadClass = this.loadClass.bind(this);
        this.resolveActivator = this.resolveActivator.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.doStart = this.doStart.bind(this);
        this.doStop = this.doStop.bind(this);

        this.uninstall = this.uninstall.bind(this);
    }

    /**
     * 插件id
     * 
     * @readonly
     * @memberof Plugin
     */
    get id() {
        return this._pluginConfiguration.id;
    }

    /**
     * 插件名称
     * 
     * @readonly
     * @memberof Plugin
     */
    get name() {
        return this._pluginConfiguration.name;
    }

    /**
     * 插件版本，默认为0.0.0
     * 
     * @type {Version}
     * @readonly
     * @memberof Plugin
     */
    get version() {
        return this._pluginConfiguration.version;
    }

    /**
     * 插件状态
     * 
     * @type PluginState
     * @memberof Plugin
     */
    get state() {
        return this._state;
    }

    /**
     * 插件状态
     * 
     * @type PluginState
     * @memberof Plugin
     */
    set state(state) {
        let previous = this._state;
        this._state = state;
        this.framework.eventManager.firePluginStateChanged(this.id, previous, state);
    }

    /**
     * 插件目录
     * 
     * @readonly
     * @memberof Plugin
     */
    get pluginDirectory() {
        return this._pluginDirectory;
    }

    /**
     * 插件配置解析结果
     * 
     * @type PluginConfiguration
     * @readonly
     * @memberof Plugin
     */
    get pluginConfiguration() {
        return this._pluginConfiguration;
    }

    /**
     * 插件上下文
     * 
     * @type PluginContext
     * @readonly
     * @memberof Plugin
     */
    get context() {
        return this._context;
    }

    /**
     * 诊断是否卸载，如果卸载则抛出异常
     * 
     * @param {string} action 
     * @memberof Plugin
     */
    assertUninstalled(action) {
        if (this._state === PluginState.UNINSTALLED) {
            throw new Error(`Failed to ${action} plugin since the plugin ${this.id} is uninstalled and can not do anything.`);
        }
    }

    /**
     * 诊断是否解析，如果没有解析，则抛出异常
     * 
     * @param {string} action 
     * @memberof Plugin
     */
    assertResolved(action) {
        if (this._state !== PluginState.INSTALLED) {
            return;
        }
        if (this.framework.pluginResolver.isResolveSuccess(this.id)) {
            this.state = PluginState.RESOLVED;
        } else {
            let error = `Failed to ${action} plugin since the plugin ${this.id} can not be resolved.`;
            let pluginMetadata = this.framework.pluginResolver.getPluginMetadata(this.id);
            let dependencyConstraints = pluginMetadata.dependencyConstraints;
            for (let dependencyConstraint of dependencyConstraints) {
                if (dependencyConstraint.state === ResolveState.RESOLVEFAILED) {
                    log.logger.error(`The plugin ${this.id} can not be resolved since the dependency can not be resolved for ${dependencyConstraint.cause}.`);
                }
            }
            throw new Error(error);
        }
    }

    /**
     * 加载类型
     * 
     * @param {string} classPath 类路径
     * @returns {function}
     * @memberof Plugin
     */
    loadClass(classPath) {
        this.assertUninstalled('load class from');
        this.assertResolved('load class from');

        return this.pluginClassLoader.loadClass(classPath);
    }

    /**
     * 启动插件
     * 
     * @memberof Plugin
     */
    start() {
        try {
            this.doStart();
        } catch (error) {
            if (this.state === PluginState.STARTING) {
                this._state = PluginState.RESOLVED;
            }
            log.logger.error(`The plugin ${this.id} is failed to start.`, error);
            throw error;
        }
    }

    /**
     * 内部使用，真正进行启动操作
     * 
     * @memberof Plugin
     */
    doStart() {
        if (this._state === PluginState.ACTIVE) {
            return;
        }

        this.assertUninstalled('start');

        // 0 判断当前启动级别是否大于框架，如果是，不允许启动
        if (this._pluginConfiguration.startLevel > this.framework.startLevel) {
            throw new Error(`Failed to start plugin since the plugin ${this.id} startLevel is bigger than framework startLevel.`);
        }
        // 1 解析插件
        this.assertResolved('start');
        // 2 更改状态，创建上下文
        log.logger.info(`The plugin ${this.id} is starting.`);
        this.state = PluginState.STARTING;
        this._context = new PluginContext(this.framework, this);
        // 3 加载激活器
        let activatorClassPath = this.resolveActivator();
        if (activatorClassPath) {
            try {
                // 4 启动激活器
                let activatorClass = require(activatorClassPath).default;
                this.activator = new activatorClass();
                if (typeof this.activator.start === 'function') {
                    this.activator.start(this._context);
                }
            } catch (error) {
                log.logger.error(`Start the activator of plugin ${this.id} failed.`, error);
                throw new Error(`Failed to start plugin ${this.id} since load and start activator ${activatorClassPath} failed for ${error.message}.`);
            }
        } else {
            this.activator = null;
        }

        // 5 启动上下文，加载服务和扩展点
        this._context.start();
        // 6 改变状态
        this.state = PluginState.ACTIVE;
        log.logger.info(`The plugin ${this.id} is active.`);
    }

    /**
     * 解析激活器
     * 
     * @returns {string} 激活器路径，如果没有指定，则返回空
     * @memberof Plugin
     */
    resolveActivator() {
        let activatorClassPath = '';
        if (Strings.hasText(this.pluginConfiguration.activator)) {
            activatorClassPath = path.join(this.pluginDirectory, this.pluginConfiguration.activator);
            if (!fs.existsSync(activatorClassPath)) {
                throw new Error(`Start the plugin ${this.id} failed since the activator ${activatorClassPath} can not be found.`);
            }
        } else {
            activatorClassPath = path.join(this.pluginDirectory, Constants.defaultActivator);
            if (!fs.existsSync(activatorClassPath)) {
                activatorClassPath = '';
            }
        }
        return activatorClassPath;
    }

    /**
     * 停止插件
     * 
     * @memberof Plugin
     */
    stop() {
        this.assertUninstalled('stop');

        if (this.framework.state === FrameworkState.STARTED && !this.pluginConfiguration.stoppable) {
            throw new Error(`The plugin ${this.id} can not be stopped since the stoppable is false in plugin.json.`);
        }

        try {
            this.doStop();
        } catch (error) {
            log.logger.error(`Exception occurs when stopping the plugin ${this.id}.`, error);
        } finally {
            this.state = PluginState.RESOLVED;
            this._context = null;
        }
    }

    /**
     * 内部使用，真正停止插件
     * 
     * @memberof Plugin
     */
    doStop() {
        if (this._state !== PluginState.ACTIVE) {
            return;
        }

        log.logger.info(`The plugin ${this.id} is stopping.`);
        this._state = PluginState.STOPPING;
        if (this.activator) {
            try {
                if (typeof this.activator.stop === 'function') {
                    this.activator.stop(this._context);
                }
            } catch (error) {
                log.logger.error(`The error occurs while stopping the activator of plugin ${this.id} for ${error.message}.`, error);
            }
        }

        try {
            this._context.stop();
        } catch (error) {
            log.logger.error(`The error occurs while stopping the context of plugin ${this.id} for ${error.message}.`, error);
        }

        this._context.dispose();
        log.logger.info(`The plugin ${this.id} is stopped.`);
    }

    /**
     * 卸载插件
     * 
     * @memberof Plugin
     */
    uninstall() {
        // stop()
        this.stop();
        // change state
        this.state = PluginState.UNINSTALLED;
    }
}