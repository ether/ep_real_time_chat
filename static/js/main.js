'use strict';

exports.postAceInit = function (hook_name, args, cb) {
  let urlContainsRealTimeChatTrue = (getParam('realTimeChat') == 'true'); // if the url param is set
  if (urlContainsRealTimeChatTrue) {
    clientVars.realTimeChatOnByDefault = true;
    clientVars.forceRealTimeChat = true;
  }
  if (getParam('realTimeChat') == 'false') {
    clientVars.realTimeChatOnByDefault = false;
    clientVars.forceRealTimeChat = false;
    $('#enableRealTimeChat').attr('checked', false);
  }

  // Write the settings checkbox to the UI
  $('#chattext').css('top', '45px');
  if ($('#enableRealTimeChat').length !== 0) return; // don't continue if we're already rendered
  $('#titlelabel').after().append("&nbsp; || &nbsp;<input type=checkbox id='enableRealTimeChat'><label title='Enable / Disable sending real time chat messages' for=enableRealTimeChat>Real Time</label>");

  $('#enableRealTimeChat').click(()=> {
    $('#chatinput').focus();
  });

  // Listen for key ups in the chat input box
  $('body').on('keyup', '#chatinput', ()=> {
    if ($('#enableRealTimeChat').is(':checked')) {
      sendChat();
    }
  });

  if (clientVars.realTimeChatOnByDefault == true) {
    $('#enableRealTimeChat').attr('checked', true);
    $('#enableRealTimeChat').prop('check', true);
    if (clientVars.forceRealTimeChat) {
      $('#chattext').css('top', '25px');
      $('#enableRealTimeChat').parent().hide();
    }
  }
};


exports.getAuthorClassName = (author) => {
  if (!author) return false;
  const authorId = author.replace(/[^a-y0-9]/g, (c) => {
    if (c === '.') return '-';
    return `z${c.charCodeAt(0)}z`;
  });
  return `ep_real_time_chat-${authorId}`;
};

exports.handleClientMessage_CUSTOM = function (hook, context, cb) {
  let action = context.payload.action;
  let padId = context.payload.padId;
  let authorId = context.payload.authorId;
  let message = context.payload.message;
  var authorName = context.payload.authorName;
  let authorClass = exports.getAuthorClassName(authorId);
  if (!authorClass) return;
  let authorClassCSS = authorClass.replace('ep_real_time_chat', "author");

  if (pad.getUserId() === authorId) return false; // Dont process our own caret position (yes we do get it..) -- This is not a bug

  if (action === 'recieveChatMessage') { // an author has sent this client a chat message update, we need to show it in the dom
    var authorName = decodeURI(escape(context.payload.authorName));
    if (authorName == 'null') {
      var authorName = 'Anonymous' // If the users username isn't set then display a smiley face
    }
    $(`#authorChatMessage-${authorClass}`).remove();
    let chatHtml = $('<p>').attr({
      class: authorClassCSS,
      id: `authorChatMessage-${  authorClass}`,
    }).append(
        $('<b>').text(authorName),
    ).append(document.createTextNode(`: ${  message  }...`));
    if ($(`#authorChatMessage-${authorClass}`).length === 0) { // if a container doesnt exist for this author yet
      if (message) {
        $('#chattext').append(chatHtml); // create new html
        parent.chat.scrollDown();
      }
    } else {
      if (message) {
        $(`#authorChatMessage-${authorClass}`).empty().append(chatHtml); // update html value
        parent.chat.scrollDown();
      } else {
        $(`#authorChatMessage-${authorClass}`).remove();
      }
    }
  }
};

function sendChat() {
  let myAuthorId = pad.getUserId();
  let padId = pad.getPadId();
  var message = $('#chatinput').val();
  // Send chat message to send to the server
  var message = {
    type: 'chat',
    action: 'sendChatMessage',
    message,
    padId,
    myAuthorId
  };
  pad.collabClient.sendMessage(message); // Send the chat position message to the server
}

function getParam(sname) {
  let params = location.search.substr(location.search.indexOf('?') + 1);
  let sval = '';
  params = params.split('&');
  // split param and value into individual pieces
  for (let i = 0; i < params.length; i++) {
    temp = params[i].split('=');
    if ([temp[0]] == sname) { sval = temp[1]; }
  }
  return sval;
}
