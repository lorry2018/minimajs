import log from '../utility/log';
import PluginState from '../PluginState';
import Plugin from '../Plugin';
import Framework from './Framework';

/**
 * 为解析成功、初始状态为active的插件进行启动操作
 * 
 * @ignore
 * @export
 * @class PluginStarter
 */
export default class PluginStarter {
    /**
     * 创建一个插件启动器
     * 
     * @ignore
     * @param {Framework} framework 
     * @param {Map.<string, Plugin>} pluginsMap 
     * @memberof PluginStarter
     */
    constructor(framework, pluginsMap) {
        this.framework = framework;
        this.pluginsMap = pluginsMap;
        /**
         * @type {number[]}
         */
        this.startLevels = [];
        /**
         * @type {Map.<number, Set.<Plugin>>}
         */
        this.startLevelPluginsMap = new Map();

        this.dispose = this.dispose.bind(this);
        this.buildWithStartLevel = this.buildWithStartLevel.bind(this);
        this.startPlugins = this.startPlugins.bind(this);
        this.startPluginInternal = this.startPluginInternal.bind(this);
        this.stopPlugins = this.stopPlugins.bind(this);

        this.buildWithStartLevel();
    }

    /**
     * 清理资源
     * 
     * @memberof PluginStarter
     */
    dispose() {
        this.pluginsMap = null;
        this.startLevels = [];
        this.startLevelPluginsMap.clear();
    }

    /**
     * 按照启动级别进行排序，将启动级别按照从小到大排列到startLevels，并将各个级别的插件组织到startLevelPluginsMap中，
     * 这个 map 的 value 是插件集合，插件使用id的字母排序。
     * 
     * @memberof PluginStarter
     */
    buildWithStartLevel() {
        for (let pair of this.pluginsMap) {
            let plugin = pair[1];
            let startLevel = plugin.pluginConfiguration.startLevel;

            if (!this.startLevelPluginsMap.has(startLevel)) {
                this.startLevelPluginsMap.set(startLevel, []);
                this.startLevels.push(startLevel);
            }

            this.startLevelPluginsMap.get(startLevel).push(plugin);
        }

        // Sort by startLevel
        this.startLevels.sort((a, b) => {
            return a - b;
        });

        // Sort by id
        for (let pair of this.startLevelPluginsMap) {
            let plugins = pair[1];
            plugins.sort((a, b) => {
                if (a.id.length == b.id.length) {
                    return a.id.localeCompare(b.id);
                } else {
                    return a.id.length - b.id.length;
                }
            });
        }
    }

    /**
     * 启动插件。插件启动顺序描述如下。<br/>
     * （1）按照启动级别进行分组排序，启动级别越小，越早启动；
     * （2）启动一个插件时，按照依赖关系优先处理，依赖的顶端先启动，依次进行启动。
     * 
     * @memberof PluginStarter
     */
    startPlugins() {
        log.logger.info('Starting the plugins with active initializedState.');
        let failedToStartedPlugins = new Set();
        for (let startLevel of this.startLevels) {
            let startingPlugins = new Set();
            let plugins = this.startLevelPluginsMap.get(startLevel);
            for (let plugin of plugins) {
                if (plugin.pluginConfiguration.initializedState !== PluginState.ACTIVE) {
                    continue;
                }

                this.startPlugin(plugin.id, startingPlugins, failedToStartedPlugins);
            }
        }
        log.logger.info('The plugins with active initializedState are started.');
    }

    /**
     * 递归启动插件，在启动时，会先查找依赖的插件，执行依赖插件先启动
     * 
     * @param {string} id 
     * @param {Set.<string>} startingPlugins 正在启动的插件，避免循环依赖
     * @param {Set.<string>} failedToStartedPlugins 已经启动失败的插件，则不需要再次执行
     * @memberof PluginStarter
     */
    startPlugin(id, startingPlugins, failedToStartedPlugins) {
        startingPlugins.add(id);

        let plugin = this.pluginsMap.get(id);
        let dependencies = this.framework.pluginResolver.getDependencies(id);
        for (let dependency of dependencies) {
            if (startingPlugins.has(dependency.id)) {
                continue;
            }

            this.startPlugin(dependency.id, startingPlugins, failedToStartedPlugins);
        }

        this.startPluginInternal(failedToStartedPlugins, plugin);
    }

    /**
     * 如果插件没有在失败列表，则启动，否则忽略
     * 
     * @param {Plugin[]} failedToStartedPlugins 
     * @param {Plugin} plugin 
     * @memberof PluginStarter
     */
    startPluginInternal(failedToStartedPlugins, plugin) {
        if (failedToStartedPlugins.has(plugin.id)) {
            return;
        }
        try {
            plugin.start();
        } catch (error) {
            failedToStartedPlugins.add(plugin.id);
        }
    }

    /**
     * 停止插件
     * 
     * @memberof PluginStarter
     */
    stopPlugins() {
        log.logger.info('Stopping all plugins.');
        for (let index = this.startLevels.length - 1; index >= 0; index--) {
            let startLevel = this.startLevels[index];

            let plugins = this.startLevelPluginsMap.get(startLevel);
            for (let plugin of plugins) {
                plugin.stop();
            }
        }
        log.logger.info('All plugins are stopped.');
    }
}