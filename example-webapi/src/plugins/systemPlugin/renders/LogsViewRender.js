import template from 'art-template';
import path from 'path';
import fs from 'fs';
import Activator from '../Activator';

export default class LogsViewRender {
    constructor() {
        this.renderAsync = this.renderAsync.bind(this);
    }

    renderAsync(callBack) {
        let plugin = Activator.context.plugin;
        let logsView = path.join(plugin.pluginDirectory, 'views/logs.html');
        let logFile = path.resolve('./log.log');

        if (!fs.existsSync(logFile)) {
            callBack('');
            return;
        }

        fs.readFile(logFile, 'utf-8', (error, data) => {
            let logsData = {
                logs: data
                    .replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\r/g, '<br/>')
                    .replace(/(ERROR)/g, '<font color=red>ERROR</font>')
                    .replace(/(WAIN)/g, '<font color=yellow>WAIN</font>')
                    .replace(/(INFO)/g, '<font color=green>INFO</font>')
            };

            callBack(template(logsView, logsData));
        });
    }
}