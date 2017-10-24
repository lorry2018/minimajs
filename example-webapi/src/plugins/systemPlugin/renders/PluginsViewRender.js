import { Plugin } from 'minimajs';
import template from 'art-template';
import path from 'path';
import Activator from '../Activator';

export default class PluginsByArtViewRender {
    constructor() {
        this.render = this.render.bind(this);
    }

    render() {
        let pluginContext = Activator.context;
        let plugin = Activator.context.plugin;
        let pluginsView = path.join(plugin.pluginDirectory, 'views/plugins.html');

        this.plugins = [];
        let index = 1;
        for (let pair of pluginContext.getPlugins()) {
            let plugin = {
                'index': index,
                'id': pair[1].id,
                'name': pair[1].name,
                'version': pair[1].version.versionString,
                'state': pair[1].state.state
            };
            this.plugins.push(plugin);
            index++;
        }

        let pluginsData = { pluginId: plugin.id, plugins: this.plugins };

        return template(pluginsView, pluginsData);
    }
}