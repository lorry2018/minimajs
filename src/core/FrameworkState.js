/**
 * 框架状态
 * 
 * @export
 * @class FrameworkState
 */
export default class FrameworkState {
    /**
     * 创建状态
     * 
     * @static
     * @memberof FrameworkState
     */
    static CREATED = new FrameworkState('created');
    /**
     * 启动状态
     * 
     * @static
     * @memberof FrameworkState
     */
    static STARTED = new FrameworkState('started');
    /**
     * 正在停止状态
     * 
     * @static
     * @memberof FrameworkState
     */
    static STOPPING = new FrameworkState('stopping');
    /**
     * 停止状态
     * 
     * @static
     * @memberof FrameworkState
     */
    static STOPPED = new FrameworkState('stopped');

    /**
     * 新建一个状态
     * 
     * @ignore
     * @param {string} state 
     * @memberof FrameworkState
     */
    constructor(state) {
        this.state = state;
        Object.freeze(this);
    }

    /**
     * 枚举的所有成员
     * 
     * @static
     * @memberof FrameworkState
     */
    static values = function() {
        const enumValues = [];
        enumValues.push(FrameworkState.CREATED);
        enumValues.push(FrameworkState.STARTED);
        enumValues.push(FrameworkState.STOPPING);
        enumValues.push(FrameworkState.STOPPED);
        return enumValues;
    }
}

Object.freeze(FrameworkState);