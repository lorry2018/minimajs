import express from 'express';
import { Express } from 'express';
import { Minima, Plugin, PluginState } from 'minimajs';
import path from 'path';

export default class StaticRoute {
    /**
     * StaticRoute
     * 
     * @param {Minima} minima 
     * @param {Express} app 
     * @memberof IndexRoute
     */
    constructor(minima, app) {
        this.minima = minima;
        this.app = app;
        this.createRoute = this.createRoute.bind(this);
        this.addStatic = this.addStatic.bind(this);
        this.removeStatic = this.removeStatic.bind(this);
        this.pluginStateChangedListener = this.pluginStateChangedListener.bind(this);

        this.createRoute();
        this.minima.addPluginStateChangedListener(this.pluginStateChangedListener);
    }

    createRoute() {
        this.app.use('/static', express.static(path.resolve('./static')));
        for (let pair of this.minima.getPlugins()) {
            let plugin = pair[1];
            this.addStatic(plugin);
        }
    }

    addStatic(plugin) {
        this.app.use(`/plugins/${plugin.id}/controllers`, express.static(path.join(plugin.pluginDirectory, 'controllers')));
        this.app.use(`/plugins/${plugin.id}/utilities`, express.static(path.join(plugin.pluginDirectory, 'utilities')));
        this.app.use(`/plugins/${plugin.id}/views`, express.static(path.join(plugin.pluginDirectory, 'utilities')));
    }

    removeStatic(plugin) {
        // TODO: remove the static
    }

    pluginStateChangedListener(id, previous, current) {
        let plugin = this.minima.getPlugin(id);
        if (current === PluginState.ACTIVE) {
            this.addStatic(plugin);
        } else if (previous === PluginState.STOPPING && current === PluginState.RESOLVED) {
            this.removeStatic(plugin);
        }
    }
}