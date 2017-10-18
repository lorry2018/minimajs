import ServiceRegistry from '../ServiceRegistry';
import ServiceAction from '../ServiceAction';
import Assert from '../utility/Assert';

/**
 * 
 * @ignore
 * @export
 * @class ServiceManager
 */
export default class ServiceManager {

    /**
     * 
     * @ignore
     * @param {any} framework 
     * @memberof ServiceManager
     */
    constructor(framework) {
        Assert.notNull('framework', framework);
        this.framework = framework;
        this.services = new Map();

        this.dispose = this.dispose.bind(this);

        this.add = this.add.bind(this);
        this.addWithProperties = this.addWithProperties.bind(this);
        this.findDefaultService = this.findDefaultService.bind(this);
        this.findServices = this.findServices.bind(this);
        this.remove = this.remove.bind(this);
        this.removeByOwner = this.removeByOwner.bind(this);
    }

    dispose() {
        this.services.clear();
    }

    add(serviceName, serviceInstance, serviceOwner) {
        return this.addWithProperties(serviceName, serviceInstance, serviceOwner);
    }

    addWithProperties(serviceName, serviceInstance, serviceOwner, properties) {
        let serviceRegistry = new ServiceRegistry(serviceName, serviceInstance, serviceOwner, properties);
        if (!this.services.has(serviceRegistry.serviceName)) {
            this.services.set(serviceRegistry.serviceName, new Set());
        }

        this.services.get(serviceRegistry.serviceName).add(serviceRegistry);
        this.framework.eventManager.fireServiceChanged(serviceName, ServiceAction.ADDED);
        return serviceRegistry;
    }

    /**
     * 获取匹配的服务
     * 
     * @param {string} name 服务名称
     * @param {any} properties 服务属性过滤
     * @returns {ServiceRegistry[]} 返回匹配的所有服务注册信息
     * @memberof ServiceManager
     */
    findServices(name, properties) {
        Assert.notEmpty('serviceName', name);

        if (!this.services.has(name)) {
            return [];
        }

        let serviceSet = this.services.get(name);
        let matchedServiceRegistries = [];
        for (let serviceRegistry of serviceSet) {
            if (serviceRegistry.match(name, properties)) {
                matchedServiceRegistries.push(serviceRegistry);
            }
        }
        return matchedServiceRegistries;
    }

    findDefaultService(name, properties) {
        Assert.notEmpty('serviceName', name);

        if (!this.services.has(name)) {
            return null;
        }

        let serviceSet = this.services.get(name);
        for (let serviceRegistry of serviceSet) {
            if (serviceRegistry.match(name, properties)) {
                return serviceRegistry.serviceInstance;
            }
        }
        return null;
    }

    remove(serviceRegistry) {
        Assert.notNull('serviceRegistry', serviceRegistry);
        if (this.services.has(serviceRegistry.serviceName)) {
            this.services.get(serviceRegistry.serviceName).remove(serviceRegistry);
            this.framework.eventManager.fireServiceChanged(serviceRegistry.serviceName, ServiceAction.REMOVED);
        }
    }

    removeByOwner(owner) {
        Assert.notNull('serviceOwner', owner);

        for (let pair of this.services) {
            let serviceSet = pair[1];
            let removedServices = [];
            for (let serviceRegistry of serviceSet) {
                if (serviceRegistry.serviceOwner === owner) {
                    removedServices.push(serviceRegistry);
                }
            }

            for (let removedService of removedServices) {
                serviceSet.delete(removedService);
                this.framework.eventManager.fireServiceChanged(removedService.serviceName, ServiceAction.REMOVED);
            }
        }
    }
}