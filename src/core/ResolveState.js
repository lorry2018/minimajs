/**
 * 解析状态枚举：可以解析、解析失败、解析成功
 * 
 * @class ResolveState
 */
export default class ResolveState {

    /**
     * 可解析
     * 
     * @static
     * @memberof ResolveState
     */
    static RESOLVABLE = new ResolveState(0);

    /**
     * 解析失败
     * 
     * @static
     * @memberof ResolveState
     */
    static RESOLVEFAILED = new ResolveState(1);

    /**
     * 解析成功
     * 
     * @static
     * @memberof ResolveState
     */
    static RESOLVESUCCESS = new ResolveState(2);

    /**
     * 创建一个状态枚举
     * 
     * @ignore
     * @param {any} 状态，0~2 
     * @memberof ResolveState
     */
    constructor(state) {
        this.state = state;
        Object.freeze(this);
    }
}
Object.freeze(ResolveState);