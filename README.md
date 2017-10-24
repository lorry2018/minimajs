

# minimajs

MinimaJs is a OSGi-like, simple yet powerful plugin framework, based on NodeJS, developed by ES6, with IDE VSCode.

```js
let minima = new Minima(path.join(__dirname, 'plugins'));
minima.start();
```

The architecture of minimajs is shown as below.

![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/arch.png)
 
There are three features:
+ Dynamic plugin: define the plugin structure, plugin config, plugin dependencies, plugin lifecycle, plugin class loading;
+ Service: the interactive between plugins with decoupled service;
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

Below is the code to create a Minima instance and start it.

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

## Guidelines

### How to create and start a Minima instance

#### 1 Create and start Minima framework

Typical usage as below.

```js
let minima = new Minima(path.join(__dirname, 'plugins'));
minima.start();
```

The Minima instance will find all plugins below the 'plugins' directory and load them to the framework. Then the minimajs framework will resolve the dependencies between the plugins. After calling minima.start, the minimajs framework will start the resolved plugins followed by the startLevel of plugin. The smallest startLevel, the first to be started. The dependencies affects the sequence of plugin starting. When starting a plugin, the framework will start its dependencies first even if the startLevel of dependencies is bigger than it.

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

In th minimajs framework, the plugin = plugin.json + Activator.js(Optional) + Other JS files or resource files(Optional).
The plugin directory is a directory which contains the plugin.json file. The plugin.json is to describe the details about the plugin as shown below.
+ Basic information, such as id, name, version, activator, and so on.
+ Dependent plugins.
+ Services defined by plugin.
+ Extensions defined by plugin.

Additionally, a plugin will define a Activator commonly. The Activator is a JS file with start(context) and stop(context) functions defined. The start(context) function is called when plugin is starting, while the stop(context) function is called when stopping. The default Activator file is Activator.js. This file is optional, thus, the plugin is started or stopped directly. The plugin may include other files also, such as HTML, CSS, and so on.

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
+ startLevel: Optional, by default, it is 50. The startLevel is used to control the starting sequence of plugin. The smaller startLevel, the first to be started. Note that, the frameworkStartLevel is 100 by default, thus the plugins with startLevel bigger than 100 can not be started any more.
+ initializedState: Optional, by default, it is 'active', means that the plugin will be started while Minima.start is called. You can define it to 'installed' if you do not want start the plugin with Minima.start.
+ activator: Optional, if the Activator is not defined or is defined with file named Activator.js, you need not to specify the activator attribute. If you has Activator defined and the file name is not Activator.js, you need to define the activator attribute, such as, "activator": "PluginActivator.js".
+ stoppable: Optional. It means whether the plugin can be stopped or not. By default, it is true, means that the plugin can be stopped.

The dependencies attribute is to describe the dependent plugins of current plugin. It is Optional. when the dependencies is not defined, it means there is not any dependent plugins. The dependencies attribute is an Array and each dependency contains the id and version attribute. The version attribute is Optional, and use "1.0.0" by default. The id is the dependent plugin id, the version is the ***minimize*** version of the dependent plugin. Below is the typical usage. It means current plugin depends on another plugin with id 'demoPlguin' and the version of dependent plugin 'demoPlugin' must be bigger than or equal '1.0.0'.

```json
[{
    "id": "demoPlugin",
    "version": "1.0.0"
}]
```

The services attribute of plugin.json is described as below.
+ services: Optional. The minimajs framework allows you to register a service by plugin.json or the addService method of PluginContext/Minima.instance. The service defined in the plugin.json will be registered to the framework while starting the plugin.

The services is an array definition. Each service element contains name, service and properties attributes. The name is the unique service name, used to find the service instance. The service attribute defines the service JS file path relative to the plugin directory. The properties attribute is used to filter the target service. Below is the typical usage of services attribute.

```json
[{  
    "name": "myService",
    "service": "service/MyService.js",
    "properties": {
        "vendor": "lorry"
    }
}]
```

The extensions attribute of plugin.json is to defined the extensions defined by current plugin, and it is Optional. The extension feature provides a ExtensionPoint-Extension extensibility model of plugin framework. The plugin which can be extended by others will defined a named ExtensionPoint, and it will receive the extension data registered by other plugin. The plugin which extends the functionalities of another will define the extensions attribute in the plugin.json. Each extension definition contains id and data attributes. The id is the unique ExtensionPoint ID, the data is the extension content which will register to the ExtensionPoint and can be got by Minima.Instance.getExtensions(id) or PluginContext.getExtensions(id) function.

```json
[{
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
```

The data attribute can be any value, and depends on the plugin which exposes the ExtensionPoint. The data attribute can be string, array, object, and so on.

#### 3 Activator

The Activator is to define the entry and the exit of a plugin. Each Activator contains two functions named start(context) and stop(context). When the plugin is starting, the start function will be called. And the stop function is called when the plugin is stopped.

The Activator is Optional. The plugin can be defined without a Activator. Thus it will start or stop directly. Additionally, the default Activator file is Activator.js in the plugin directory. If you will define a Activator with another file name, you need to specify the activator attribute of plugin.json.

The demo Activator is shown as below.

```js
export default class Activator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    start(context) {
        // TODO: do something when starting
    }

    stop(context) {
        // TODO: do something when stopping
    }
}
```

There is a parameter named context of start and stop function in each Activator. The context is a PluginContext instance. You can use the PluginContext to access the framework functionalities, such as, to add or get service, get extensions, get plugins, install another plugin, and so on.

The Activator is used to initialize the resources of current plugin, and release them after stopping. Any exception occurs in the start function will block the the starting of a plugin, the plugin state will keep in 'resolved' state. But the plugin will still be stopped normally even if an exception occurs in the stop method.

#### 4 PluginContext Class

The PluginContext is a common class when defining a plugin. It provides the below functionalities.
+ Current Plugin: to get current Plugin instance. The usage of Plugin instance will be described in follow section.
+ Service: to add, get services from plugin framework.
+ Extension: to get the extensions from plugin framework.
+ Plugin lifecycle: to install a plugin dynamically.
+ Event: to listen the service changed event, extension changed event, plugin lifecycle changed event, framework event.
+ You can get more details from [api references](https://github.com/lorry2018/minimajs/blob/master/docs/PluginContext.html).

#### 5 Plugin Class

The Plugin is another common class when defining a plugin. It provides the below functionalities.
+ Current Plugin: to get the information of current plugin, such as plugin directory, id, name, version, and so on.
+ Lifecycle: to start, stop, uninstall current plugin.
+ Class Loading: to load a JS module from current plugin.
+ You can get more details from [api references](https://github.com/lorry2018/minimajs/blob/master/docs/Plugin.html).

#### 6 Lifecycle

The minimajs framework supports to install, start, stop and uninstall plugins in the runtime. Each plugin has installed, resolved, starting, active, stopping, uninstalled lifecycle state definitions.

When the framework install a plugin, it will read and parse the plugin.json file, validate the plugin.json, and create the Plugin instance. If the Plugin is installed, its state is in the 'installed' state.

After installing a plugin, the framework will resolve its dependencies immediately. It means, the plugin will try to find all dependent plugins. If the dependent plugin does not exist or can not be resolved, the plugin can not be resolved successfully, thus its state still be 'installed', otherwise, its state is change to 'resolved'. Once the plugin is in the 'resolved' state, it means the plugin is ready to be started.

When the minimajs framework starting a plugin, it will follow below activities sequence.
+ If current plugin is active, just return.
+ If current plugin is uninstalled, throw exception.
+ If the startLevel of plugin is bigger than frameworkStartLevel, throw exception.
+ If current plugin can not be resolved, throw exception.
+ Change the state to 'starting'.
+ Create the PluginContext instance.
+ Load the activator file, if not defined, go to next. Otherwise, load the Activator JS module, create instance and call the start(context) function. Any exception occurs will stop the plugin starting.
+ Register services of current plugin defined in the plugin.json to the framework.
+ Register extensions of current plugin defined in the plugin.json to the framework.
+ Change the state to 'active'.
+ Any exception occurs in the starting, the state will change to 'resolved'.
+ Any state change of current plugin will fire the plugin lifecycle event.

When the minimajs framework stopping a plugin, it will follow below activities sequence.
+ If current plugin is uninstalled, throw exception.
+ If the state is not in 'active' or the stoppable attribute of plugin.json is false, throw exception.
+ Change the state to 'stopping'.
+ Call the stop(context) function of Activator if it is defined. Andy exception will be ignored.
+ Unregister the services defined in the plugin.json of current plugin.
+ Unregister the extensions defined in the plugin.json of current plugin.
+ Change the state to 'resolved'.
+ Any state change of current plugin will fire the plugin lifecycle event.

When the minimajs framework uninstall a plugin, it will follow below activities sequence.
+ Stop it and then change the state to 'uninstalled'.
+ You can not do any lifecycle action on a uninstalled plugin.

7 Class Loading or Module loading

The minimajs framework allows one plugin load a JS Class(Or Module) from another. This means there is dependency on these two plugins.

If you want to load a class from another plugin, you need to declare the dependency on it as below.

```json
// 1 plugin.config
{
    "id": "demoPlugin2",
    "version": "1.0.0",
    "dependencies": [{
        "id": "demoPlugin",
        "version": "1.0.0"
    }]
}
```

Thus, we can use the PluginContext or Minima.instance to get the 'demoPlugin'.

```js
export default class Activator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    start(context) {
        let demoPlugin = context.getPlugin('demoPlugin');
        // Or let demoPlugin = Minima.instance.getPlugin('demoPlugin');
        if (demoPlugin) {
            let Assert = demoPlugin.loadClass('utilities/Assert.js').default;
            // ...
            Assert.notNull('some instance', someInstance);
        }
    }

    stop(context) {}
}
```

Usually, the extension will use this feature to load some extension class from plugin. Below is an Extension definition.

```json
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
```

The extension means that the extension plugin will register the command to the extensible plugin. The extensible plugin will handle the extension with loading class from extension plugin as below.

```js
handleCommandExtensions() {
    let extensions = Minima.instance.getExtensions('commands');
    for (let extension of extensions) {
        // The extensible plugin loads a class from extension plugin.
        let Command = extension.owner.loadClass(extension.data.command).default;
        let command = new Command();
        command.run();
    }

    log.logger.info(`The commands extension size is ${extensions.size}.`);
}
```

***Note that*** we do not need to declare a dependency between the extensible plugin and the extension plugin since the extension is dynamically.

### How to create a service

The service in the minimajs framework is used to implement the interactive between the plugins. One plugin register a plugin, thus another plugin can consume the service. The service can be register, unregister in the runtime.

#### 1 Define service

The service provides some common functionalities. Below is a demo LogService definition.

```js
export default class LogService {
    log(message) {
        if (message) {
            console.log(message);
        }
    }
}
```

#### 2 Register service

We can register a service in the plugin.json or use PluginContext instance of start function in the Activator.

With plugin.json, you can specify the name, service JS file path relative to the plugin directory, and service properties. Note that the service properties is used to filter the services registered by the same service name.

```json
{
    "id": "demoPlugin",
    "startLevel": 5,
    "version": "1.0.0",
    "services": [{
        "name": "logService",
        "service": "service/LogService.js", 
        "properties": {
            "vendor": "lorry"
        }
    }]
}
```

Also we can register the service in the Activator by using PluginContext.addService.

```js
export default class Activator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    start(context) {
        this.logServiceRegistry = context.addService('logService', new LogService());
    }

    stop(context) {
        context.removeService(this.logServiceRegistry); // This is Optional, it will be done by the minimajs framework when stopping.
    }
}
```

Remove the service in the stop function is Optional, the minimajs framework will remove the services registered by the plugin when stopping it.

#### 3 Get service

The plugin can get the service use the PluginContext or Minima.instance.

Below is the usage of PluginContext. You may get the empty service if service is not registered or is unregistered, and need to make sure the service is not null before using the service.

```js
export default class Activator {
    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
    }

    start(context) {
        let logService = context.getDefaultService('logService');
        // or let logService = context.getDefaultService('logService', {vendor : 'lorry'});

        // let logServices = context.getServices('logService');
        // or let logServices = context.getServices('logService', {vendor : 'lorry'});

        if (logService) {
            logService.log('LogService is found.');
        }
    }

    stop(context) {
        
    }
}
```

#### 4 Event

You can use the PluginContext or Minima.instance to listen the service changed event. Such as below.

```js
export default class Activator {
    static logService;

    constructor() {
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);

        this.serviceChangedListener = this.serviceChangedListener.bind(this);
    }

    start(context) {
        Activator.logService = context.getDefaultService('logService');
        context.addServiceChangedListener(serviceChangedListener);
    }

    serviceChangedListener(name, action) {
        if (name === 'logService') {
            Activator.logService = context.getDefaultService('logService');
        }
    }

    stop(context) {
        
    }
}
```

### How to create a extension

The extension feature provides the functionality that a plugin can extend the functionalities of another plugin without change any codes. This feature follows the ExtensionPoint-Extension extensibility model. The extension is available when the plugin is started and is removed after stopped. 

#### 1 Define extensionPoint and handle it

The extensible plugin which can be extended in the runtime, should define a ExtensionPoint and handle its extensions. The ExtensionPoint is unique.

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
        // Get the extensions for ExtensionPoint named 'commands'.
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

#### 2 Extension

The plugin will extend the functionalities of another plugin, it will define the extensions attribute of the plugin.json. The extension and the content of it need to follow the rules of ExtensionPoint.

Below is the extensions attribute of plugin.json. It means that the ExtensionPoint defined with id 'commands' and the extension content is an object with name and command attribute.

```json
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
```

Below is the EchoCommand.js definition.

```js
import { Minima } from 'minimajs';

export default class EchoCommand {
    constructor() {
        this.run = this.run.bind(this);
    }

    run() {
        let demoPlugin = Minima.instance.getPlugin('demoPlugin');
        let Assert = demoPlugin.loadClass('utilities/Assert.js').default;
        Assert.notNull('demoPlugin', demoPlugin);

        console.log('The echo command is executed.');
    }
}
```

The extension must match the requirement of the ExtensionPoint.

#### 3 Event

The plugin can be extended by other plugins will need to listen the extension changed event and response to it. We can use the PluginContext.addExtensionChangedListener or Minima.instance.addExtensionChangedListener to listen the extension changed event.

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

### How to use the log to find something wrong

Keep in mind, you can use the log.log file in the root directory to get the details information of the minimajs framework to resolve problems in the runtime.

## About

### Contributing

For bugs and feature requests, [please contact me](mailto:23171532@qq.com).

### Author

**Lorry Chen**

Have 10 years experience on the plugin framework. Expert at OSGi.

## Discussion QQ Group

Any problems, please contact me with the QQ Group as below.
![image](https://github.com/lorry2018/minimajs/blob/master/docs/imgs/qqgroup.jpg)

## License

Apache License 2.0.