import { Express, RequestHandler } from 'express';
import { Plugin, Minima, Extension, ExtensionAction } from 'minimajs';

const webApiExtension = "minima.webapis";

export default class PluginRestServiceExtensionHandler {
    /**
     * Creates an instance of PluginRestServiceExtensionHandler.
     * 
     * @param {Express} app 
     * @param {Minima} minima
     * @memberof PluginRestServiceExtensionHandler
     */
    constructor(app, minima) {
        this.app = app;
        this.minima = minima;

        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.handleWebApisExtensions = this.handleWebApisExtensions.bind(this);

        let self = this;

        self.handleWebApisExtensions();
        minima.addExtensionChangedListener(webApiExtensionChanged);
    }

    handleWebApisExtensions() {

    }

    /**
     * @param {Extension} extension 
     * @param {ExtensionAction} action 
     * @memberof PluginRestServiceExtensionHandler
     */
    webApiExtensionChanged(extension, action) {

    }

    /**
     * Register a REST service.
     * 
     * @param {Plugin} plugin
     * @param {string} servicePath 
     * @param {RequestHandler} handler 
     * @param {string} method 'get', 'post', 'put', 'delete'
     * @memberof PluginRestServiceExtensionHandler
     */
    register(plugin, servicePath, handler, method) {
        this.app[method](`/${plugin.id}/${servicePath}`, handler);
    }

    /**
     * Unregister a REST service.
     * 
     * @param {Plugin} plugin
     * @param {string} servicePath 
     * @memberof PluginRestServiceExtensionHandler
     */
    unregister(plugin, servicePath, handler) {
        this.app.delete(`/${plugin.id}/${servicePath}`, handler);
    }
}