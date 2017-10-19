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