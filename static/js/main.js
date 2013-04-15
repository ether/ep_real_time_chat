exports.postAceInit = function(hook_name, args, cb) {
  // Write the settings checkbox to the UI
  $('#chattext').css("top", "45px");
  $('#titlebar').append("<span style='padding:5px;float:left;'><input type=checkbox id='enableRealTimeChat'>&nbsp;<label for=enableRealTimeChat>Send Real Time Chat Updates</label></span>");

  $('#enableRealTimeChat').click(function(){
    $('#chatinput').focus();
  });

  // Listen for key ups in the chat input box
  $('#chatinput').keyup(function(){
    if($('#enableRealTimeChat').is(':checked')) {
      sendChat();
    }
  });
};

exports.getAuthorClassName = function(author)
{
  return "ep_real_time_chat-" + author.replace(/[^a-y0-9]/g, function(c)
  {
    if (c == ".") return "-";
    return 'z' + c.charCodeAt(0) + 'z';
  });
}

exports.handleClientMessage_CUSTOM = function(hook, context, cb){
  var action = context.payload.action;
  var padId = context.payload.padId;
  var authorId = context.payload.authorId;
  var message = context.payload.message;
  var authorName = context.payload.authorName;
  var authorClass = exports.getAuthorClassName(authorId);
  var authorClassCSS = authorClass.replace("ep_real_time_chat","author");

  if(pad.getUserId() === authorId) return false; // Dont process our own caret position (yes we do get it..) -- This is not a bug

  if(action === 'recieveChatMessage'){ // an author has sent this client a chat message update, we need to show it in the dom

    var authorName = decodeURI(escape(context.payload.authorName));
    if(authorName == "null"){
      var authorName = "Anonymous" // If the users username isn't set then display a smiley face
    }
    $('#authorChatMessage-'+authorClass).remove();
    var html = '<p class="'+authorClassCSS+'" id="authorChatMessage-' +authorClass+ '"><b>' + authorName + '</b>: ' + message + '...</p>'
    if( $('#authorChatMessage-'+authorClass).length === 0 ){ // if a container doesnt exist for this author yet
      if(message){
        $('#chattext').append(html); // create new html
        parent.chat.scrollDown();
      }
    }else{
      if(message){
        $('#authorChatMessage-'+authorClass).html(html); // update html value
        parent.chat.scrollDown();
      }else{
        $('#authorChatMessage-'+authorClass).remove();
      } 
    }
  }
}

function sendChat(){
  var myAuthorId = pad.getUserId();
  var padId = pad.getPadId();
  var message = $('#chatinput').val();
  // Send chat message to send to the server
  var message = {
    type : 'chat',
    action : 'sendChatMessage',
    message : message,
    padId : padId,
    myAuthorId : myAuthorId
  }
  pad.collabClient.sendMessage(message);  // Send the chat position message to the server
}
