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