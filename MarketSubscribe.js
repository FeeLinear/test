class MarketSubscribe {
  constructor(options, env) {
    if (options && env) {
      // 初始化参数
      const { AppKey, AppSecret, userid, token, deviceId, authServer } =
        options;
      const { ENV_TYPE, SDK_REQUEST } = env;
      this.AppKey = AppKey;
      this.AppSecret = AppSecret;
      this.userid = userid;
      this.token = token;
      this.deviceId = deviceId; // 设备ID 如果限制链接数为1，重复订阅则会T掉上一次的订阅，若需要多次订阅需设置不同的deviceId
      this.authServer = authServer; //第三方认证环境码(pro:生产,dev:开发)
      this.ENV_TYPE = ENV_TYPE; // 需要连接的环境 生产/仿真/测试 仿真：window.ENV_TYPE.SZSE_SIM
      this.SDK_REQUEST = SDK_REQUEST; // 需要订阅的接口API 例：window.SDK_REQUEST_QUOTESUBSCRIBE
      this.init();
    }
  }
  AppKey;
  AppSecret;
  userid;
  token;
  deviceId;
  authServer;
  reqSub;
  ENV_TYPE;
  SDK_REQUEST;
  init() {
    this.doSign(); // NSDK签名回调
    this.setNotification(); //NSDK通知回调
    this.setRealLog(); //NSDK日志回调
    this.connectSDK(); //NSDK登录连接
    this.createRequestObj(); //订阅请求创建
  }
  doSign() {
    window.NSDK.setSignCallback(() => {
      const promise = new Promise( (resolve, reject) =>{
        //时间戳
        const timestamp = Date.parse(new Date());
        //随机数
        const rand = Math.floor(Math.random() * 30000);
        const signModel = GCrypto.sign(
          this.AppKey,
          timestamp,
          rand,
          this.AppSecret
        );
        resolve(signModel);
      });
      return promise;
    });
  }
  setNotification() {
    window.NSDK.setNotificationCallback(this.doNotification);
  }
  setRealLog() {
    window.NSDK.setRealLogCallback(this.doRealLog);
  }
  doNotification(event) {
    //对通过回调返回的信息进行处理
    if (event.code == window.STATU_CODE.MAINQUOTE_CONNECT_SUCCESS) {
      console.log("NSDK通知：登录连接成功");
    } else {
      console.log(
        "NSDK通知：code: " + event.code + "   message: " + event.message
      );
    }
  }
  doRealLog(log) {
    //对通过回调返回的日志进行显示
    console.log("NSDK日志：" + log.msg);
  }
  connectSDK() {
    //  设置连接深证云行情生产环境
    window.NSDK.setEnvType(this.ENV_TYPE);
    //其他参数
    const otherParams = { deviceId: this.deviceId };
    //执行连接
    window.NSDK.connect(this.userid, this.token, this.authServer, otherParams);
  }
  createRequestObj() {
    this.reqSub = window.NSDK.createRequestItem(this.SDK_REQUEST);
  }
  destroyRequest() {
    window.NSDK.destroyRequestItem(this.reqSub);
  }
  disconnect() {
    window.NSDK.disconnect();
  }
}
