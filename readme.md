定义加载函数：



 
      private loadAndUseAppChannelSDK(gameName: string): Promise<any> {
        // ✅ 如果已经有 Promise，就直接复用
        if (this.channelSdkPromise) {
            return this.channelSdkPromise;
        }

        const hostname = window.location.hostname.toLowerCase();
        const isLocalhost = hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
        const isDebug = !!window["__DEBUG__"];


        const useFetchLoad = isDebug || isLocalhost;
        const sdkUrl = `${window.location.origin}/web/static/common/AppChannelSDK.js`;
        const spareSdkUrl = "https://raw.githubusercontent.com/hx-cocos/game-common-script/main/AppChannelSDK.js"; // ✅ 用 raw.githubusercontent 地址可直接拉取 JS 文件

        this.channelSdkPromise = new Promise((resolve, reject) => {
            function createAndInitSdk() {
                try {
                    const sdk = new window.AppChannelSDK(gameName);
                    sdk.invokeFlutterMethod("testLoadAppChannelSDK", () => {
                        resolve(sdk);
                    });
                } catch (e) {
                    reject(e);
                }
            }

            function loadScript(url: string, onSuccess: () => void, onError: (err: any) => void) {
                const existing = document.getElementById("__app_channel_sdk_script__");
                if (existing) existing.remove();

                const script = document.createElement("script");
                script.id = "__app_channel_sdk_script__";
                script.src = url;
                script.onload = () => {
                    if (!window.AppChannelSDK) {
                        onError(new Error("AppChannelSDK 未定义"));
                        return;
                    }
                    onSuccess();
                };
                script.onerror = () => {
                    onError(new Error(`加载脚本失败: ${url}`));
                };
                document.head.appendChild(script);
            }

            // ✅ 如果 SDK 已存在，直接初始化
            if (window.AppChannelSDK) {
                createAndInitSdk();
                return;
            }

            // ✅ 逻辑分两种：fetch 模式 / script 模式
            if (useFetchLoad) {
                const tryFetch = (url: string): Promise<string> => {
                    return fetch(url).then(res => {
                        if (!res.ok) throw new Error(`Fetch 失败: ${res.status}`);
                        return res.text();
                    });
                };

                tryFetch(sdkUrl)
                    .catch(err => {
                        console.warn(`⚠️ 主 SDK 拉取失败，尝试备用地址: ${err.message}`);
                        return tryFetch(spareSdkUrl);
                    })
                    .then(scriptText => {
                        eval(scriptText);
                        if (!window.AppChannelSDK) throw new Error("AppChannelSDK 未定义");
                        createAndInitSdk();
                    })
                    .catch(reject);
            } else {
                // ✅ script 标签加载方式
                loadScript(sdkUrl, createAndInitSdk, (err) => {
                    console.warn(`⚠️ 主 SDK 加载失败，尝试备用地址: ${err.message}`);
                    loadScript(spareSdkUrl, createAndInitSdk, reject);
                });
            }
        });

        return this.channelSdkPromise;
    }



    
全局变量定义sdk的常量：

  
    protected channelSDk = null;
   
    private channelSdkPromise: Promise<any> = null;


加载sdk（构造函数或者初始化中）

  console.log("appchannelsdk 开始加载sdk插件");

    this.loadAndUseAppChannelSDK("激战突围").then((sdkInstance) => {
        console.log("appchannelsdk sdk 插件加载成功");
        this.channelSDk = sdkInstance;

        // 可选测试调用
        this.channelSDk.invokeFlutterMethod("testLoadAppChannelSDK", () => {});
    }).catch(err => {
        console.error("appchannelsdk 加载失败", err);
    });

sdk通信：

  上报事件:

        protected reportAppEvent(type: String, data: any) {
        if (this.channelSDk != null)
            this.channelSDk.invokeFlutterMethod("reportEvent", {
                "type": type,
                "data": data
            });
          }

    事件:
        ///关卡开始
        this.reportAppEvent("stageStart", { 'lvId': lvId, "desc": desc });
       ///关卡结束
        this.reportAppEvent("stageEnd", { 'lvId': lvId, "desc": desc });

        ///关卡失败
        this.reportAppEvent("stageFail", { 'lvId': lvId, "desc": desc });

        ///获得奖励
        this.reportAppEvent("stageAward", d);

        ///显示banner: 
            if (this.channelSDk != null)
            this.channelSDk.invokeFlutterMethod("showBanner")

        ///关闭banner
            if (this.channelSDk != null)
            this.channelSDk.invokeFlutterMethod("hideBanner")

        ///退出游戏
             if (this.channelSDk != null)
            this.channelSDk.invokeFlutterMethod("exitGame", (result) => {

            })


        ///显示激励视频

                  if (this.channelSDk)
            this.channelSDk.invokeFlutterMethod("showRewardedVideo", (status) => {
                if (status == 1) {
                    console.log("激励视频已观看完毕 ");
                 
                }
                else if (status == 0) {
                    console.log("激励视频未观看完毕 ");
                   
                }
                else {
                    console.log("激励视频加载失败 ");
                 
                }
            });
  
