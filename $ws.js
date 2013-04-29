Function.prototype.method = function(name, fn){
  this.prototype[name] = fn;
  return this;
};
String.prototype.forEach = Array.prototype.forEach; // polyfill
//new WebSocket((uri || 'ws://e.ws.ndn.ucla.edu:9696'));

var $ws = window.$ws = (window.$ws || (function(){
  function WS(){
    var self = this;
    return function connect(uri){
      self.ws = new WebSocket((uri || 'ws://e.ws.ndn.ucla.edu:9696'));
      return {
        ws: self.ws,
        ready: self.connected,
        send: self.send,
        emit: self.emit,
        sendBinary: self.sendBinary,
        on: self.on,
        settings: self.settings
      };
    };
  };
  
  WS.prototype = (function(){
    var self, sendCallback = {};
    
    /**
     * PRIVATE METHODS
     */
    var util = (function(){
      var timestamp = (new Date).getTime();
      
      var promise = (function(){
        var promises = promises || [];
        function mise(promise){ // pro.mise() (promise it)
          promises.push(promise);
          return promises;
        };
        function gress(key, callback){ // pro.gress() (progress to)
          promises.forEach(function(it, i, a){
            (it.event === key) && callback(it); //
          });
        };
        
        return {
          promises: promises,
          mise: mise,
          gress: gress
        };
      })();
      
      function messageBridge(creds){
        var promise = {}, creds = creds, data = creds.data, event = creds.event;
        
        (creds.action === 'send') && (function(){
        
          (event === 'message') && (function(){
            data = JSON.stringify(data);
          }())
          ||
          (event !== 'message') && (function(){
            data = JSON.stringify({_data: data, _event: event});
          }());
          
        }())
        ||
        ((creds.action === 'receive') && (function(){
          var raw = data
            , event = 'message'
            , cons = data.data.constructor
            , msg = (cons !== ArrayBuffer && cons !== Uint8Array && cons !== Blob) && JSON.parse(raw.data) || data.data;
          
          (msg.constructor === Object) && (function(){
            event = ((msg._event) && msg._event) || event;
            msg = ((msg._data) && msg._data) || msg;
          }());
          
          util.pro.gress(event, function(_promise){
            _promise.data = msg, _promise.raw = raw, _promise.event = event; promise = _promise;
          });
          
        }()));
        
        return {
          data: data, // for emit
          promise: promise // for onmessage
        };
      };
      
      return {
        ts: timestamp,
        pro: promise,
        msgBridge: messageBridge
      };
    })();
    
    /**
     * PUBLIC METHODS
     */
    function connected(callback){
      self = this; // this changes in event callbacks, preserve now.
      this.ws.onopen = function(e){
        console.log('WebSocket Connection Made. Event:', e);
        callback(self, self.ws);
      };
      this.ws.onmessage = function(data){
        self.on({data: data});
      };
      
      return this;
    };
    
    function sendBinary(binary, binaryType){
      this.ws.binaryType = (binaryType && binaryType) || 'arraybuffer';
      this.ws.send(binary);
    };
    
    function send(data, callback){
      if(!data) throw new Error('Error: no data exists to send.');
      (data && callback) && this.emit('message', data, callback);
      (!callback) && this.emit('message', data);
      
      return this;
    };
    
    function emit(event, data, callback){
      if(!data || data.constructor === Function) throw new Error("Error: data-parameter is absent or is a function.");
      var formattedData = (data) && util.msgBridge({action: 'send', data: data,event: event}).data;
      
      this.ws.send(formattedData);
      console.log('message sent...');
      (callback && callback(true));
      
      return this;
    };
    
    function on(event, callback){
      var promise, promises;
      
      (event.constructor === String && callback) && (function(){
        promises = util.pro.mise({event: event, callback: callback});
      }())
      ||
      (event.constructor === Object && !callback) && (function(){
        promise = util.msgBridge({action: 'receive', data: event.data}).promise;
        (promise.callback) && promise.callback(promise.data, promise.raw, promise);
      }())
      ||
      (
        (event.constructor === ArrayBuffer || event.constructor === Uint8Array)
        &&
        !callback
      ) && (function(){
        promise = util.msgBridge({action: 'receive', data: event.data}).promise;
        (promise.callback) && promise.callback(promise.data, promise.raw, promise);
      }());
      
      return this;
    };
    
    function settings(opts){
      this.ws.binaryType = (opts.binaryType && opts.binaryType) || 'arraybuffer';
      console.log('settings changed', opts, this.ws);
      return this;
    };
    
    function gettings(){};
    
    function close(){
      console.log('close:', WS);
      return this;
    };
    
    return {
      connected: connected,
      send: send,
      emit: emit,
      sendBinary: sendBinary,
      on: on,
      settings: settings,
      get: gettings
    };
  })();
  
  return new WS();
})());

//implementation
function go(binaryInterest){

  /*$ws('ws://localhost:8080').ready(function($ws, ws){
  
    $ws.settings({binaryType: 'arraybuffer'});
    
    $ws.send('tonight at 9...')
      .send({msg: 'tonight at 9...'})
      .emit('news', {message: 'WARNING! Flash-flood!'})
      .emit('news', 'TORNADOW WARNING!');
    
    $ws.on('news', function(data){
        console.log('NEWS!', data, typeof data);
      }).on('message', function(data){
        console.log('MESSAGE!', data, typeof data);
      });
    
  }).settings({binaryType: 'blob'});*/
  
  $ws('ws://e.ws.ndn.ucla.edu:9696').ready(function($ws, ws){
    var bytearray = new Uint8Array(binaryInterest.length);
    bytearray.set(binaryInterest);
    
    $ws.on('message', function(data){
      console.log('CCNd RESULT:', data);
    });
    $ws.sendBinary(bytearray.buffer);
  });
  
};
