import Minima from 'minimajs';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import IndexRoute from './IndexRoute';
import StaticRoute from './StaticRoute';
import ErrorHandlingRoute from './ErrorHandlingRoute';
import PluginRestServiceExtensionHandler from './PluginRestServiceExtensionHandler';

const app = express();
app.engine('html', require('express-art-template'));
app.set('view engine', 'html');
app.set('views', path.resolve('./views'));
app.set('view options', {
    debug: true
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

let minima = new Minima(path.join(__dirname, 'plugins'));
minima.addService('app', app);
minima.start();

minima.addService("pluginRestServiceExtensions", new PluginRestServiceExtensionHandler(minima, app));

new StaticRoute(minima, app);
new IndexRoute(minima, app);
// The last routes for express, used to error handling.
new ErrorHandlingRoute(app);

module.exports = app;

app.listen(3000);