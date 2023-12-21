/**
 * link桥接---客户端
 */
function GLink_client() {

    /**
     * 客户端表
     */
    var clientTable = {};

    /**
     * 更新比对表
     */
    var updateTable = {};

    /**
     * 消息序列
     */
    this.sequnceForMsg = [];

    /**
     * 获取update
     * @param {*} id    元件ID
     */
    function getUpdate(id){
        return updateTable[id];
    }

    /**
     * 设置update
     * @param {*} id  元件id
     * @param {*} date   数据
     */
    function setUpdate(id,date){
        updateTable[id] = date;
    }

    /**
     * 元素模型
     */
    function clientPackModel() {
        this.callback  = null;   //回调地址
    }

    /** 
     * 获取客户端包
     * @param {string} id 
     */
    function getClientPackById(id) {
        if(clientTable[id] != null){
            return clientTable[id];
        }
    }

    /** 
     * 获取全部客户端包列表
     */
    function getAllClientPack() {
        return clientTable;
    }

    /**
     * 增加客户端回调包
     * @param {string} id 
     * @param {clientPackModel} model 
     */
    function addClientPackById(id,model) {
        if(clientTable[id] == null){
            clientTable[id] = model;
            return true;
        }
        return false;
    }

    /**
     * 重置客户端包
     * @param {string} id 
     * @param {clientPackModel} model 
     */
    function setClientPackById(id,model){
        clientTable[id] = model;
    }

    /**
     * 删除
     * @param {string} id 
     */
    function delClientPackById(id){
        if(clientTable[id] != null){
            delete clientTable[id];
        }
    }

    /**
     * 发送模型
     */
    function sendModel() {
        //头信息
        this.header = {
            function:null,  //函数名称
        };
        //请求体
        this.body = {
            type:null,      //类型
            frameId:null,   //窗口Id
            pageId:null,    //页面Id
            index:null,      //元件Id
            queryInfo:null  //请求
        }
    }

    /**
     * 消息序列模型
     */
    function onceMsgModel(){
        this.key = null;
        this.status = null;// 0：未发送  1：已发送（未回复）
        this.msg = null;
    }

    /**
     * 打包数据模型
     */
    function packgeSendModel(){
         //头信息
         this.header = {
            function:null,  //函数名称
        };
        //请求体
        this.body = {
            packge:null
        }
    }
    
    /**
     * 发送webSocket请求
     * @param {*} type      请求类型 query
     * @param {*} frameId   窗口Id
     * @param {*} pageId    页面Id
     * @param {*} index     元件Id
     * @param {*} queryInfo 请求体
     * @param {*} callback  回调地址
     */
    this.sendMessage = (type, frameId, pageId, index, queryInfo, callback)=>{
        let id = `${frameId}-${pageId}-${index}`;
        let pack = getClientPackById(id);
        if(pack == null){
            pack= new clientPackModel();
            addClientPackById(id,pack);
        }
        pack.callback = callback;

        let sendMsg = new sendModel();
        sendMsg.header.function = "sendMessage";
        sendMsg.body.type = type;
        sendMsg.body.frameId = frameId;
        sendMsg.body.pageId = pageId;
        sendMsg.body.index = index;
        sendMsg.body.queryInfo = queryInfo;

        if(type == "cancel"){
            delClientPackById(id); 
        }
        //发给服务层
        this.requestServlet(sendMsg);
    }

    /**
     * 发送Http请求
     * @param {*} type      请求类型 查询、提交
     * @param {*} frameId   窗口Id
     * @param {*} pageId    页面Id
     * @param {*} index     元件Id
     * @param {*} queryInfo 请求体
     * @param {*} queryIndex 请求体对应下标
     * @param {*} callback  回调地址
     */
    this.postHttpMessage = (type, frameId, pageId, index, queryInfo, queryIndex, callback)=>{
        let id = `${frameId}-${pageId}-${index}`;
        let pack = getClientPackById(id);
        if(pack == null){
            pack= new clientPackModel();
            addClientPackById(id,pack);
        }
        pack.callback = callback;

        let sendMsg = new sendModel();
        sendMsg.header.function = "postHttpMessage";
        sendMsg.body.type = type;
        sendMsg.body.frameId = frameId;
        sendMsg.body.pageId = pageId;
        sendMsg.body.index = index;
        sendMsg.body.queryInfo = queryInfo;
        //动态新增
        sendMsg.body.queryIndex = queryIndex;

        //发给服务层
        this.requestServlet(sendMsg);
    }

    //组团发送ws请求
    this.send_wsQuerys = (wsList)=>{
        for (let i = 0; i < wsList.length; i++) {
            let send = wsList[i];
            let querys = send.querys;
            if (querys!= null) {
                for (let j = 0; j < querys.length; j++) {
                    let widgetQuery = querys[j];
                    let frameId = widgetQuery.frameId;
                    let pageId = widgetQuery.pageId;
                    let index = widgetQuery.index;
                    let callback = widgetQuery.callback;
                    let id = `${frameId}-${pageId}-${index}`;
                    //记录回调地址
                    let pack = getClientPackById(id);
                    if(pack == null){
                        pack= new clientPackModel();
                        addClientPackById(id,pack);
                    }
                    pack.callback = callback;
                    delete widgetQuery.callback;
                }
            } 
        }
        //打包发送模型
        let sendMsg = new packgeSendModel();
        sendMsg.header.function = "send_wsQuerys";
        sendMsg.body.packge = wsList;
        //发给服务层
        this.requestServlet(sendMsg);
    }


    //组团发送ws请求
    this.send_httpQuerys = (httpList)=>{
        for (let i = 0; i < httpList.length; i++) {
            let send = httpList[i];
            let querys = send.querys;
            if (querys!= null) {
                for (let j = 0; j < querys.length; j++) {
                    let widgetQuery = querys[j];
                    let frameId = widgetQuery.frameId;
                    let pageId = widgetQuery.pageId;
                    let index = widgetQuery.index;
                    let callback = widgetQuery.callback;
                    let id = `${frameId}-${pageId}-${index}`;
                    //记录回调地址
                    let pack = getClientPackById(id);
                    if(pack == null){
                        pack= new clientPackModel();
                        addClientPackById(id,pack);
                    }
                    pack.callback = callback;
                    delete widgetQuery.callback;
                }
            } 
        }
        //打包发送模型
        let sendMsg = new packgeSendModel();
        sendMsg.header.function = "send_httpQuerys";
        sendMsg.body.packge = httpList;
        //发给服务层
        this.requestServlet(sendMsg);
    }

    /**
     * 向服务层发起请求
     */
    this.requestServlet = (sendModel)=>{
        
        let message = JSON.stringify(sendModel);
        if(typeof window != "undefined" && window != null && typeof GLink_servlet != 'undefined'){
            //网页
            GLink_servlet.sharedInstance().service(message);
            
        }else{

            if(platfromEnable() == true && window.storageCanUse == false){
                let sendFnName = sendModel.header.function;
                let sendBody = sendModel.body;
                //手动维护请求队列
                if(sendFnName == "postHttpMessage" || sendFnName == "sendMessage"){
                    //有返回的请求移除队列
                    let frameId = sendBody.frameId;
                    let pageId = sendBody.pageId;
                    let index = sendBody.index;
                    let id = `${frameId}-${pageId}-${index}`;
                    let msgPack = new onceMsgModel();
                    msgPack.key = id;
                    msgPack.msg = message;
                    msgPack.status = 0;
                    GLink_client.sharedInstance().sequnceForMsg.push(msgPack);
                    if(GLink_client.sharedInstance().sequnceForMsg.length <= 1){
                       let msgPack = GLink_client.sharedInstance().sequnceForMsg[0];
                       msgPack.status = 1;
                       localStorage.setItem("G_Request",msgPack.msg);
                    }
                }else{
                    //组包请求不计入队列
                    localStorage.setItem("G_Request",message);
                }
            }else{
                localStorage.setItem("G_Request",message);
            }
        }
        
    }
//-----------------接收---------------

    /**
     * 返回结果集模型
     * responseModel = {
     *   header:{
     *       frameId:null,
     *       pageId:null,
     *       indexId:null,
     *   },
     *   body:{
     *       result:null
     *   }
     * }
     */

    /**
     * 接收消息
     * @param {responseModel} response 
     */
    this.receiveMessage = (response)=>{
        let header = response.header;
        let body = response.body;
        let frameId = header.frameId;
        let pageId = header.pageId;
        let index  = header.indexId;
        let id = `${frameId}-${pageId}-${index}`;
        let result = body.result;
        let pack = getClientPackById(id);
        if(pack != null){
            //同一个变更不发送请求回调
            if(result != null && result[0] != null && result[0].updateCounter != null){
                let oldDate = getUpdate(id);
                let newDate = "";
                //全量比对数据是否有更新
                for (const i in result) {
                    if(result[i]  == null){
                        continue;    
                    }
                    newDate += (i == "0" ? `${result[i].updateCounter}` : `-${result[i].updateCounter}`);
                }
                if(oldDate !== newDate){
                    setUpdate(id,newDate);
                    pack.callback(result);
                }
            }else{
                pack.callback(result);
                
            }
        }
    }


    this.getAllClientPack = ()=>{
        return getAllClientPack();
    }

}
//单例静态函数
GLink_client.sharedInstance = function(){
    if(this.instance == null){
        this.instance = new GLink_client();
    }
    return this.instance;
}


 //监听localStroage变更
 window.storageCanUse = false;
 window.addEventListener("storage", function (event) {
    window.storageCanUse = true;
    if(event.key == "G_Response"){
        let responseData = JSON.parse(event.newValue);
        let header = responseData.header;
        let sourceId = window.GUIFrameCounter;
        // console.info(`窗口: ${sourceId} , 接收广播数据: ${event.newValue}`);
        if(header.frameId == sourceId){
            GLink_client.sharedInstance().receiveMessage(responseData);
        }
    }else if(event.key == "G_Close"){
        console.info("收到SDK的关闭消息");
    }else if(event.key == "G_userid"){
        if(xGlobalUserData != null){
            if(xGlobalUserData.variables == null){
                xGlobalUserData.variables = {};
            }
            xGlobalUserData.variables.userId =  event.newValue;
        }
    }else if(event.key == "G_localHttp"){
        if(typeof httpGatWay != "undefined"){
            httpGatWay =  event.newValue;
        } 
    }
});

//安卓UI组件兼容性问题解决 7、8、9
function androidGetStorage(){
    if(window.storageCanUse == false){
        setTimeout(() => {
            let G_ResponseValue = localStorage.getItem("G_Response");
            let G_CloseValue = localStorage.getItem("G_Close");
            let G_UserIdValue = localStorage.getItem("G_userid");
            let G_LocalHttptValue = localStorage.getItem("G_localHttp");
            // "G_Response"
            if(G_ResponseValue != null && window.oldG_ResponseValue != G_ResponseValue){
                let responseData = JSON.parse(G_ResponseValue);
                let header = responseData.header;
                let sourceId = window.GUIFrameCounter;
                window.oldG_ResponseValue = G_ResponseValue;
                // console.info(`窗口: ${sourceId} , 接收广播数据: ${event.newValue}`);
                if(header.frameId == sourceId){
                    if(GLink_client.sharedInstance().sequnceForMsg.length > 0){
                        let frameId = header.frameId;
                        let pageId = header.pageId;
                        let index  = header.indexId;
                        let idKey = `${frameId}-${pageId}-${index}`;
                        //从请求序列中去掉本次返回的内容
                        for (let i = 0; i < GLink_client.sharedInstance().sequnceForMsg.length; i++) {
                            const msgPack = GLink_client.sharedInstance().sequnceForMsg[i];
                            if(msgPack.key == idKey){
                                GLink_client.sharedInstance().sequnceForMsg.splice(i,1);
                                break;
                            }
                        }
                        // //发送请求序列中当前未发送的数据
                        // for (let s = 0; s < GLink_client.sharedInstance().sequnceForMsg.length; s++) {
                        //     const msgPack = GLink_client.sharedInstance().sequnceForMsg[s];
                        //     if(msgPack.status == 0){
                        //         msgPack.status = 1;
                        //         localStorage.setItem("G_Request",msgPack.msg);
                        //         break;
                        //     }
                        // }
                     }
                    GLink_client.sharedInstance().receiveMessage(responseData);
                }
            }
            // "G_Close"
            if(G_CloseValue != null &&  window.oldG_CloseValue != G_CloseValue){
                window.oldG_CloseValue = G_CloseValue;
                console.info("收到SDK的关闭消息");
            }
            // "G_userid"
            if(G_UserIdValue != null && window.oldG_UserIdValue != G_UserIdValue){
                if(xGlobalUserData != null){
                    window.oldG_UserIdValue = G_UserIdValue
                    if(xGlobalUserData.variables == null){
                        xGlobalUserData.variables = {};
                    }
                    xGlobalUserData.variables.userId = G_UserIdValue;
                }
            }
            // "G_localHttp"
            if(G_LocalHttptValue != null && window.oldG_LocalHttptValue != G_LocalHttptValue){
                window.oldG_LocalHttptValue = G_LocalHttptValue;
                if(typeof httpGatWay != "undefined"){
                    httpGatWay =  G_LocalHttptValue;
                }
            }
            androidGetStorage();
        }, 1);
    }
}

function scanSequece(){
    if(window.storageCanUse == false){
        setTimeout(() => {
            //发送请求序列中当前未发送的数据
            for (let s = 0; s < GLink_client.sharedInstance().sequnceForMsg.length; s++) {
                const msgPack = GLink_client.sharedInstance().sequnceForMsg[s];

                if(msgPack.status == 0 && msgPack.msg.indexOf('cancel')!= -1){
                    GLink_client.sharedInstance().sequnceForMsg.splice(s,1);
                    break;
                }else if(msgPack.status == 0){
                    msgPack.status = 1;
                    localStorage.setItem("G_Request",msgPack.msg);
                    break;
                }
            }
            scanSequece();
        },50);
    }
}

function platfromEnable(){
    var ua = navigator.userAgent;
    if( ua.indexOf("Android") >= 0 ){
        var androidversion = parseFloat(ua.slice(ua.indexOf("Android")+8));
        if (androidversion < 10){
            return true;
        }
    }
    return false;
}

if(platfromEnable() == true ){
    androidGetStorage();
    scanSequece();
}

// ------ Andorid End ----------

(function () {
    //初始化窗口id
    function G_initWindowsFrame() {
        //如果窗口id是1，那么直接从缓存里去
        let frameId = localStorage.getItem("G_frameCounter");
        frameId = frameId == null ? 1 : parseInt(frameId)+1;
        window.GUIFrameCounter = `GUI_${frameId}`;
        localStorage.setItem("G_frameCounter",frameId);
    }
    
    G_initWindowsFrame();

    function sendHeartbeat() {
        localStorage.setItem("G_Heartbeat", `${window.GUIFrameCounter}#${Math.floor(Math.random()*10000)}` );
    }
    window.setInterval(sendHeartbeat,30E3);

    function setLocalUserId(){
        if(typeof xGlobalUserData != "undefined" && xGlobalUserData != null && typeof httpGatWay != "undefined"){
            httpGatWay = localStorage.getItem("G_localHttp");
            if(xGlobalUserData.variables == null){
                xGlobalUserData.variables = {};
            }
            let userId = localStorage.getItem("G_userid");
            xGlobalUserData.variables.userId =  userId;
        }else{
            window.setTimeout(setLocalUserId,500);
        }
    }
    
    setLocalUserId();
})();