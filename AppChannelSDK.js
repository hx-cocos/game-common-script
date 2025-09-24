export default class AppChannelSDK {


    // 游戏标识
    public readonly gameName: string;

    // 存储回调
    protected callbackMap: { [key: string]: (data: any) => void } = {};

    // 生成唯一ID
    protected generateId(): string {
        return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }
    constructor(ganmeName: string) {
        this.gameName = ganmeName;
        this.bindFlutterCallback();
    }



    // 绑定供 Flutter 调用的回调函数
    protected bindFlutterCallback() {
        (window as any).onFlutterCallback = (callbackId: string, result: any) => {
            const cb = this.callbackMap[callbackId];
            if (cb) {
                cb(result);
                delete this.callbackMap[callbackId];
            }
        };
    }

    /**
     * 调用 Flutter 方法
     *
     * 调用形式支持：
     * - invokeFlutterMethod("method")
     * - invokeFlutterMethod("method", callback)
     * - invokeFlutterMethod("method", data)
     * - invokeFlutterMethod("method", data, callback)
     */
    public invokeFlutterMethod(methodName: string): void;
    public invokeFlutterMethod(methodName: string, callback: (result: any) => void): void;
    public invokeFlutterMethod(methodName: string, data: any): void;
    public invokeFlutterMethod(methodName: string, data: any, callback: (result: any) => void): void;
    public invokeFlutterMethod(
        methodName: string,
        dataOrCallback?: any | ((result: any) => void),
        callback?: (result: any) => void
    ): void {
        let data: any = {};
        let actualCallback: ((result: any) => void) | undefined;

        if (typeof dataOrCallback === "function") {
            actualCallback = dataOrCallback;
        } else if (dataOrCallback !== undefined) {
            data = dataOrCallback;
            actualCallback = callback;
        }

        const callbackId = actualCallback ? this.generateId() : null;

        if (callbackId && actualCallback) {
            this.callbackMap[callbackId] = actualCallback;
        }

        const payload = {
            method: methodName,
            data,
            callbackId,
            gameName:this.gameName

        };

        if ((window as any).CocosChannel?.postMessage) {
            (window as any).CocosChannel.postMessage(JSON.stringify(payload));
        } else {
          console.warn(this.gameName + " CocosChannel   ["+methodName+"] is not available.");
            if (actualCallback) actualCallback(null);
        }
    }
}
