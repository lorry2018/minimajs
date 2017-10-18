/**
 * 插件状态
 * 
 * @export
 * @class PluginState
 */
export default class PluginState {
    /**
     * 安装状态
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static INSTALLED = new PluginState('installed');
    /**
     * 已解析状态
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static RESOLVED = new PluginState('resolved');
    /**
     * 正在启动
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static STARTING = new PluginState('starting');
    /**
     * 正在停止
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static STOPPING = new PluginState('stopping');
    /**
     * 已经启动
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static ACTIVE = new PluginState('active');
    /**
     * 已经卸载
     * 
     * @type {PluginState}
     * @static
     * @memberof PluginState
     */
    static UNINSTALLED = new PluginState('uninstalled');

    /**
     * 创建一个状态
     * 
     * @ignore
     * @param {string} state 
     * @memberof PluginState
     */
    constructor(state) {
        this.state = state;
        Object.freeze(this);
    }

    /**
     * 枚举的集合
     * 
     * @type {PluginState[]}
     * @static
     * @memberof PluginState
     */
    static values = function() {
        const enumValues = [];
        enumValues.push(PluginState.INSTALLED);
        enumValues.push(PluginState.RESOLVED);
        enumValues.push(PluginState.STARTING);
        enumValues.push(PluginState.STOPPING);
        enumValues.push(PluginState.ACTIVE);
        enumValues.push(PluginState.UNINSTALLED);
        return enumValues;
    }
}

Object.freeze(PluginState);