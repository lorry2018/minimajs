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
         * @type {Map.<Plugin, Set.<PluginRestServiceHandlerRegistry>>}
         */
        this.pluginRestServiceHandlers = new Map();

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
        if (!servicePath) {
            throw new Error(`The path of minima.webapis extension of ${plugin.id} can not be empty.`);
        }

        let handlerClass = extension.data.handler;
        if (!handlerClass) {
            throw new Error(`The handler of minima.webapis extension of ${plugin.id} can not be empty.`);
        }

        let method = extension.data.method;
        if (!method) {
            method = PluginRestServiceHandlerRegistry.DEFAULT;
        }

        if (method !== PluginRestServiceHandlerRegistry.GET &&
            method !== PluginRestServiceHandlerRegistry.POST &&
            method !== PluginRestServiceHandlerRegistry.PUT &&
            method !== PluginRestServiceHandlerRegistry.DELETE) {
            throw new Error(`The method of minima.webapis extension of ${plugin.id} must be get, post, put or delete.`);
        }

        if (this.findHandler(plugin, servicePath, method)) {
            throw new Error(`The minima.webapis extension of ${plugin.id} can not be handled since duplicated path ${servicePath}, ${method} in plugin ${plugin.id}.`);
        }

        let Handler = extension.owner.loadClass(handlerClass);
        if (!Handler) {
            throw new Error(`Can not load the class ${handlerClass} from the minima.webapis extension of ${plugin.id}.`);
        }

        if (!Handler.default) {
            throw new Error(`The class ${extension.data.handler} from the minima.webapis extension of ${plugin.id} does not declare with 'default'.`);
        }

        let handlerInstance = new Handler.default(plugin);

        let pluginRequestHandler = new PluginRestServiceHandlerRegistry(this.app, plugin, servicePath, method, handlerInstance);
        if (!this.pluginRestServiceHandlers.has(plugin)) {
            this.pluginRestServiceHandlers.set(plugin, new Set());
        }
        this.pluginRestServiceHandlers.get(plugin).add(pluginRequestHandler);
        pluginRequestHandler.register();
    }

    findHandler(plugin, servicePath, method) {
        let handlers = this.pluginRestServiceHandlers.get(plugin);
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
            method = PluginRestServiceHandlerRegistry.DEFAULT;
        }

        if (!this.pluginRestServiceHandlers.has(plugin)) {
            return;
        }

        let toBeRemovedHandler = this.findHandler(plugin, servicePath, method);
        if (!toBeRemovedHandler) {
            return;
        }

        toBeRemovedHandler.unregister();
        this.pluginRestServiceHandlers.get(plugin).delete(toBeRemovedHandler);
    }
}

/**
 * Plugin + Path + Method is a REST service handler.
 * 
 * @class PluginRestServiceHandlerRegistry
 */
class PluginRestServiceHandlerRegistry {
    static DEFAULT = "get";

    static GET = "get";
    static POST = "post";
    static PUT = "put";
    static DELETE = "delete";
    /**
     * Creates an instance of PluginRestServiceHandlerRegistry.
     * 
     * @param {Express} app
     * @param {Plugin} plugin 
     * @param {string} servicePath 
     * @param {string} method 
     * @param {PluginRestServiceHandler} handler 
     * @memberof PluginRestServiceHandlerRegistry
     */
    constructor(app, plugin, servicePath, method, handler) {
        Assert.notNull("app", app);
        Assert.notNull("plugin", plugin);
        Assert.notEmpty("servicePath", servicePath);
        Assert.notNull("handler", handler);

        if (!method) {
            method = PluginRestServiceHandlerRegistry.DEFAULT;
        }

        this.app = app;
        this.plugin = plugin;
        this.servicePath = servicePath;
        this.handler = handler;
        this.method = method.toLowerCase();

        if (this.method !== PluginRestServiceHandlerRegistry.GET &&
            this.method !== PluginRestServiceHandlerRegistry.POST &&
            this.method !== PluginRestServiceHandlerRegistry.PUT &&
            this.method !== PluginRestServiceHandlerRegistry.DELETE) {
            throw new Error("The method must be get, post, put or delete.");
        }

        this.register = this.register.bind(this);
        this.unregister = this.unregister.bind(this);
        this.handleRequest = this.handleRequest.bind(this);
    }

    register() {
        if (this.method === PluginRestServiceHandlerRegistry.GET) {
            this.app.get(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRestServiceHandlerRegistry.POST) {
            this.app.post(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRestServiceHandlerRegistry.PUT) {
            this.app.put(`/${this.plugin.id}/${this.servicePath}`, this.handleRequest);
        } else if (this.method === PluginRestServiceHandlerRegistry.DELETE) {
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