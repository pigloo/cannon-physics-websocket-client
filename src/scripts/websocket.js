class WebSocketConnection {

    constructor(callBack){
        this._tweetWsUri = "ws://physics-lillith.rhcloud.com:8000";
        //this._tweetWsUri = "ws://127.0.0.1:8080";
        //this._tweetWsUri = "ws://192.168.0.32:8080";
        this._txSocket = new WebSocket(this._tweetWsUri);

        this._callBack = callBack;

        this._hillarySupporters = 0;
        this._trumpSupporters = 0;

        self = this;

        this._txSocket.onopen = function(evt) { self.onTxOpen(evt); };
        this._txSocket.onclose = function(evt) { self.onTxClose(evt); };
        this._txSocket.onmessage = function(evt) { self.onTxMessage(evt); };
        this._txSocket.onerror = function(evt) { self.onTxError(evt); };

    }

    onTxOpen(evt) {
        console.log("TWEET SERVER CONNECTED");
        //console.log(evt);
    }

    onTxClose(evt) {
        console.log("TWEET SERVER DISCONNECTED");
        console.log(evt);
    }

    onTxMessage(evt) {
        var object = JSON.parse(evt.data);
        //console.log(object);
        this._callBack(object.data);
    }

    onTxError(evt) {
        console.log("TWEET SERVER CONNECTION ERROR");
        console.log(evt);
    }

    doTxSend(message) {
        console.log("REQUESTING DATA FROM TWEET SERVER");
        this._txSocket.send(message);
    }

    closeConnection() {
        txSocket.close();
    }

}

export default WebSocketConnection;
