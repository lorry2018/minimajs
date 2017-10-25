import { Express, RequestHandler } from 'express';
import { Plugin, Minima, Extension, ExtensionAction, Assert, PluginState } from 'minimajs';
import removeRoute from 'express-remove-route';


const webApiExtensionPoint = "minima.webapis";

export default class PluginRestServiceExtensionHandler {
    /**
     * Creates an instance of PluginRestServiceExtensionHandler.
     * 
     * @param {Minima} minima
     * @param {Express} app 
     * @memberof PluginRestServiceExtensionHandler
     */
    constructor(minima, app) {
        this.minima = minima;
        this.app = app;

        /**
         * @type {Map.<Plugin, Set.<PluginRequestHandler>>}
         */
        this.pluginsWebApiHandlers = new Map();

        this.findHandler = this.findHandler.bind(this);
        this.handleWebApisExtensions = this.handleWebApisExtensions.bind(this);
        this.webApiExtensionChanged = this.webApiExtensionChanged.bind(this);
        this.addWebApiExtension = this.addWebApiExtension.bind(this);
        this.removeWebApiExtension = this.removeWebApiExtension.bind(this);

        let self = this;

        self.handleWebApisExtensions();
        minima.addExtensionChangedListener(this.webApiExtensionChanged);
    }

    handleWebApisExtensions() {
        let extensions = this.minima.getExtensions(webApiExtensionPoint);
        for (let extension of extensions) {
            this.addWebApiExtension(extension);
        }
    }

    /**
     * @param {Extension} extension 
     * @param {ExtensionAction} action 
     * @memberof PluginRestServiceExtensionHandler
     */
    webApiExtensionChanged(extension, action) {
        if (extension.id === webApiExtensionPoint) {
            if (action === ExtensionAction.ADDED) {
                this.addWebApiExtension(extension);
            } else {
                this.removeWebApiExtension(extension);
            }
        }
    }

    /**
     * @param {Extension} extension 
     * @memberof PluginRestServiceExtensionHandler
     */
    addWebApiExtension(extension) {
        let plugin = extension.owner;
        let servicePath = extension.data.path;
        let method = extension.data.method;
        if (!method) {
            method = PluginRequestHandler.DEFAULT;
        }

        if (this.findHandler(plugin, servicePath, method)) {
            throw new Error(`Handle webapis extension error since duplicated service path ${servicePath}, ${method} in plugin ${plugin.id}.`);
        }

        let Handler = extension.owner.loadClass(extension.data.handler).default;
        let handlerInstance = new Handler(plugin);

        let pluginRequestHandler = new PluginRequestHandler(this.app, plugin, servicePath, method, handlerInstance);
        if (!this.pluginsWebApiHandlers.has(plugin)) {
            this.pluginsWebApiHandlers.set(plugin, new Set());
        }
        this.pluginsWebApiHandlers.get(plugin).add(pluginRequestHandler);
        pluginRequestHandler.register();
    }

    findHandler(plugin, servicePath, method) {
        let handlers = this.pluginsWebApiHandlers.get(plugin);
        if (!handlers) {
            return null;
        }

        for (let handler of handlers) {
            if (handler.servicePath === servicePath && handler.method === method) {
                return handler;
            }
        }

        return null;
    }

    /**
     * @param {Extension} extension 
     * @memberof PluginRestServiceExtensionHandler
     */
    removeWebApiExtension(extension) {
        let plugin = extension.owner;
        let servicePath = extension.data.path;
        let method = extension.data.method;

        if (!method) {
            method = PluginRequestHandler.DEFAULT;
        }

        if (!this.pluginsWebApiHandlers.has(plugin)) {
            return;
        }

        let toBeRemovedHandler = this.findHandler(plugin, servicePath, method);
        if (!toBeRemovedHandler) {
            return null;
        }

        toBeRemovedHandler.unregister();
        handlers.delete(toBeRemovedHandler);
    }
}

/**
 * Plugin + Path + Method is a REST service handler.
 * 
 * @class PluginRequestHandler
 */
class PluginRequestHandler {
    static DEFAULT = "get";

    static GET = "get";
    static POST = "post";
    static PUT = "put";
    static DELETE = "delete";
    /**
     * Creates an instance of PluginRequestHandler.
     * 
     * @param {Express} app
     * @param {Plugin} plugin 
     * @param {string} servicePath 
     * @param {string} method 
     * @param {PluginRestServiceHandler} handler 
     * @memberof PluginRequestHandler
     */
    constructor(app, plugin, servicePath, method, handler) {
        Assert.notNull("app", app);
        Assert.notNull("plugin", plugin);
        Assert.notEmpty("servicePath", servicePath);
        Assert.notNull("handler", handler);

        if (!method) {
            method = PluginRequestHandler.DEFAULT;
        }

        this.app = app;
        this.plugin = plugin;
        this.servicePath = servicePath;
        this.handler = handler;
        this.method = method.toLowerCase();

        if (this.method !== PluginRequestHandler.GET &&
            this.method !== PluginRequestHandler.POST &&
            this.method !== PluginRequestHandler.PUT &&
            this.method !== PluginRequestHandler.DELETE) {
            throw new Error("The method must be get, post, put or delete.");
        }

        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.handleRequest = this.handleRequest.bind(this);
    }

    register() {
        if (this.method === PluginRequestHandler.GET) {
            this.app.get(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRequestHandler.POST) {
            this.app.post(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRequestHandler.PUT) {
            this.app.put(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRequestHandler.DELETE) {
            this.app.delete(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        }
    }

    unregister() {
        removeRoute(this.app, this.servicePath, this.method);
        this.app = null;
        this.handler = null;
        this.plugin = null;
        this.method = null;
    }

    handleRequest(request, response) {
        if (this.plugin.state === PluginState.ACTIVE) {
            this.handler.handle(request, response);
        } else {
            throw new Error(`Can not handle the /${this.plugin.id}/${this.servicePath} request since the plugin is not active.`);
        }
    }
}