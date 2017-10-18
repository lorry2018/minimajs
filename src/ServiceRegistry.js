import Assert from './utility/Assert';
import Plugin from './Plugin';
import Minima from './Minima';

/**
 * 服务注册对象
 * 
 * @export
 * @class ServiceRegistry
 */
export default class ServiceRegistry {

    /**
     * 注册一条服务
     * 
     * @ignore
     * @param {string} serviceName 服务名称
     * @param {Object} serviceInstance 服务实例
     * @param {Plugin|Minima} serviceOwner 服务拥有者
     * @param {Object} properties 服务属性
     * @memberof ServiceRegistry
     */
    constructor(serviceName, serviceInstance, serviceOwner, properties) {
        Assert.notEmpty('serviceName', serviceName);
        Assert.notNull('serviceInstance', serviceInstance);
        Assert.notNull('serviceOwner', serviceOwner);

        if (!properties) {
            properties = {};
        }

        this._serviceName = serviceName;
        this._serviceInstance = serviceInstance;
        this._properties = properties;
        this._serviceOwner = serviceOwner;

        this.match = this.match.bind(this);
    }

    /**
     * 服务名称
     * 
     * @readonly
     * @memberof ServiceRegistry
     */
    get serviceName() {
        return this._serviceName;
    }

    /**
     * 服务实例
     * 
     * @readonly
     * @memberof ServiceRegistry
     */
    get serviceInstance() {
        return this._serviceInstance;
    }

    /**
     * 服务属性
     * 
     * @readonly
     * @memberof ServiceRegistry
     */
    get properties() {
        return this._properties;
    }

    /**
     * 服务拥有者
     * 
     * @type {Plugin|Minima}
     * @readonly
     * @memberof ServiceRegistry
     */
    get serviceOwner() {
        return this._serviceOwner;
    }

    match(name, properties) {
        if (!properties && this.name === name) {
            return true;
        }

        for (let serviceKeyWord in properties) {
            if (properties[serviceKeyWord] !== this.properties[serviceKeyWord]) {
                return false;
            }
        }

        return true;
    }
}