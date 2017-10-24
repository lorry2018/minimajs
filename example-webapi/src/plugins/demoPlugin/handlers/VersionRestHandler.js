import { Request, Response } from 'express';
import { Plugin } from 'minimajs';

/**
 * The handler template.
 * 
 * @export
 * @class VersionRestHandler
 */
export default class VersionRestHandler {
    /**
     * Creates an instance of VersionRestHandler.
     * 
     * @param {Plugin} plugin 
     * @memberof VersionRestHandler
     */
    constructor(plugin) {
        this.plugin = plugin;

        this.handle = this.handle.bind(this);
    }

    /**
     * Handle a REST request: http://locahost:3000/demoPlugin/version
     * 
     * @param {Request} request 
     * @param {Response} response 
     * @memberof VersionRestHandler
     */
    handle(request, response) {
        response.json({ "version": this.plugin.version.versionString });
    }
}