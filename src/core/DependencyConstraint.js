import ResolveState from './ResolveState';
import PluginMetadata from './PluginMetadata';
import Version from '../Version';

/**
 * 插件依赖约束
 * 
 * @ignore
 * @class DependencyConstraint
 */
export default class DependencyConstraint {
    /**
     * 创建一个对指定id、版本的依赖约束
     * 
     * @ignore
     * @param {string} id 依赖的插件Id
     * @param {Version} version 依赖的插件版本
     * @memberof DependencyConstraint
     */
    constructor(id, version) {
        this.id = id;
        this.version = version;
        this.state = ResolveState.RESOLVABLE;
        this.cause = '';

        this.markResolvable = this.markResolvable.bind(this);
        this.markFailed = this.markFailed.bind(this);
        this.markSuccess = this.markSuccess.bind(this);
    }

    /**
     * 标记为可以解析
     * 
     * @memberof DependencyConstraint
     */
    markResolvable() {
        this.state = ResolveState.RESOLVABLE;
        this.cause = '';
    }

    /**
     * 标记为解析失败，并记录原因
     * 
     * @param {string} cause 解析失败的原因 
     * @memberof DependencyConstraint
     */
    markFailed(cause) {
        this.state = ResolveState.RESOLVEFAILED;
        this.cause = cause;
    }

    /**
     * 标记为解析成功
     * 
     * @memberof DependencyConstraint
     */
    markSuccess() {
        this.state = ResolveState.resolveSuccess;
        this.cause = '';
    }

    /**
     * 指定插件是否满足当前约束
     * 
     * @param {PluginMetadata} pluginMetadata 指定插件元数据
     * @returns {bool} 如果满足，则返回true，否则返回false
     * @memberof DependencyConstraint
     */
    isSatisfy(pluginMetadata) {
        return this.id === pluginMetadata.id && pluginMetadata.version.compare(this.version) >= 0;
    }
}