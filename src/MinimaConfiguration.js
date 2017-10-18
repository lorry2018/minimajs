import Constants from './Constants';
import path from 'path';

/**
 * 插件框架配置
 * 
 * @ignore
 * @export
 * @class MinimaConfiguration
 */
export default class MinimaConfiguration {
    static startLevel = Constants.defaultFrameworkStartLevel;
    static log = {
        appenders: [{ type: 'console' }, {
            category: 'log',
            type: 'file',
            filename: path.resolve('./log.log'),
            maxLogSize: 104800,
            backups: 3
        }],
        replaceConsole: true,
        levels: {
            console: 'ALL'
        }
    };
}

/*
{
    "type": 'console',
    "category": 'console'
},
{
    "category": "log_file",
    "type": "file",
    "filename": "./log.log",
    "maxLogSize": 104800,
    "backups": 100
},
{
    "category": "log_date",
    "type": "dateFile",
    "filename": "./log",
    "alwaysIncludePattern": true,
    "pattern": "-yyyy-MM-dd-hh.log"
}*/