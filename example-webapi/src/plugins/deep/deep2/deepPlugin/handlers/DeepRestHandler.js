import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

/**
 * The handler template.
 * 
 * @export
 * @class DeepRestHandler
 */
export default class DeepRestHandler {
    /**
     * Creates an instance of DeepRestHandler.
     * 
     * @param {Plugin} plugin 
     * @memberof DeepRestHandler
     */
    constructor(plugin) {
        this.plugin = plugin;

        this.handle = this.handle.bind(this);
    }

    /**
     * Handle a REST request: http://locahost:3000/demoPlugin/demo/info
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @memberof DeepRestHandler
     */
    handle(request, response) {
        response.json({ 'deep': 'Get plugin from sub directory in plugin directory.' });
    }
}