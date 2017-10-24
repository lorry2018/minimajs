import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

/**
 * The handler template.
 * 
 * @export
 * @class DemoRestHandler
 */
export default class DemoRestHandler {
    /**
     * Creates an instance of DemoRestHandler.
     * 
     * @param {Plugin} plugin 
     * @memberof DemoRestHandler
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
     * @memberof DemoRestHandler
     */
    handle(request, response) {
        response.json({ "demo": "Demo Rest Handler." });
    }
}