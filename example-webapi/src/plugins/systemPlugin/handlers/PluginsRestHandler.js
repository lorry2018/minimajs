import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

export default class PluginsRestHandler {
    /**
     * Creates an instance of PluginsRestHandler.
     * 
     * @param {Plugin} plugin 
     * @memberof PluginsRestHandler
     */
    constructor(plugin) {
        this.plugin = plugin;

        this.handle = this.handle.bind(this);
    }

    /**
     * Handle a REST request: http://locahost:3000/systemPlugins/plugins
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @memberof PluginsRestHandler
     */
    handle(request, response) {
        let pluginContext = this.plugin.context;
        let plugins = [];
        let index = 1;
        for (let pair of pluginContext.getPlugins()) {
            let plugin = {
                'index': index,
                'id': pair[1].id,
                'name': pair[1].name,
                'version': pair[1].version.versionString,
                'state': pair[1].state.state
            };
            plugins.push(plugin);
            index++;
        }

        response.json(plugins);
    }
}