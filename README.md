

# minimajs

MinimaJs is a OSGi-like, simple yet powerful plugin framework, based on NodeJS, developed by ES6, with IDE VSCode.

```js
let minima = new Minima(path.join(__dirname, 'plugins'));
minima.start();
```

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

The architecture of minimajs is shown as below.

![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/arch.png)
 
There are three features:
+ Dynamic plugin: define the plugin structure, plugin config, plugin dependencies, plugin lifecycle, plugin class loading;
+ Service: the communication between plugins with SOA;
+ Extension: the extension supporting for plugin.

The Minima is a plugin framework container. We need to create a plugin framework instance and start it.

![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/index.png)

```js
import { Minima } from 'minimajs';
import path from 'path';

let minima = new Minima(path.join(__dirname, 'plugins'));
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

The Activator.js in demoPlugin folder is shown as below. It handles the 'commands' extensionPoint here.

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

In the EchoCommand, the demoPlugin2 will load a class from demoPlugin.

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
            throw new Error('The logService can not be null.');
        }
        Activator.logService = logService;

        logService.log('Get the logService successfully.');
    }

    stop(context) {}
}
```

After starting the framework, we can see the logs as below.

```js
[2017-7-30 12:03:50.833] [INFO] log - Loading plugins from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/build/plugins.
[2017-7-30 12:03:50.839] [INFO] log - Plugin demoPlugin is loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/build/plugins/demoPlugin.
[2017-7-30 12:03:50.840] [INFO] log - Plugin demoPlugin2 is loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/build/plugins/demoPlugin2.
[2017-7-30 12:03:50.840] [INFO] log - Plugins are loaded from /Users/lorry/VSCodeProjects/minima-github/minimajs/example/build/plugins completed.
[2017-7-30 12:03:50.841] [INFO] log - There are 2 plugins loaded.
[2017-7-30 12:03:50.845] [INFO] log - Starting the plugins with active initializedState.
[2017-7-30 12:03:50.846] [INFO] log - The plugin demoPlugin is starting.
[2017-7-30 12:03:50.929] [INFO] log - The commands extension size is 0.
[2017-7-30 12:03:50.954] [INFO] log - The plugin demoPlugin is active.
[2017-7-30 12:03:50.955] [INFO] log - The plugin demoPlugin2 is starting.
[2017-7-30 12:03:50.979] [INFO] console - Get the logService successfully.
[2017-7-30 12:03:51.033] [INFO] console - The echo command is executed.
[2017-7-30 12:03:51.034] [INFO] log - The commands extension size is 1.
[2017-7-30 12:03:51.034] [INFO] log - The plugin demoPlugin2 is active.
[2017-7-30 12:03:51.034] [INFO] log - The plugins with active initializedState are started.
```

## Guidelines (The Update will be soon...)

### How to create and start a Minima instance

#### 1 Create and start Minima framework

Typical usage as below.

```js
let minima = new Minima(path.join(__dirname, 'plugins'));
minima.start();
```

The Minima instance will find all plugins below the 'plugins' directory and load them to the framework. Then the minimajs framework will resolve the dependencies between the plugins. After calling minima.start, the minimajs framework will start the resolved plugins followed by the startLevel of plugin. The smallest startLevel, the first to be started.

#### 2 Register global service

You can use Minima to register global service, thus all plugins can use this service when starting.

```js
let minima = new Minima(path.join(__dirname, 'plugins'));
let logService = new LogService();
minima.addService('logService', logService);
minima.start();
```

The Activator.js of plugin can use this global service directly.

```js
export default class Activator {
    start(context) {
        let logService = context.getDefaultService('logService');
        logService.log('Get the logService successfully.');
    }

    stop(context) {}
}
```

#### 3 Singleton Minima.instance
You can use the Minima.instance to access the framework in the each plugin. The Minima framework provides the features as below:
+ Service: Add/Remove/Get
+ Plugin: Get
+ Extension: Get
+ Event: Listen and un-listen the events
+ You can get more details from [api references](https://github.com/lorry2018/minimajs/blob/master/docs/Minima.html).


```js
export default class Activator {
    start(context) {
        let logService = Minima.instance.getDefaultService('logService');
        // Or use the context instead
        // let logService = context.getDefaultService('logService');
        logService.log('Get the logService successfully.');
    }

    stop(context) {}
}
```

### How to create a plugin

#### 1 Plugin Overview

In minimajs, the plugin = plugin.json + Activator.js(Optional) + Other JS files or resource files(Other resource, Optional).
The plugin directory is a directory which contains the plugin.json file. The plugin.json is to describe the details about the plugin as shown below.
+ Basic information, such as id, name, version, activator, and so on.
+ Dependent plugins.
+ Services defined by plugin.
+ Extensions defined by plugin.

Additionally, a plugin will define a Activator commonly. The Activator is a JS file with start(context) and stop(context) functions defined. The start(context) is called when plugin is starting, while the stop(context) is called when stopping. The default Activator file is Activator.js. This file is optional, thus, the plugin is started or stopped directly. The plugin may include other files also, such as HTML, CSS, and so on.

#### 2 The plugin.json

Below is a fully plugin.json example.

```json
{
    "id": "demoPlugin",
    "name": "demoPlugin",
    "description": "The demo plugin.",
    "version": "1.0.1",
    "startLevel": 5,
    "initializedState": "active",
    "activator": "PluginActivator.js",
    "stoppable": true,
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
    }, {
        "id": "minima.menus",
        "data": [{
            "url": "view.js",
            "text": "view"
        }]
    }]
}
```

The basic description of plugin.json is shown as below.
+ id: Required, can not be duplicated. The ID of a plugin and will be used to get the plugin loaded by the minimajs framework.
+ name: Optional, the name.
+ description: Optional, the details description.
+ version: Optional, by default, it is 1.0.0.
+ startLevel: Optional, by default, it is 50. The startLevel is used to control the sequence of plugin starting. The smallest of startLevel, the first to be started. Note that, the frameworkStartLevel is 100 by default, thus the plugins with startLevel bigger than 100 can not be started any more.
+ initializedState: Optional, by default, it is 'active', means that the plugin will be started while Minima.start is called. You can define it to 'installed' if you do not want to be started with Minima.start.
+ activator: Optional, if the Activator is not defined or is defined with file named Activator.js, the activator can be not defined. If you has Activator defined, you need to defined here, such as, "activator": "PluginActivator.js".
+ stoppable: Optional, means the plugin can be stopped or not. By default, it is true.

The services description of plugin.json is shown as below.

#### 3 Activator

#### 4 PluginContext

#### 5 Plugin

### How to create a service
#### 1 Define service
#### 2 Register service
#### 3 Get service
#### 4 Event

### How to create a extension
#### 1 Define extensionPoint and handle it
#### 2 Extension
#### 3 Event

## About

### Contributing

For bugs and feature requests, [please contact me](mailto:23171532@qq.com).

### Author

**Lorry Chen**

Have 10 years on plugin framework researching.

## Discussion QQ Group

Any problems, please contact me with the QQ Group as below.
![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/qqgroup.jpg)

## License

Apache License 2.0.