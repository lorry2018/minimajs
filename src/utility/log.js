import log from 'log4js';
import MinimaConfiguration from '../MinimaConfiguration';

log.configure(MinimaConfiguration.log);
let logger = log.getLogger('log');
exports.logger = logger;