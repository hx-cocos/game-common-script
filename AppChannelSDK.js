(function (global) {
  function AppChannelSDK(gameName) {
    this.gameName = gameName;
    this.callbackMap = {};
    this.bindFlutterCallback();
  }

  AppChannelSDK.prototype.generateId = function () {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
  };

  AppChannelSDK.prototype.bindFlutterCallback = function () {
    var self = this;
    window.onFlutterCallback = function (callbackId, result) {
      var cb = self.callbackMap[callbackId];
      if (cb) {
        cb(result);
        delete self.callbackMap[callbackId];
      }
    };
  };

  AppChannelSDK.prototype.invokeFlutterMethod = function (methodName, dataOrCallback, callback) {
    var data = {};
    var actualCallback;

    if (typeof dataOrCallback === 'function') {
      actualCallback = dataOrCallback;
    } else if (dataOrCallback !== undefined) {
      data = dataOrCallback;
      actualCallback = callback;
    }

    var callbackId = actualCallback ? this.generateId() : null;

    if (callbackId && actualCallback) {
      this.callbackMap[callbackId] = actualCallback;
    }

    var payload = {
      method: methodName,
      data: data,
      callbackId: callbackId,
      gameName: this.gameName
    };

    if(methodName=="testLoadAppChannelSDK"){
         console.log(gameName+"AppChannelSDK加载成功: 被cocos调用");
    }else{
        if (window.CocosChannel && window.CocosChannel.postMessage) {
      window.CocosChannel.postMessage(JSON.stringify(payload));
    } else {
      console.log("当前不支持控制广告");
      console.warn(this.gameName + " CocosChannel [" + methodName + "] is not available.");
      if (actualCallback) actualCallback(null);
    }
    }
  
  };

  // 暴露为全局变量
  global.AppChannelSDK = AppChannelSDK;

})(window);
