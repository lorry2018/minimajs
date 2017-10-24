import express from 'express';
import { Express } from 'express';
import { Plugin } from 'minimajs';
import Activator from '../Activator';

export default class PluginService {
    /**
     * Creates an instance of DemoApiRoute.
     * @param {Plugin} plugin
     * @param {Express} app 
     * @memberof DemoApiRoute
     */
    constructor(plugin, app) {
        this.plugin = plugin;
        this.app = app;
        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
    }

    register() {
        this.app.post(`/${this.plugin.id}/plugin/start`, (request, response) => {
            let pluginIds = this.app.ids;
            for (let pluginId of pluginIds) {
                let plugin = this.plugin.context.getPlugin(pluginId);
                try {
                    plugin.start();
                } catch (error) {
                    response.json({ success: false, reason: `插件${plugin.id}启动出现异常，请查看日志。` });
                    return;
                }
            }
            response.json({ success: true });
        });

        this.app.post(`/${this.plugin.id}/plugin/stop`, (request, response) => {
            let pluginIds = this.app.ids;
            for (let pluginId of pluginIds) {
                let plugin = this.plugin.context.getPlugin(pluginId);
                if (plugin.pluginConfiguration.stoppable) {
                    plugin.stop();
                } else {
                    response.json({ success: false, reason: `插件${plugin.id}配置为不可停止。` });
                    return;
                }
            }

            response.json({ success: true });
        });

        this.app.get(`/${this.plugin.id}/plugins`, (req, res) => {
            let pluginContext = Activator.context;
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

            res.json(plugins);
        });
    }

    unregister() {
        this.app.delete(`/${this.plugin.id}/plugin/start`);
        this.app.delete(`/${this.plugin.id}/plugin/stop`);
        this.app.delete(`/${this.plugin.id}/plugins`);
    }
}