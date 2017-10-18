import Assert from '../utility/Assert';
import Constants from '../Constants';
import PluginConfiguration from '../PluginConfiguration';
import Plugin from '../Plugin';
import PluginState from '../PluginState';
import Framework from './Framework';
import EventManager from './EventManager';
import log from '../utility/log';
import fs from 'fs';
import path from 'path';

/**
 * 用于从插件集合根目录中发现和加载插件，加载后，保存在plugins中
 * 
 * @ignore
 * @export
 * @class PluginInstaller
 */
export default class PluginInstaller {

    /**
     * 创建一个实例
     * 
     * @ignore
     * @param {Framework} framework 框架实例
     * @memberof PluginInstaller
     */
    constructor(framework) {
        Assert.notNull('framework', framework);

        this.framework = framework;
        this.pluginsDirectories = framework.pluginsDirectories;
        this.eventManager = framework.eventManager;
        this.plugins = new Map();

        this.dispose = this.dispose.bind(this);

        this.installPlugins = this.installPlugins.bind(this);
        this.installPluginInternal = this.installPluginInternal.bind(this);
        this.installPlugin = this.installPlugin.bind(this);

        this.getPlugin = this.getPlugin.bind(this);
        this.getPlugins = this.getPlugins.bind(this);
    }

    /**
     * 清理资源
     * 
     * @memberof PluginInstaller
     */
    dispose() {
        this.plugins.clear();
    }

    /**
     * 获取插件
     * 
     * @param {string} id 
     * @returns {Plugin} 插件实例
     * @memberof PluginInstaller
     */
    getPlugin(id) {
        Assert.notEmpty('pluginId', id);

        if (!this.plugins.has(id)) {
            return null;
        }
        return this.plugins.get(id);
    }

    /**
     * 获取所有插件
     * 
     * @returns {Map.<string, Plugin>}
     * @memberof PluginInstaller
     */
    getPlugins() {
        return this.plugins;
    }

    /**
     * 从插件集合目录中查找插件，规则为：插件根目录——插件目录（一级子目录）——plugin.json（插件目录的文件），
     * 如果找到plugin.json，则尝试加载解析插件
     * 
     * @memberof PluginInstaller
     */
    installPlugins() {
        for (let pluginsDirectory of this.pluginsDirectories) {
            log.logger.info(`Loading plugins from ${pluginsDirectory}.`);

            let pluginDirectories = fs.readdirSync(pluginsDirectory);
            for (let pluginDirectory of pluginDirectories) {
                pluginDirectory = path.join(pluginsDirectory, pluginDirectory);
                this.installPluginInternal(pluginDirectory);
            }

            log.logger.info(`Plugins are loaded from ${pluginsDirectory} completed.`);
        }

        log.logger.info(`There are ${this.plugins.size} plugins loaded.`);
    }

    /**
     * 加载一个插件，内部使用，返回一个插件对象
     * 
     * @param {string} pluginDirectory 插件目录
     * @returns {Plugin} 插件对象
     * @memberof PluginInstaller
     */
    installPluginInternal(pluginDirectory) {
        let pluginConfigFile = path.join(pluginDirectory, Constants.pluginConfigFileName);
        if (!fs.existsSync(pluginConfigFile)) {
            return null;
        }

        let pluginConfiguration = null;

        try {
            pluginConfiguration = new PluginConfiguration(pluginConfigFile);
        } catch (error) {
            log.logger.error(`Failed load plugin from ${pluginDirectory} since plugin config file ${pluginConfigFile} can not be found.`, error);
            return null;
        }

        if (this.plugins.has(pluginConfiguration.id)) {
            log.error(`Failed to load plugin from ${pluginDirectory} since duplicated plugin id with ${this.plugins.get(pluginConfiguration.id).pluginDirectory}.`);
            return null;
        }

        let plugin = new Plugin(this.framework, pluginDirectory, pluginConfiguration);
        this.plugins.set(plugin.id, plugin);
        log.logger.info(`Plugin ${pluginConfiguration.id} is loaded from ${pluginDirectory}.`);

        this.eventManager.firePluginStateChanged(plugin.id, null, PluginState.INSTALLED);
        return plugin;
    }

    /**
     * 加载一个插件，并执行解析
     * 
     * @param {string} pluginDirectory 
     * @returns {Plugin} 插件对象
     * @memberof PluginInstaller
     */
    installPlugin(pluginDirectory) {
        let plugin = this.installPluginInternal(pluginDirectory);
        if (plugin != null) { // 将插件添加到解析列表
            this.framework.pluginResolver.add(plugin.pluginConfiguration);
        }
        return plugin;
    }
}