// AppChannelSDK.js
(function(global) {
  class AppChannelSDK {
    constructor(gameName) {
      this.gameName = gameName;
      this.callbackMap = {};
      this.bindFlutterCallback();
    }

    generateId() {
      return `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    bindFlutterCallback() {
      global.onFlutterCallback = (callbackId, result) => {
        const cb = this.callbackMap[callbackId];
        if (cb) {
          cb(result);
          delete this.callbackMap[callbackId];
        }
      };
    }

    invokeFlutterMethod(methodName, dataOrCallback, callback) {
      let data = {};
      let actualCallback;

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
        gameName: this.gameName
      };

      if (global.CocosChannel && typeof global.CocosChannel.postMessage === "function") {
        global.CocosChannel.postMessage(JSON.stringify(payload));
      } else {
        console.warn(`${this.gameName} CocosChannel [${methodName}] is not available.`);
        if (actualCallback) actualCallback(null);
      }
    }
  }

  // 挂载到全局，WebView 中可以直接使用
  global.AppChannelSDK = AppChannelSDK;
})(window);
