exports.postAceInit = function(hook_name, args, cb) {
  enable();
};

exports.getAuthorClassName = function(author)
{
  return "ep_real_time_chat-" + author.replace(/[^a-y0-9]/g, function(c)
  {
    if (c == ".") return "-";
    return 'z' + c.charCodeAt(0) + 'z';
  });
}

exports.className2Author = function(className)
{
  if (className.substring(0, 15) == "ep_real_time_chat-")
  {
    return className.substring(15).replace(/[a-y0-9]+|-|z.+?z/g, function(cc)
    {
      if (cc == '-') return '.';
      else if (cc.charAt(0) == 'z')
      {
        return String.fromCharCode(Number(cc.slice(1, -1)));
      }
      else
      {
        return cc;
      }
    });
  }
  return null;
}

exports.handleClientMessage_CUSTOM = function(hook, context, cb){
  var action = context.payload.action;
  var padId = context.payload.padId;
  var authorId = context.payload.authorId;
  var message = context.payload.message;
  var authorName = context.payload.authorName;
  var authorClass = exports.getAuthorClassName(authorId);

  if(pad.getUserId() === authorId) return false; // Dont process our own caret position (yes we do get it..) -- This is not a bug

  if(action === 'recieveChatMessage'){ // an author has sent this client a chat position, we need to show it in the dom

    var authorName = decodeURI(escape(context.payload.authorName));
    if(authorName == "null"){
      var authorName = "Anonymous" // If the users username isn't set then display a smiley face
    }
    $('.authorChatMessage-'+authorClass).remove();
    var html = '<p class="authorChatMessage-'+authorClass+'" id="authorChatMessage-' +authorClass+ '">' + authorName + ': ' + message + '</p>'
    if( $('.authorChatMessage-'+authorClass).length === 0 ){ // if a container doesnt exist for this author yet
      $('#chattext').append(html); // create new html
    }else{
      $('.authorChatMessage-'+authorClass).html(html); // update html value
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
  //console.log("sent", message);
  pad.collabClient.sendMessage(message);  // Send the chat position message to the server
}

function enable(){
  $('#chattext').css("top", "45px");
  $('#titlebar').append("<span style='padding:5px;float:left;'><input type=checkbox id='enableRealTimeChat'>&nbsp;<label for=enableRealTimeChat>Send Real Time Chat Updates</label></span>");

  $('#enableRealTimeChat').click(function(){
    
  });

  $('#chatinput').keyup(function(){
    sendChat();
  });
}
