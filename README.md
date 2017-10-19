

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

**Plugin Examples**

Create a simple plugin in plugins directory as below.

The plugin.json in demoPlugin folder is shown as below. It define a logService here.
```json
{
    "id": "demoPlugin",
    "startLevel": 5,
    "version": "1.0.0",
    "services": [{
        "name": "logService",
        "service": "LogService.js"
    }]
}
```

The Activator.js in demoPlugin folder is shown as below. It handles the 'commands' extensions here.

```js
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

Then create another plugin named demoPlugin2 as below. The demoPlugin2 will consume the logService registered by demoPlugin and register the extension to 'commands' extensionPoint. 

In the EchoCommand, the demoPlugin will load a class from demoPlugin2.

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
[2017-7-30 11:00:15.852] [INFO] log - Loading plugins from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/src/plugins.
[2017-7-30 11:00:15.856] [INFO] log - Plugin demoPlugin is loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/src/plugins/demoPlugin.
[2017-7-30 11:00:15.857] [INFO] log - Plugin demoPlugin2 is loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/src/plugins/demoPlugin2.
[2017-7-30 11:00:15.857] [INFO] log - Plugins are loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/src/plugins completed.
[2017-7-30 11:00:15.858] [INFO] log - There are 2 plugins loaded.
[2017-7-30 11:00:15.860] [INFO] log - Starting the plugins with active initializedState.
[2017-7-30 11:00:15.861] [INFO] log - The plugin demoPlugin is starting.
[2017-7-30 11:00:15.865] [INFO] log - The commands extension size is 0.
[2017-7-30 11:00:15.867] [INFO] log - The plugin demoPlugin is active.
[2017-7-30 11:00:15.868] [INFO] log - The plugin demoPlugin2 is starting.
[2017-7-30 11:00:15.878] [INFO] log - The commands extension size is 1.
[2017-7-30 11:00:15.879] [INFO] log - The plugin demoPlugin2 is active.
[2017-7-30 11:00:15.879] [INFO] log - The plugins with active initializedState are started.
```

## Guidelines (The Update will be soon...)

### How to create a minima instance
### How to create a plugin
### How to create a service
### How to create a extension

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