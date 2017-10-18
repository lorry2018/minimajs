export default class MinimaError extends Error {
    // 框架与事件：1***
    // 安装：2***
    // 解析：3***

    static notMarkFailedForEmptyDependencies = 3009;
    // 启动、停止、卸载：4***
    static notActionForResolveFailed = 40009;
    static notActionForUninstalled = 4008;
    static notStartedForStartLevel = 4007;
    static notStartedForActivatorLoadOrStartFailed = 4006;
    // 扩展与服务：5***

    constructor(message, code, error = null) {
        super(message);
        this._code = code;
        this._error = error;
    }

    get code() {
        return this._code;
    }

    get internalError() {
        return this._error;
    }
}