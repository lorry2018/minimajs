

# minimajs

Minima is a simple yet powerfully plugin framework, based on NodeJS, developed by ES6.
 
There are three features:
(1) Dynamic plugin: define the plugin structure, plugin config, plugin dependencies, plugin lifecycle, plugin class loading;
(2) Service: the communication between plugins with SOA;
(3) Extension: the extension supporting for plugin.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save minimajs
```

## Usage

The Minima is a plugin framework container. We need to create a plugin framework instance and start it.

```js
import { Minima } from 'minimajs';

let minima = new Minima(__dirname + '/plugins');
minima.start();
```

**Examples**

Create a simple plugin in plugins directory as below.

```js
// 1 plugin.json
{
    "id": "demoPlugin",
    "startLevel": 3,
    "version": "1.0.0"
}
// 2 Activator.js
import { ServiceAction, ExtensionAction, PluginContext, Plugin, log } from 'minimajs';

export default class Activator {
    /**
     * 插件上下文缓存
     * 
     * @type {PluginContext}
     * @static
     * @memberof Activator
     */
    static context = null;
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.serviceChangedListener = this.serviceChangedListener.bind(this);
        this.extensionChangedListener = this.extensionChangedListener.bind(this);
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        Activator.context = context;
        Activator.context.addServiceChangedListener(this.serviceChangedListener);
        Activator.context.addExtensionChangedListener(this.extensionChangedListener);
        log.logger.info(`INFO: The plugin ${context.plugin.id} is started.`);
    }

    /**
     * 服务监听器
     * 
     * @param {string} name 服务名称
     * @param {ServiceAction} action 服务变化活动
     * @memberof Activator
     */
    serviceChangedListener(name, action) {
        if (name === 'myService' && action === ServiceAction.ADDED) {
            let myService = Activator.context.getDefaultService(name);
            if (myService) {
                log.logger.info(`Get the myService instance successfully.`);
            }
        } else if (action === ServiceAction.REMOVED) {
            log.logger.info(`The service ${name} is removed.`);
        }
    }

    /**
     * 扩展变更监听器
     * 
     * @param {Extension} extension 扩展对象
     * @param {ExtensionAction} action 扩展对象变化活动
     * @memberof Activator
     */
    extensionChangedListener(extension, action) {
        if (action === ExtensionAction.ADDED) {
            log.logger.info(`The extension ${extension.id} is added.`);
            let extensions = Activator.context.getExtensions('myExtension');
            log.logger.info(`The extension count is ${extensions.size}.`);
        }

        if (action === ExtensionAction.REMOVED) {
            log.logger.info(`The extension ${extension.id} is removed.`);
        }
    }

    /**
     * 插件出口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    stop(context) {
        Activator.context = null;
        log.logger.info(`INFO: The plugin ${context.plugin.id} is stopped.`);
    }
}
```

Then building another plugin as below.

```js
// 1 plugin.config
{
    "id": "demoPlugin2",
    "name": "demoPlugin2Test",
    "description": "The demo plugin2.",
    "version": "1.0.1",
    "startLevel": 5,
    "initializedState": "active",
    "activator": "PluginActivator.js",
    "dependencies": [{
        "id": "demoPlugin",
        "version": "1.0.0"
    }],
    "services": [{
        "name": "myService",
        "service": "MyService.js",
        "properties": {
            "vendor": "lorry"
        }
    }],
    "extensions": [{
        "id": "myExtension",
        "data": {
            "extensionData": "lorry"
        }
    }, {
        "id": "myExtension2",
        "data": {
            "extensionData": "lorry2"
        }
    }]
}
// 2 MyService.js
export default class MyService {

}
// 3 PluginActivator.js
import { ServiceAction, PluginContext, Plugin, log } from 'minimajs';

export default class PluginActivator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.serviceChanged = this.serviceChanged.bind(this);
    }

    /**
     * 启动插件
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof PluginActivator
     */
    start(context) {
        log.logger.info(`INFO: The plugin ${context.plugin.id} is started.`);
        context.addServiceChangedListener(this.serviceChangedListener);
    }

    /**
     * 服务监听
     * 
     * @param {string} name 服务名称
     * @param {ServiceAction} action 服务活动
     * @memberof PluginActivator
     */
    serviceChangedListener(name, action) {
        if (action === ServiceAction.ADDED) {
            log.logger.info(`Service ${name} is register.`);
        } else {
            log.logger.info(`Service ${name} is unregister.`);
        }
    }

    /**
     * 停止插件
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof PluginActivator
     */
    stop(context) {
        log.logger.info(`INFO: The plugin ${context.plugin.id} is stopped.`);
    }
}
```

After starting the framework, we can see the logs as below.

```js
[2017-07-30 16:14:53.128] [INFO] console - Starting the plugins with active initializedState.
[2017-07-30 16:14:53.129] [INFO] console - The plugin demoPlugin is starting.
[2017-07-30 16:14:53.132] [INFO] console - INFO: The plugin demoPlugin is started.
[2017-07-30 16:14:53.132] [INFO] console - The plugin demoPlugin is active.
[2017-07-30 16:14:53.133] [INFO] console - The plugin demoPlugin2 is starting.
[2017-07-30 16:14:53.135] [INFO] console - INFO: The plugin demoPlugin2 is started.
[2017-07-30 16:14:53.137] [INFO] console - Get the myService instance successfully.
[2017-07-30 16:14:53.137] [INFO] console - Service myService is register.
[2017-07-30 16:14:53.139] [INFO] console - The extension myExtension is added.
[2017-07-30 16:14:53.140] [INFO] console - The extension count is 1.
[2017-07-30 16:14:53.141] [INFO] console - The extension myExtension2 is added.
[2017-07-30 16:14:53.141] [INFO] console - The extension count is 1.
[2017-07-30 16:14:53.142] [INFO] console - The plugin demoPlugin2 is active.
[2017-07-30 16:14:53.143] [INFO] console - The plugins with active initializedState are started.
[2017-07-30 16:14:53.144] [INFO] console - Stopping all plugins.
[2017-07-30 16:14:53.145] [INFO] console - The plugin demoPlugin is stopping.
[2017-07-30 16:14:53.146] [INFO] console - INFO: The plugin demoPlugin is stopped.
[2017-07-30 16:14:53.147] [INFO] console - The plugin demoPlugin is stopped.
[2017-07-30 16:14:53.147] [INFO] console - The plugin demoPlugin2 is stopping.
[2017-07-30 16:14:53.148] [INFO] console - INFO: The plugin demoPlugin2 is stopped.
[2017-07-30 16:14:53.148] [INFO] console - The plugin demoPlugin2 is stopped.
[2017-07-30 16:14:53.148] [INFO] console - All plugins are stopped.
```

## About

### Contributing

For bugs and feature requests, [please contact me](mailto:23171532@qq.com).

### Author

**Lorry Chen**

Have 10 years on plugin framework researching.

### License

Copyright © 2017, [Lorry Chen].

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on July 02, 2017._