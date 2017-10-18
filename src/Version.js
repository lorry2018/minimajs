import Strings from './utility/Strings';
import Constants from './Constants';

/**
 * 版本对象
 * 
 * @export
 * @class Version
 */
export default class Version {

    /**
     * 创建一个版本
     * 
     * @ignore
     * @param {string} version 版本字符串
     * @memberof Version
     */
    constructor(version) {
        if (!version) {
            version = '';
        }

        this.rawVersion = version;
        this.compare = this.compare.bind(this);
        this.parse = this.parse.bind(this);

        this.parse(version);

        this._version = this.major + '.' + this.minor + '.' + this.revision;
    }

    /**
     * 主版本
     * 
     * @type {number}
     * @readonly
     * @memberof Version
     */
    get major() {
        return this._major;
    }

    /**
     * 次版本
     * 
     * @type {number}
     * @readonly
     * @memberof Version
     */
    get minor() {
        return this._minor;
    }

    /**
     * 修订版本
     * 
     * @type {number}
     * @readonly
     * @memberof Version
     */
    get revision() {
        return this._revision;
    }

    /**
     * 版本原始格式
     * 
     * @readonly
     * @memberof Version
     */
    get versionString() {
        return this._version;
    }

    parse(versionString) {
        if (!Strings.hasText(versionString)) {
            versionString = Constants.defaultVersion;
            this._major = 0;
            this._minor = 0;
            this._revision = 0;
        } else {
            let wrongVersionError = new Error(`The version ${versionString} is not correct version.`);
            let versionParts = versionString.split('.');
            if (versionParts.length >= 4) {
                throw wrongVersionError;
            }

            this._major = parseInt(versionParts[0]);

            if (isNaN(this._major)) {
                throw wrongVersionError;
            }

            if (versionParts.length >= 2) {
                this._minor = parseInt(versionParts[1]);
            } else {
                this._minor = 0;
            }

            if (isNaN(this._minor)) {
                throw wrongVersionError;
            }

            if (versionParts.length >= 3) {
                this._revision = parseInt(versionParts[2]);
            } else {
                this._revision = 0;
            }

            if (isNaN(this._revision)) {
                throw wrongVersionError;
            }
        }
    }

    /**
     * 比较版本
     * 
     * @param {Version} otherVersion 另一个版本对象
     * @returns {number} 如果大于另一个版本，则返回1；如果相等，返回0；否则返回-1
     * @memberof Version
     */
    compare(otherVersion) {
        if (!otherVersion || (typeof otherVersion !== 'object')) {
            return 1;
        }

        if (this.major !== otherVersion.major) {
            return this.major - otherVersion.major > 0 ? 1 : -1;
        }

        if (this.minor !== otherVersion.minor) {
            return this.minor - otherVersion.minor > 0 ? 1 : -1;
        }

        let result = this.revision - otherVersion.revision;

        return result > 0 ? 1 : (result === 0 ? 0 : -1);
    }

    /**
     * 解析版本
     * 
     * @static
     * @param {string} versionString 版本字符串
     * @returns {Version} 解析结果版本对象
     * @memberof Version
     */
    static parse(versionString) {
        return new Version(versionString);
    }
}