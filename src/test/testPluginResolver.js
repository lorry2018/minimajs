import PluginResolver from '../core/PluginResolver';
import PluginConfiguration from '../PluginConfiguration';
import Version from '../Version';
import test from 'unit.js';

function makePlugin(id, version) {
    let plugin = new PluginConfiguration();
    plugin._id = id;
    plugin._version = new Version(version);
    plugin._dependencies = [];
    return plugin;
}

// test suite
describe('PluginResolver', () => {
    describe('PluginResolver-simple-dependency', () => {
        it('should be resolved with empty dependencies', () => {
            let plugins = [makePlugin('p1', '1.0')];
            let pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('p1')).isTrue();
        });

        it('should be resolved since constraint is satisfied', () => {
            let plugin1 = makePlugin('p1', '1.0');
            plugin1._dependencies = [{
                "id": "p2",
                "version": new Version('1.2')
            }];

            let plugin2 = makePlugin('p2', '1.3');

            let plugins = [plugin1, plugin2];
            let pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('p1')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('p2')).isTrue();
        });

        it('should be resolved failed since version constraint is not satisfied', () => {
            let plugin1 = makePlugin('p1', '1.0');
            plugin1._dependencies = [{
                "id": "p2",
                "version": new Version('1.2')
            }];

            let plugin2 = makePlugin('p2', '1.1');

            let plugins = [plugin1, plugin2];
            let pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('p1')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('p2')).isTrue();
        });

        it('should be failed since dependency does not exists', () => {
            let plugin1 = new PluginConfiguration();
            plugin1._id = makePlugin('p1', '1.0');
            plugin1._dependencies = [{
                "id": "p3",
                "version": new Version('1.2')
            }];

            let plugin2 = makePlugin('p2', '1.1');

            let plugins = [plugin1, plugin2];
            let pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('p1')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('p2')).isTrue();
        });
    });

    describe('PluginResolver-complex-dependencies', () => {
        it('should be resolved with cyclic dependencies', () => {
            /**
             *     ------------>
             *     |           |
             * a-->b-->c-->d-->e
             * |   |    |
             * |   g<--  
             * f
             */
            let a = makePlugin('a', '1.0');
            a._dependencies = [{
                "id": "b",
                "version": new Version('1.0')
            }, {
                "id": "f",
                "version": new Version('1.0')
            }]

            let b = makePlugin('b', '1.0');
            b._dependencies = [{
                "id": "c",
                "version": new Version('1.0')
            }, {
                "id": "e",
                "version": new Version('1.0')
            }]

            let c = makePlugin('c', '1.0');
            c._dependencies = [{
                "id": "d",
                "version": new Version('1.0')
            }, {
                "id": "g",
                "version": new Version('1.0')
            }]

            let d = makePlugin('d', '1.0');
            d._dependencies = [{
                "id": "e",
                "version": new Version('1.0')
            }];
            let e = makePlugin('e', '1.0');
            let f = makePlugin('f', '1.0');
            let g = makePlugin('g', '1.0');
            g._dependencies = [{
                "id": "b",
                "version": new Version('1.0')
            }]

            let plugins = [a, b, c, d, e, f, g];
            let pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('a')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('b')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('c')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isTrue();

            plugins = [a, b, c, d, e, f, g];
            pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('a')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('b')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('c')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isTrue();

            plugins = [a, b, d, e, f, g];
            pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('a')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('b')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isFalse();

            plugins = [a, c, d, e, f, g];
            pluginResolver = new PluginResolver(plugins);
            pluginResolver.resolve();

            test.bool(pluginResolver.isResolveSuccess('a')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('c')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isFalse();

            pluginResolver.add(b);
            test.bool(pluginResolver.isResolveSuccess('a')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('b')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('c')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isTrue();

            test.number(pluginResolver.getDependencies('a').length).is(2);
            test.number(pluginResolver.getDependencies('b').length).is(2);
            test.number(pluginResolver.getDependencies('c').length).is(2);
            test.number(pluginResolver.getDependencies('d').length).is(1);
            test.number(pluginResolver.getDependencies('e').length).is(0);
            test.number(pluginResolver.getDependencies('f').length).is(0);
            test.number(pluginResolver.getDependencies('g').length).is(1);

            test.number(pluginResolver.getDependencyChain('a').length).is(6);
            test.number(pluginResolver.getDependencyChain('b').length).is(4);
            test.number(pluginResolver.getDependencyChain('c').length).is(4);
            test.number(pluginResolver.getDependencyChain('d').length).is(1);
            test.number(pluginResolver.getDependencyChain('e').length).is(0);
            test.number(pluginResolver.getDependencyChain('f').length).is(0);
            test.number(pluginResolver.getDependencyChain('g').length).is(4);

            pluginResolver.remove(b);

            test.bool(pluginResolver.isResolveSuccess('a')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('c')).isFalse();
            test.bool(pluginResolver.isResolveSuccess('d')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('e')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('f')).isTrue();
            test.bool(pluginResolver.isResolveSuccess('g')).isFalse();
        });
    });
});