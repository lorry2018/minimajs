import Strings from './Strings';
import fs from 'fs';

export default class Assert {
    static notNull(name, instance) {
        if (instance) {
            return;
        }

        throw new Error(`The parameter ${name} can not be null.`);
    }

    static notEmptyArray(name, instance) {
        Assert.notNull(name, instance);
        if (instance.length > 0) {
            return;
        }

        throw new Error(`The parameter ${name} must be array and can not be empty.`);
    }

    static notEmpty(name, instance) {
        if (Strings.hasText(instance)) {
            return;
        }

        throw new Error(`The parameter ${name} must be string and can not be empty.`);
    }

    static notExists(instance) {
        if (fs.existsSync(instance)) {
            return;
        }

        throw new Error(`The file ${instance} does not exists.`);
    }
}