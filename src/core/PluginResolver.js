import ResolveState from './ResolveState';
import PluginMetadata from './PluginMetadata';
import PluginConfiguration from '../PluginConfiguration';
import DependencyConstraint from './DependencyConstraint';

/**
 * 依赖解析算法采用标记法，即假设所有插件均可以解析，然后开始逐遍扫描插件，如果发现插件依赖缺失或者
 * 依赖的插件已经解析失败，则标记该插件解析失败，并且需要再次下一轮扫描直到没有发现解析失败的插件。<br/>
 * 
 * 依赖解析算法描述如下：<br/>
 * （1）插件元数据描述为：pluginMetadata {id, version, 
 *                                    resolvable（可以解析）或者resolveSuccess（如果依赖关系为空，则解析成功）,
 *                                    dependencies = [{id, version}]}
 *     即每一个插件依赖解析元数据为标识、版本、依赖列表；<br/>
 * （2）建立一个插件元数据队列，比如[a, b, c, d, e, f];<br/>
 * （3）定义插件解析失败：依赖插件不存在或者依赖插件解析失败；<br/>
 * （4）从头到位，检查插件，如果插件resolvable，分析插件是否解析失败，如果失败则修改resolveFailed；<br/>
 * （5）重复步骤（4），如果没有再发现resolvable插件解析失败，则转到（6）；<br/>
 * （6）将所有剩下的resolvable插件的状态修改为resolveSuccess。<br/>
 * <br/>
 * 增加一个元素：<br/>
 * （1）元素初始化为：resolvable；<br/>
 * （2）将resolveFailed的元素修改为resolvable；<br/>
 * （3）重新解析。<br/>
 * <br/>
 * 删除一个元素，暂时不考虑，因此插件卸载时，不会直接删除，因为直接删除的话，需要停止掉那些依赖它的插件，过于复杂。<br/>
 * （1）如果该元素为resolveFailed，则直接返回；<br/>
 * （2）如果该元素为resolveSuccess，则需要重新标记并进行全部解析。<br/>
 * 
 * @ignore
 * @export
 * @class PluginResolver
 */
export default class PluginResolver {

    /**
     * 创建一个插件解析器
     * 
     * @param {PluginConfiguration[]} pluginConfigurations 插件配置集合 
     * @ignore
     * @memberof PluginResolver
     */
    constructor(pluginConfigurations) {
        /**
         * @type {Map.<string, PluginMetadata>}
         */
        this.pluginMetadatas = new Map();

        this.dispose = this.dispose.bind(this);

        this.buildPluginMetadatas = this.buildPluginMetadatas.bind(this);
        this.buildPluginMetadatas(pluginConfigurations);

        this.resolve = this.resolve.bind(this);
        this.findUnsatisfiedConstraints = this.findUnsatisfiedConstraints.bind(this);
        this.markSuccess = this.markSuccess.bind(this);
        this.add = this.add.bind(this);
        this.remove = this.remove.bind(this);
        this.isResolveSuccess = this.isResolveSuccess.bind(this);
        this.getPluginMetadata = this.getPluginMetadata.bind(this);

        this.getDependencies = this.getDependencies.bind(this);
        this.buildAllDependencies = this.buildAllDependencies.bind(this);
        this.buildDependencies = this.buildDependencies.bind(this);

        this.getDependencyChain = this.getDependencyChain.bind(this);
        this.buildDependencyChain = this.buildDependencyChain.bind(this);
        this.buildFirstLevelDependencyChain = this.buildFirstLevelDependencyChain.bind(this);
    }

    /**
     * 清理资源
     * 
     * @memberof PluginResolver
     */
    dispose() {
        this.pluginMetadatas.clear();
    }

    /**
     * 构建插件解析元数据集合。
     * 
     * @param {PluginConfiguration[]} pluginConfigurations 插件配置 
     * @memberof PluginResolver
     */
    buildPluginMetadatas(pluginConfigurations) {
        for (let pluginConfiguration of pluginConfigurations) {
            this.pluginMetadatas.set(pluginConfiguration.id, new PluginMetadata(pluginConfiguration));
        }
    }

    /**
     * 执行依赖关系解析，支持循环依赖
     * 
     * @memberof PluginResolver
     */
    resolve() {
        let hasFailed;
        do {
            hasFailed = false; // 初始化状态，如果没有发现有解析失败的，则直接停止，对于正常状态，解析速度非常快
            for (let pair of this.pluginMetadatas) {
                let pluginMetadata = pair[1];
                if (pluginMetadata.state !== ResolveState.RESOLVABLE) {
                    continue;
                }
                let unsatisfiedConstraints = this.findUnsatisfiedConstraints(pluginMetadata);
                if (unsatisfiedConstraints.length > 0) {
                    pluginMetadata.markFailed();
                    hasFailed = true;
                }
            }
        }
        while (hasFailed);

        this.markSuccess();
    }

    /**
     * 查找插件未能够满足的依赖约束
     * 
     * @param {PluginMetadata} pluginMetadata 插件元数据
     * @returns {DependencyConstraint[]} 返回为满足的约束
     * @memberof PluginResolver
     */
    findUnsatisfiedConstraints(pluginMetadata) {
        let unsatisfiedConstraints = [];
        for (let dependencyConstraint of pluginMetadata.dependencyConstraints) {
            if (!this.pluginMetadatas.has(dependencyConstraint.id)) {
                dependencyConstraint.markFailed(`the dependency[${dependencyConstraint.id}, ${dependencyConstraint.version.versionString}] of plugin ${pluginMetadata.id} can not be resolved the dependent plugin does not exist`);
                unsatisfiedConstraints.push(dependencyConstraint);
                continue;
            }

            let dependentPluginMetadata = this.pluginMetadatas.get(dependencyConstraint.id);
            if (dependentPluginMetadata.state === ResolveState.RESOLVEFAILED) {
                dependencyConstraint.markFailed(`the dependency[${dependencyConstraint.id}, ${dependencyConstraint.version.versionString}] of plugin ${pluginMetadata.id} can not be resolved the dependent plugin is resolved failed`);
                unsatisfiedConstraints.push(dependencyConstraint);
                continue;
            }

            if (!dependencyConstraint.isSatisfy(dependentPluginMetadata)) {
                dependencyConstraint.markFailed(`the dependency[${dependencyConstraint.id}, ${dependencyConstraint.version.versionString}] of plugin ${pluginMetadata.id} can not be resolved the dependent plugin exists but the version constraint can not be satisfied`);
                unsatisfiedConstraints.push(dependencyConstraint);
                continue;
            }
        }

        return unsatisfiedConstraints;
    }

    /**
     * 将剩余的可解析插件直接标识为解析成功
     * 
     * @memberof PluginResolver
     */
    markSuccess() {
        let needToBuildDependencyPlugins = [];
        for (let pair of this.pluginMetadatas) {
            let pluginMetadata = pair[1];
            if (pluginMetadata.state !== ResolveState.RESOLVABLE) {
                continue;
            }

            needToBuildDependencyPlugins.push(pluginMetadata);
            pluginMetadata.markSuccess();
        }

        this.buildAllDependencies(needToBuildDependencyPlugins);
    }

    /**
     * 构建所有插件的第一级依赖关系，用于在框架启动时，需要递归启动依赖的插件。
     * 
     * @param {PluginMetadata[]} pluginMetadatas 需要构建的插件元数据集合
     * @memberof PluginResolver
     */
    buildAllDependencies(pluginMetadatas) {
        for (let pluginMetadata of pluginMetadatas) {
            this.buildDependencies(pluginMetadata);
        }
    }

    /**
     * 为一个插件构建第一级依赖关系
     * 
     * @param {PluginMetadata} pluginMetadata 需要构建的插件元数据
     * @memberof PluginResolver
     */
    buildDependencies(pluginMetadata) {
        let dependencies = [];

        for (let dependencyConstraint of pluginMetadata.dependencyConstraints) {
            if (pluginMetadata.id === dependencyConstraint.id) {
                continue;
            }
            if (this.existsInPluginMetadatas(dependencies, dependencyConstraint.id)) {
                continue;
            }
            dependencies.push(this.pluginMetadatas.get(dependencyConstraint.id));
        }

        pluginMetadata.dependencies = dependencies;
    }

    /**
     * 是否已经在依赖中存在
     * 
     * @param {PluginMetadata[]} pluginMetadatas 
     * @param {string} id 
     * @returns {boolean} 如果存在返回true，否则返回false
     * @memberof PluginResolver
     */
    existsInPluginMetadatas(pluginMetadatas, id) {
        for (let dependencyPluginMetadata of pluginMetadatas) {
            if (id === dependencyPluginMetadata.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * 新增一个插件
     * 
     * @param {PluginConfiguration} pluginConfiguration 插件配置 
     * @memberof PluginResolver
     */
    add(pluginConfiguration) {
        if (this.pluginMetadatas.has(pluginConfiguration.id)) {
            return;
        }

        this.pluginMetadatas.set(pluginConfiguration.id, new PluginMetadata(pluginConfiguration));
        for (let pair of this.pluginMetadatas) {
            let pluginMetadata = pair[1];
            if (pluginMetadata.state === ResolveState.RESOLVEFAILED) {
                pluginMetadata.markResolvable();
            }
        }

        this.resolve();
    }

    /**
     * 注意：插件的卸载只是停止后做一个标记，否则它会引起其它依赖它的插件，该方法不会使用。
     * 如果支持动态卸载插件，则需要将解析失败的插件及其依赖关系动态停止，这非常危险。
     * 
     * @param {PluginConfiguration} pluginConfiguration 
     * @memberof PluginResolver
     */
    remove(pluginConfiguration) {
        if (!this.pluginMetadatas.has(pluginConfiguration.id)) {
            return;
        }

        // 如果删除的是解析失败，则不影响其它的插件解析状态，删除后直接返回
        let removedPluginMetadata = this.pluginMetadatas.get(pluginConfiguration.id);
        this.pluginMetadatas.delete(removedPluginMetadata.id);
        if (removedPluginMetadata.state === ResolveState.RESOLVEFAILED) {
            return;
        }

        // 标记已经解析成功的插件未未解析，因此这些插件可能因为插件删除导致解析失败
        for (let pair of this.pluginMetadatas) {
            let pluginMetadata = pair[1];
            if (pluginMetadata.state === ResolveState.RESOLVESUCCESS) {
                pluginMetadata.markResolvable();
            }
        }

        this.resolve();
    }

    /**
     * 判断插件是否已经解析成功
     * 
     * @param {string} id 插件Id
     * @returns {bool} 如果解析成功，则返回true，否则返回false
     * @memberof PluginResolver
     */
    isResolveSuccess(id) {
        if (!this.pluginMetadatas.has(id)) {
            return false;
        }

        return this.pluginMetadatas.get(id).state === ResolveState.RESOLVESUCCESS;
    }

    /**
     * 获取插件解析元数据
     * 
     * @param {string} id 插件Id
     * @returns {PluginMetadata} 插件元数据对象
     * @memberof PluginResolver
     */
    getPluginMetadata(id) {
        if (!this.pluginMetadatas.has(id)) {
            return null;
        }

        return this.pluginMetadatas.get(id);
    }

    /**
     * 获取当前插件第一级依赖的插件，不包括递归依赖的插件。
     * 
     * @param {string} id 插件id
     * @returns {PluginMetadata[]} 依赖的第一级插件
     * @memberof PluginResolver
     */
    getDependencies(id) {
        if (!this.pluginMetadatas.has(id)) {
            return null;
        }

        return this.pluginMetadatas.get(id).dependencies;
    }

    /**
     * 获取依赖的插件链
     * 
     * @param {string} id 插件Id
     * @returns {PluginMetadata[]} 插件依赖链，最后面为根节点，启动时从最后开始启动
     * @memberof PluginResolver
     */
    getDependencyChain(id) {
        if (!this.pluginMetadatas.has(id)) {
            return null;
        }

        return this.buildDependencyChain(this.pluginMetadatas.get(id));
    }

    /**
     * 为一个插件构建依赖链
     * 
     * @param {PluginMetadata} pluginMetadata 需要构建的插件元数据
     * @memberof PluginResolver
     */
    buildDependencyChain(pluginMetadata) {
        let dependencyChain = [];
        this.buildFirstLevelDependencyChain(pluginMetadata.id, pluginMetadata, dependencyChain);

        let index = 0;
        while (index < dependencyChain.length) {
            let dependentPluginMetadata = dependencyChain[index];
            this.buildFirstLevelDependencyChain(pluginMetadata.id, dependentPluginMetadata, dependencyChain);
            index++;
        }
        return dependencyChain;
    }

    /**
     * 构建第一级别的依赖关系，将其加入到依赖链
     * 
     * @param {string} rootPluginId 需要构建依赖的元素
     * @param {PluginMetadata} dependentPluginMetadata 依赖的插件
     * @param {PluginMetadata[]} dependencyChain 依赖链
     * @memberof PluginResolver
     */
    buildFirstLevelDependencyChain(rootPluginId, dependentPluginMetadata, dependencyChain) {
        for (let dependencyConstraint of dependentPluginMetadata.dependencyConstraints) {
            if (rootPluginId === dependencyConstraint.id) {
                continue;
            }
            if (this.existsInPluginMetadatas(dependencyChain, dependencyConstraint.id)) {
                continue;
            }
            dependencyChain.push(this.pluginMetadatas.get(dependencyConstraint.id));
        }
    }
}