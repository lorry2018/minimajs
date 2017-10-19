

# minimajs

MinimaJs is a simple yet powerfully plugin framework, based on NodeJS, developed by ES6, with IDE VSCode.

The architecture of minimajs is shown as below.

![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/arch.png)
 
There are three features:
+ Dynamic plugin: define the plugin structure, plugin config, plugin dependencies, plugin lifecycle, plugin class loading;
+ Service: the communication between plugins with SOA;
+ Extension: the extension supporting for plugin.

## Prerequisite
+ NodeJS is installed.
+ Babel is required.
```sh
$ npm install --g babel-cli
```
+ ESLint and JSHint is optional.
+ IDE is vscode, I like it very mush.

## Install

Install with [npm](https://www.npmjs.com/):

```sh
$ npm install --save minimajs
```

## Usage

The Minima is a plugin framework container. We need to create a plugin framework instance and start it.

![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/index.png)

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
    "startLevel": 5,
    "version": "1.0.0",
    "services": [{
        "name": "logService",
        "service": "LogService.js"
    }]
}
// 2 Activator.js
import { Minima, Extension, ExtensionAction, PluginContext, log } from 'minimajs';

export default class Activator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.handleCommandExtensions = this.handleCommandExtensions.bind(this);
        this.extensionChangedListener = this.extensionChangedListener.bind(this);
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        context.addExtensionChangedListener(this.extensionChangedListener);
        this.handleCommandExtensions();
    }

    handleCommandExtensions() {
        let extensions = Minima.instance.getExtensions('commands');
        for (let extension of extensions) {
            let Command = extension.owner.loadClass(extension.data.command).default;
            let command = new Command();
            command.run();
        }

        log.logger.info(`The commands extension size is ${extensions.size}.`);
    }

    extensionChangedListener(extension, action) {
        this.handleCommandExtensions();
    }

    stop(context) {}
}
```

Then building another plugin as below.

```js
// 1 plugin.config
{
    "id": "demoPlugin2",
    "version": "1.0.0",
    "dependencies": [{
        "id": "demoPlugin",
        "version": "1.0.0"
    }],
    "extensions": [{
        "id": "commands",
        "data": {
            "name": "echo",
            "command": "commands/EchoCommand.js"
        }
    }]
}
// 2 Activator.js
import { PluginContext, log } from 'minimajs';

export default class Activator {
    static logService = null;

    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    /**
     * 插件入口
     * 
     * @param {PluginContext} context 插件上下文
     * @memberof Activator
     */
    start(context) {
        let logService = context.getDefaultService('logService');
        if (!logService) {
            throw new Error('The logServie can not be null.');
        }
        Activator.logService = logService;

        logService.log('Get the logService successfully.');
    }

    stop(context) {

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

## Discussing QQ Group

Any problems, please contact me with the QQ Group as below.
![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/qqgroup.jpg)

### License

Apache License 2.0.

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.6.0, on July 02, 2017._