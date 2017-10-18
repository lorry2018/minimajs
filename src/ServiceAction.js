/**
 * 服务变更活动
 * 
 * @export
 * @class ServiceAction
 */
export default class ServiceAction {
    /**
     * 增加
     * 
     * @type ServiceAction
     * @static
     * @memberof ServiceAction
     */
    static ADDED = new ServiceAction('added');
    /**
     * 删除
     * 
     * @type ServiceAction
     * @static
     * @memberof ServiceAction
     */
    static REMOVED = new ServiceAction('removed');

    /**
     * 创建活动
     * 
     * @ignore
     * @param {string} action 
     * @memberof ServiceAction
     */
    constructor(action) {
        this.action = action;
        Object.freeze(this);
    }

    /**
     * 枚举值
     * 
     * @type {ServiceAction[]}
     * @static
     * @memberof ServiceAction
     */
    static values = function() {
        const enumValues = [];
        enumValues.push(ServiceAction.ADDED);
        enumValues.push(ServiceAction.REMOVED);
        return enumValues;
    }
}

Object.freeze(ServiceAction);