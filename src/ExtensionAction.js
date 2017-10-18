/**
 * 扩展变化活动，增加或者删除，插件启动时增加扩展、停止时删除扩展
 * 
 * @export
 * @class ExtensionAction
 */
export default class ExtensionAction {
    /**
     * 增加扩展
     * 
     * @static
     * @memberof ExtensionAction
     */
    static ADDED = new ExtensionAction('added');
    /**
     * 删除扩展
     * 
     * @static
     * @memberof ExtensionAction
     */
    static REMOVED = new ExtensionAction('removed');

    /**
     * 创建一个扩展变更活动
     * 
     * @ignore
     * @param {any} action 
     * @memberof ExtensionAction
     */
    constructor(action) {
        this.action = action;
        Object.freeze(this);
    }

    /**
     * 变化的活动集合，增加、删除
     * 
     * @static
     * @memberof ExtensionAction
     */
    static values = function() {
        const enumValues = [];
        enumValues.push(ExtensionAction.ADDED);
        enumValues.push(ExtensionAction.REMOVED);
        return enumValues;
    }
}

Object.freeze(ExtensionAction);