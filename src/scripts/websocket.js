class WebSocketConnection {

    constructor(callbacks){
        //this._tweetWsUri = "ws://physics-lillith.rhcloud.com:8000";
        //this._tweetWsUri = "ws://54.244.69.173:8080"; //AMAZON
        //this._tweetWsUri = "ws://127.0.0.1:8080";
        this._tweetWsUri = "ws://192.168.0.32:8080";
        this._txSocket = new WebSocket(this._tweetWsUri);

        this._callbacks = callbacks;

        self = this;

        this._txSocket.onopen = function(evt) { self.onTxOpen(evt); };
        this._txSocket.onclose = function(evt) { self.onTxClose(evt); };
        this._txSocket.onmessage = function(evt) { self.onTxMessage(evt); };
        this._txSocket.onerror = function(evt) { self.onTxError(evt); };

        document.addEventListener( 'keydown', function( e ) {
            if( e.keyCode === 32 ) {
                self.doTxSend(JSON.stringify({d: 'scatter'}));
                e.preventDefault();
            }
            if( e.keyCode === 85 ) {
                self.doTxSend(JSON.stringify({d: 'updateAll'}));
                e.preventDefault();
            }
        });

        if ( /*@cc_on!@*/ false) { // check for Internet Explorer
            document.onfocusin = this.onFocus.bind(this);
            document.onfocusout = this.onBlur.bind(this);
        } else {
            window.onfocus = this.onFocus.bind(this);
            window.onblur = this.onBlur.bind(this);
        }
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
        if(object.s === "all"){
            this._callbacks.all(object.d);
        }
        if(object.s === "update"){
            this._callbacks.update(object.d);
        }
        if(object.s === "add"){
            this._callbacks.add(object.d);
        }
        if(object.s === "remove"){
            this._callbacks.remove(object.d);
        }
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

    onBlur() {
        document.body.className = 'blurred';
    }

    onFocus() {
        document.body.className = 'focused';
        this.doTxSend(JSON.stringify({d: 'updateAll'}));
    }

}

export default WebSocketConnection;
