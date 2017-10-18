import Assert from '../utility/Assert';
import ExtensionAction from '../ExtensionAction';
import Extension from '../Extension';
import Plugin from '../Plugin';
import Framework from '../core/Framework';

/**
 * 扩展管理器
 * 
 * @ignore
 * @export
 * @class ExtensionManager
 */
export default class ExtensionManager {
    /**
     * 创建一个扩展管理器
     * 
     * @ignore
     * @param {Framework} framework 框架实例
     * @memberof ExtensionManager
     */
    constructor(framework) {
        Assert.notNull('framework', framework);
        this.framework = framework;
        /**
         * @type {Map.<string, Set.<Extension>>}
         */
        this.extensions = new Map();

        this.dispose = this.dispose.bind(this);

        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.removeByOwner = this.removeByOwner.bind(this);
        this.find = this.find.bind(this);
    }

    /**
     * 清理资源
     * 
     * @memberof ExtensionManager
     */
    dispose() {
        this.extensions.clear();
    }

    /**
     * 注册扩展
     * 
     * @param {Extension} extension 扩展对象
     * @memberof ExtensionManager
     */
    add(extension) {
        Assert.notNull('extension', extension);
        if (!this.extensions.has(extension.id)) {
            this.extensions.set(extension.id, new Set());
        }
        this.extensions.get(extension.id).add(extension);

        this.framework.eventManager.fireExtensionChanged(extension, ExtensionAction.ADDED);
    }

    /**
     * 删除扩展
     * 
     * @param {Extension} extension 扩展对象
     * @memberof ExtensionManager
     */
    remove(extension) {
        Assert.notNull('extension', extension);
        if (!this.extensions.has(extension.id)) {
            return;
        }

        let extensionSet = this.extensions.get(extension.id);
        if (!extensionSet.has(extension)) {
            return;
        }

        extensionSet.delete(extension);
        this.framework.eventManager.fireExtensionChanged(extension, ExtensionAction.REMOVED);
    }

    /**
     * 删除插件拥有的所有插件
     * 
     * @param {Plugin} owner 用于扩展的插件
     * @memberof ExtensionManager
     */
    removeByOwner(owner) {
        Assert.notNull('owner', owner);

        for (let pair of this.extensions) {
            let extensionSet = pair[1];
            let removedExtensions = [];
            for (let extension of extensionSet) {
                if (extension.owner.id === owner.id) {
                    removedExtensions.push(extension);
                }
            }

            for (let removedExtension of removedExtensions) {
                extensionSet.delete(removedExtension);
                this.framework.eventManager.fireExtensionChanged(removedExtension, ExtensionAction.REMOVED);
            }
        }
    }

    /**
     * 根据Id查找注册的所有扩展
     * 
     * @param {string} id 扩展Id
     * @returns {Set.<Extension>} 扩展集合
     * @memberof ExtensionManager
     */
    find(id) {
        Assert.notEmpty('extensionId', id);
        if (!this.extensions.has(id)) {
            return new Set();
        }

        return this.extensions.get(id);
    }
}