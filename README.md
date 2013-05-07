sawKit-client
=============

This WebSocket library allows one to emit and receive WebSocket events/messages.

Unlike Socket.io and other libraries, sawKit-client (or rather "$ws-client") allows for a JSON.parsable message-object to be universally compatible between front and back-end libraries; this allows for the message to still be sent by the client and received by server - it just requires that the server JSON.parses the message to look for an "_event" property (which describes the event/emission from client) and a "_data" property which contains the data sent from the client. A sister library, sawKit-node, already has the on-event-emit functionality already built in.

**Quick-Start**

        $ws('ws://localhost:8080').ready(function($ws, ws){
        
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
          
        }).settings({binaryType: 'blob'});
        
        
        $ws('ws://e.ws.ndn.ucla.edu:9696').ready(function($ws, ws){
          
          var bytearray = new Uint8Array(binaryInterest.length);
          bytearray.set(binaryInterest);
          
          $ws.on('message', function(data){
            console.log('CCNd RESULT:', data, data.constructor);
          });
          $ws.sendBinary(bytearray.buffer);
          
        });


**METHODS**

***$ws()***
`$ws` is a MONADic method which instatiates a `new` object for API use. 

***.ready()***
`.ready`, or onReady chains to the end of the `$ws()` MONAD (not to be confused with the `$ws` NameSpace). The onReady event is just a wrapper around the HTML5 WebSocket-spec's onconnection event. It takes a callback as its only argument and passes in two arguments to the callbak when a connection to a backend source is successful:

        $ws('ws://localhost:8080').ready(function($ws, ws){
          // callback code goes here eg:
          $ws.sendBinary(MyUint8Array.buffer);
        });

The onReady callback passes two objects and returns `this`: `$ws` and `ws`. `$ws` is a `new` instance of the APIs handle for the websocket at hand (`localhost:8080`), while `ws` is an instance of the `new $ws`'s websocket instance.

OnReady returns `this` for the sake of method chaining - meaning, is is possible to use ALL other methods my chaining them to the onReady event:

        $ws('ws://localhost:8080')
          .ready(function($ws, ws){
            // lets set the binaryType back to 'arrayuffer'
            // html5 websocket binaryType is 'blob' by default
            $ws.settings({binaryType: 'arraybuffer'});
          })
          .settings({binaryType: 'blob'})
          .send('hello')                  // this MAY fail as the websocket may not be ready yet.
          .on('world', function(){
            // be a steward of information, ride the wave of data.
          });

***.send()***

`.send()`

***.sendBinary()***

`.sendBinary()`

***.emit()***

`.emit()`

***.on()***

`.on()`

***.settings()***

`.settings()` takes an Object-Literal with the following settings:
1. binaryType - sets the WebSocket's binaryType property

Example: `$ws('ws://localhost:8080').settings({binaryType: 'arraybuffer'});`

***.get()***

`.settings()` currently not implemented :-(

**TODO**

Make each MONAD (`$('url.com:8080')`) return a unique object from class so that connections can be made to multiple servers without errors.

 



