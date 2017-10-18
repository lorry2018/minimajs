export default class Strings {
    static hasText(instance) {
        if (instance && typeof instance === 'string') {
            return instance.replace(/(^\s*)|(\s*$)/g, '') !== '';
        }

        return false;
    }

    static trim(instance) {
        if (instance && typeof instance === 'string') {
            return instance.replace(/(^\s*)|(\s*$)/g, '');
        }

        throw new Error('The instance is not string.');
    }
}