import DependencyConstraint from './DependencyConstraint';
import ResolveState from './ResolveState';
import PluginConfiguration from '../PluginConfiguration';

/**
 * 插件解析元数据
 * 
 * @class PluginMetadata
 */
export default class PluginMetadata {

    /**
     * 创建一个元数据
     * 
     * @param {PluginConfiguration} pluginConfiguration 插件配置
     * @ignore
     * @memberof PluginMetadata
     */
    constructor(pluginConfiguration) {
        this.id = pluginConfiguration.id;
        this.version = pluginConfiguration.version;
        this.dependencyConstraints = [];
        for (let dependency of pluginConfiguration.dependencies) {
            this.dependencyConstraints.push(new DependencyConstraint(dependency.id, dependency.version));
        }

        if (this.dependencyConstraints.length === 0) {
            this.state = ResolveState.RESOLVESUCCESS;
        } else {
            this.state = ResolveState.RESOLVABLE;
        }

        this.markResolvable = this.markResolvable.bind(this);
        this.markFailed = this.markFailed.bind(this);
        this.markSuccess = this.markSuccess.bind(this);
        // 依赖链，最后一个节点为依赖的根，启动时，从最后开始
        /**
         * @type {PluginMetadata[]}
         */
        this.dependencies = [];
    }

    /**
     * 标记为可以解析，将所有依赖关系也递归为可解析。注意：如果依赖为空，则直接成功
     * 
     * @memberof PluginMetadata
     */
    markResolvable() {
        if (this.dependencyConstraints.length === 0) {
            this.markSuccess();
            return;
        }

        this.state = ResolveState.RESOLVABLE;
        for (let dependencyConstraint of this.dependencyConstraints) {
            dependencyConstraint.markResolvable();
        }

        this.dependencies = [];
    }

    /**
     * 标记为解析失败，如果依赖为空，则抛出异常
     * 
     * @memberof PluginMetadata
     */
    markFailed() {
        if (this.dependencyConstraints.length === 0) {
            throw new Error(`The plugin ${this.id} with empty dependencies is always resolved successfully.`);
        }
        this.state = ResolveState.RESOLVEFAILED;
        this.dependencies = [];
    }

    /**
     * 标记为成功解析
     * 
     * @memberof PluginMetadata
     */
    markSuccess() {
        this.state = ResolveState.RESOLVESUCCESS;
    }
}