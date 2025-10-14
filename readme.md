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

    // ✅ 创建唯一的加载 Promise
    this.channelSdkPromise = new Promise((resolve, reject) => {
        function createAndInitSdk() {
            try {
                const sdk = new window.AppChannelSDK(gameName);
                sdk.invokeFlutterMethod("testLoadAppChannelSDK", () => {
                    resolve(sdk); // ✅ resolve 成 SDK 实例
                });
            } catch (e) {
                reject(e);
            }
        }

        if (window.AppChannelSDK) {
            createAndInitSdk();
            return;
        }

        if (useFetchLoad) {
            fetch(sdkUrl)
                .then(async (res) => {
                    if (!res.ok) throw new Error(`Fetch 脚本失败: ${res.status}`);
                    const scriptText = await res.text();
                    eval(scriptText);
                    if (!window.AppChannelSDK) throw new Error("AppChannelSDK 未定义");
                    createAndInitSdk();
                })
                .catch(reject);
        } else {
            if (document.getElementById("__app_channel_sdk_script__")) {
                if (!window.AppChannelSDK) {
                    reject(new Error("AppChannelSDK 已加载但未定义"));
                } else {
                    createAndInitSdk();
                }
                return;
            }

            const script = document.createElement("script");
            script.id = "__app_channel_sdk_script__";
            script.src = sdkUrl;

            script.onload = () => {
                if (!window.AppChannelSDK) {
                    reject(new Error("AppChannelSDK 未定义"));
                    return;
                }
                createAndInitSdk();
            };

            script.onerror = () => {
                reject(new Error("加载 AppChannelSDK 脚本失败"));
            };

            document.head.appendChild(script);
        }
    });

    return this.channelSdkPromise;}

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
  
