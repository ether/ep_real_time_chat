/***
*
* Responsible for negotiating messages between two clients
*
****/

var authorManager = require("../../src/node/db/AuthorManager"),
padMessageHandler = require("../../src/node/handler/PadMessageHandler"),
            async = require('../../src/node_modules/async');

var buffer = {};

/*
* Handle incoming messages from clients
*/
exports.handleMessage = async function(hook_name, context, callback){
  // Firstly ignore any request that aren't about chat
  var ischatMessage = false;
  if(context){
    if(context.message && context.message){
      if(context.message.type === 'COLLABROOM'){
        if(context.message.data){
          if(context.message.data.type){
            if(context.message.data.type === 'chat'){
              ischatMessage = true;
            }
          }
        }
      }
    }
  }

  if(!ischatMessage){
    callback(false);
    return false;
  }

  var message = context.message.data;
  /***
    What's available in a message?
     * action -- The action IE chatPosition
     * padId -- The padId of the pad both authors are on
     * targetAuthorId -- The Id of the author this user wants to talk to
     * message -- the actual message
     * myAuthorId -- The Id of the author who is trying to talk to the targetAuthorId
  ***/
  if(message.action === 'sendChatMessage'){
    var authorName = await authorManager.getAuthorName(message.myAuthorId); // Get the authorname

    var msg = {
      type: "COLLABROOM",
      data: {
        type: "CUSTOM",
        payload: {
          action: "recieveChatMessage",
          authorId: message.myAuthorId,
          authorName: authorName,
          padId: message.padId,
          message: message.message
        }
      }
    }
    sendToRoom(message, msg);
  }

  if(ischatMessage === true){
    callback([null]);
  }else{
    callback(true);
  }
}


function sendToRoom(message, msg){
  var bufferAllows = true; // Todo write some buffer handling for protection and to stop DDoS -- myAuthorId exists in message.
  if(bufferAllows){
    setTimeout(function(){ // This is bad..  We have to do it because ACE hasn't redrawn by the time the chat has arrived
      padMessageHandler.handleCustomObjectMessage(msg, false, function(){
        // TODO: Error handling.
      })
    }
    , 100);
  }
}
