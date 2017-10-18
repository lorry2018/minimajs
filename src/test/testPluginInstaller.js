import Minima from '../Minima';
import Framework from '../core/Framework';
import PluginInstaller from '../core/PluginInstaller';
import EventManager from '../core/EventManager';
import path from 'path';
import test from 'unit.js';

// test suite
describe('PluginInstaller', () => {
    // test case
    it('should be loaded correctly', () => {
        let minima = new Minima(path.join(__dirname, 'plugins'));
        minima.start();

        let demoPlugin2 = minima.getPlugin('demoPlugin2');
        demoPlugin2.stop();
        demoPlugin2.start();

        test.number(minima.framework.pluginInstaller.plugins.size).is(2);

        minima.stop();
    });
});