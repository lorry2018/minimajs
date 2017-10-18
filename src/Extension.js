import Assert from './utility/Assert';
import Plugin from './Plugin';

/**
 * 扩展对象
 * 
 * @export
 * @class Extension
 */
export default class Extension {
    /**
     * 创建一个扩展对象
     * 
     * @ignore
     * @param {string} id 扩展Id
     * @param {Object} data 扩展数据对象
     * @memberof Extension
     */
    constructor(id, data) {
        Assert.notEmpty('extensionId', id);
        Assert.notNull('extensionData', data);

        this._id = id;
        this._data = data;
    }

    /**
     * 获取注册扩展的插件
     * 
     * @type {Plugin}
     * @memberof Extension
     */
    get owner() {
        return this._owner;
    }

    /**
     * 设置注册扩展的插件
     * 
     * @type {Plugin}
     * @memberof Extension
     */
    set owner(owner) {
        Assert.notNull('extensionOwner', owner);
        this._owner = owner;
    }

    /**
     * 扩展Id
     * 
     * @readonly
     * @memberof Extension
     */
    get id() {
        return this._id;
    }

    /**
     * 扩展数据
     * 
     * @readonly
     * @memberof Extension
     */
    get data() {
        return this._data;
    }
}