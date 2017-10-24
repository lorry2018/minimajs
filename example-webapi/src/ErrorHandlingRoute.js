import { Express } from 'express';
import { log } from 'minimajs';

export default class ErrorHandlingRoute {
    /**
     * 
     * @param {Express} app 
     * @memberof ErrorHandlingRoute
     */
    constructor(app) {
        this.app = app;
        this.createRoute = this.createRoute.bind(this);

        this.createRoute();
    }

    createRoute() {
        this.app.use((req, res, next) => {
            let err = new Error('Not Found');
            log.logger.error('The page not found: ' + req.originalUrl);
            err.status = 404;
            res.render('error-404', {
                message: err.message,
                error: err
            });
        });

        this.app.use((err, req, res, next) => {
            if (err) {
                log.logger.error('Unexpected exception occurs.', err);
            }

            res.status(err.status || 500);
            res.render('error-500', {
                message: err.message,
                error: err
            });
        });
    }
}