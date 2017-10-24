import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

/**
 * The handler template.
 * 
 * @export
 * @class PluginRestServiceHandler
 */
export default class PluginRestServiceHandler {
    /**
     * Creates an instance of PluginRestServiceHandler.
     * 
     * @param {Plugin} plugin 
     * @memberof PluginRestServiceHandler
     */
    constructor(plugin) {
        this.plugin = plugin;
    }

    /**
     * Handle a REST request: http://locahost:3000/demoPlugin/demo/info
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @memberof PluginRestServiceHandler
     */
    handle(request, response) {
        response.json({ "demo": "Demo Rest Handler." });
    }
}