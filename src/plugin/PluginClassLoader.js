import Assert from '../utility/Assert';
import path from 'path';
import fs from 'fs';
import log from '../utility/log';

/**
 * 插件类加载起
 * 
 * @ignore
 * @export
 * @class PluginClassLoader
 */
export default class PluginClassLoader {
    /**
     * 所在的插件
     * 
     * @ignore
     * @param {Plugin} plugin 插件
     * @memberof PluginClassLoader
     */
    constructor(plugin) {
        Assert.notNull('plugin', plugin);
        this.plugin = plugin;
    }

    /**
     * 加载类型
     * 
     * @param {string} classPath 类所在的类型
     * @returns {*} 返回加载的类
     * @memberof PluginClassLoader
     */
    loadClass(classPath) {
        let classFullPath = path.join(this.plugin.pluginDirectory, classPath);
        if (!fs.existsSync(classFullPath)) {
            log.logger.error(`Failed to load class ${classPath} from plugin ${this.plugin.id}`);
            return null;
        }
        try {
            return require(classFullPath);
        } catch (error) {
            log.logger.error(`Failed to load class ${classPath} from plugin ${this.plugin.id}`, error);
        }
        return null;
    }
}