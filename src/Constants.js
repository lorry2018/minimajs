/* eslint-disable */
import path from 'path';
/**
 * 框架定义的常量
 * 
 * @export
 * @class Constants
 */
export default class Constants {
    /**
     * 框架默认配置文件
     * 
     * @static
     * @memberof Constants
     */
    static minimaConfigFileFullPath = path.resolve('./minima.json');
    /**
     * 插件默认的版本号
     * 
     * @static
     * @memberof Constants
     */
    static defaultVersion = '0.0.0';
    /**
     * 插件默认的起始状态
     * 
     * @static
     * @memberof Constants
     */
    static defaultPluginState = 'active';
    /**
     * 默认插件集合目录，默认plugins
     * 
     * @static
     * @memberof Constants
     */
    static defaultPluginsDirectory = 'plugins';
    /**
     * 安装状态
     * 
     * @static
     * @memberof Constants
     */
    static installedPluginState = 'installed';
    /**
     * 插件默认启动级别，50
     * 
     * @static
     * @memberof Constants
     */
    static defaultStartLevel = 50;
    /**
     * 框架默认启动级别，默认100
     * 
     * @static
     * @memberof Constants
     */
    static defaultFrameworkStartLevel = 100;
    /**
     * 插件配置文件名称，默认为plugin.json
     * 
     * @static
     * @memberof Constants
     */
    static pluginConfigFileName = 'plugin.json';
    /**
     * 插件激活器默认文件，默认为Activator.js
     * 
     * @static
     * @memberof Constants
     */
    static defaultActivator = 'Activator.js';
}