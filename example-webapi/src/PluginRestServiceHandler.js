import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

/**
 * The RestHandler template of a plugin.
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
     * Handle a REST request.
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @memberof PluginRestServiceHandler
     */
    handle(request, response) {
        let id = request.params.id;
        let body = request.body;
        response.json({ body: body });
    }
}