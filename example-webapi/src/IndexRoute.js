import express from 'express';
import { Express } from 'express';
import { Minima, Extension, Plugin, log } from 'minimajs';
import template from 'art-template';
import path from 'path';

const minimaMenusExtensionPoint = 'minima.menus';

export default class IndexRoute {
    /**
     * @param {Minima} minima 
     * @param {Express} app
     * @memberof IndexRoute
     */
    constructor(minima, app) {
        this.minima = minima;
        this.app = app;

        this.handleExtensions = this.handleMenusExtensions.bind(this);
        this.extensionChangedListener = this.extensionChangedListener.bind(this);
        this.parseChildLevel = this.parseChildLevel.bind(this);
        this.createRoute = this.createRoute.bind(this);
        this.createIndexRoute = this.createIndexRoute.bind(this);
        this.createPluginViewRoute = this.createPluginViewRoute.bind(this);
        this.showResponse = this.showResponse.bind(this);
        this.showError = this.showError.bind(this);

        this.handleMenusExtensions();
        this.minima.addExtensionChangedListener(this.extensionChangedListener);

        this.createRoute();
    }

    createRoute() {
        this.app.use(this.createIndexRoute());
        this.app.use(this.createPluginViewRoute());
    }

    /**
     * 
     * 
     * @param {Extension} extension 
     * @param {any} action 
     * @memberof IndexRoute
     */
    extensionChangedListener(extension, action) {
        if (extension.id === minimaMenusExtensionPoint) {
            this.handleMenusExtensions();
        }
    }

    handleMenusExtensions() {
        MenuData.menuId = 0;
        /**
         * @type {MenuData[]}
         */
        this.menus = [];
        /**
         * @type {Map.<number, MenuData>}
         */
        this.menuMap = new Map();

        let extensions = this.minima.getExtensions(minimaMenusExtensionPoint);
        for (let extension of extensions) {
            for (let menu of extension.data) {
                let menuData = new MenuData(extension.owner, menu);
                this.menuMap.set(menuData.id, menuData);

                this.parseChildLevel(extension.owner, menuData, menu);
                this.menus.push(menuData);
            }
        }

        this.menus.sort((a, b) => {
            return a.order - b.order;
        });
    }

    /**
     * 
     * 
     * @param {MenuData} menuData 
     * @param {Object} menu 
     * @memberof IndexRoute
     */
    parseChildLevel(plugin, menuData, menu) {
        if (!menu.menus) {
            return;
        }

        for (let childMenu of menu.menus) {
            let childMenuData = new MenuData(plugin, childMenu);
            this.menuMap.set(childMenuData.id, childMenuData);

            menuData.addMenu(childMenuData);
            this.parseChildLevel(plugin, childMenuData, childMenu);
        }
        menuData.sort();
    }

    createIndexRoute() {
        let self = this;
        let route = new express.Router();
        route.get('/', (req, res) => {
            let extensionPoint = "minima.webapis";
            let extensions = self.minima.getExtensions(extensionPoint);
            let webapis = [];
            let index = 1;
            for (let extension of extensions) {
                webapis.push({
                    index: index,
                    pluginId: extension.owner.id,
                    pluginName: extension.owner.name,
                    pluginVersion: extension.owner.version.versionString,
                    path: `/${extension.owner.id}/${extension.data.path}`,
                    method: extension.data.method,
                    handler: extension.data.handler
                });
                index++;
            }
            res.render('index', { menus: self.menus, pluginsCount: self.minima.getPlugins().size, webApisCount: extensions.size, webapis: webapis });
        });
        return route;
    }

    createPluginViewRoute() {
        let route = new express.Router();
        let self = this;
        route.get('/pluginView', (request, response) => {
            try {
                let menuId = parseInt(request.query.id);
                let menu = this.menuMap.get(menuId);

                if (menu.isHtmlView) {
                    self.showResponse(response, menu.loadHtmlView());
                    return;
                }

                let renderClass = menu.loadRender();
                if (renderClass) {
                    let render = new renderClass();
                    if (render.renderAsync) {
                        render.renderAsync(html => {
                            self.showResponse(response, html);
                        });
                    } else {
                        self.showResponse(response, render.render());
                    }
                } else {
                    throw new Error('Failed to load menu.');
                }
            } catch (error) {
                log.logger.error('Render view error.', error);
                this.showError(response, error);
            }
        });
        return route;
    }

    showResponse(response, html) {
        if (!html) {
            html = 'Not Found.';
        }

        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(html);
        response.end();
    }

    showError(response, error) {
        let html = template(path.join(path.resolve('./views'), 'error-render.html'), {
            message: error.message,
            error: error.stack.replace('\n', '<br />').replace('\r', '<br />').replace('\r\n', '<br />')
        });
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(html);
        response.end();
    }
}

class MenuData {
    static menuId = 0;
    constructor(plugin, menu) {
        MenuData.menuId = MenuData.menuId + 1;
        this._id = MenuData.menuId;

        /**
         * @type {Plugin}
         */
        this.plugin = plugin;

        this._order = parseInt(menu.order);
        if (isNaN(this._order)) {
            this._order = 0;
        }

        this._url = menu.url;
        if (!this._url) {
            this._url = '';
        }

        this._icon = menu.icon;
        if (!this._icon) {
            this._icon = '';
        }

        this._text = menu.text;

        /**
         * @type {MenuData[]}
         */
        this._menus = [];

        this.sort = this.sort.bind(this);
        this.addMenu = this.addMenu.bind(this);
        this.render = this.loadRender.bind(this);
        this.loadHtmlView = this.loadHtmlView.bind(this);
    }

    get id() {
        return this._id;
    }

    get text() {
        return this._text;
    }

    get url() {
        return this._url;
    }

    get icon() {
        return this._icon;
    }

    get order() {
        return this._order;
    }

    get menus() {
        return this._menus;
    }

    get isHtmlView() {
        return this.url.endsWith('.html');
    }

    loadHtmlView() {
        if (!this.url) {
            return;
        }
        let viewPath = path.join(this.plugin.pluginDirectory, this.url);
        return template(viewPath, {});
    }

    loadRender() {
        if (!this.url) {
            return;
        }

        let render = this.plugin.loadClass(this.url);
        if (render && render.default) {
            return render.default;
        }

        return null;
    }

    sort() {
        this._menus.sort((a, b) => {
            return a.order - b.order;
        });
    }

    addMenu(menu) {
        this._menus.push(menu);
    }
}