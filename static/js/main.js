'use strict';

exports.postAceInit = (hookName, args, cb) => {
  // if the url param is set
  const urlContainsRealTimeChatTrue = (getParam('realTimeChat') === 'true');
  if (urlContainsRealTimeChatTrue) {
    clientVars.realTimeChatOnByDefault = true;
    clientVars.forceRealTimeChat = true;
  }
  if (getParam('realTimeChat') === 'false') {
    clientVars.realTimeChatOnByDefault = false;
    clientVars.forceRealTimeChat = false;
    $('#enableRealTimeChat').attr('checked', false);
  }

  // Write the settings checkbox to the UI
  $('#chattext').css('top', '45px');
  if ($('#enableRealTimeChat').length !== 0) return; // don't continue if we're already rendered
  $('#titlelabel').after()
      .append(`&nbsp; || &nbsp;<input type=checkbox id='enableRealTimeChat'>
      <label title='Enable / Disable sending real time chat messages'
      for=enableRealTimeChat>Real Time</label>`);

  $('#enableRealTimeChat').click(() => {
    $('#chatinput').focus();
  });

  // Listen for key ups in the chat input box
  $('body').on('keyup', '#chatinput', () => {
    if ($('#enableRealTimeChat').is(':checked')) {
      sendChat();
    }
  });

  if (clientVars.realTimeChatOnByDefault === true) {
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

exports.handleClientMessage_CUSTOM = (hookName, context, cb) => {
  const action = context.payload.action;
  const authorId = context.payload.authorId;
  const message = context.payload.message;
  let authorName = context.payload.authorName;
  const authorClass = exports.getAuthorClassName(authorId);
  if (!authorClass) return;
  const authorClassCSS = authorClass.replace('ep_real_time_chat', 'author');

  // Dont process our own caret position (yes we do get it..) -- This is not a bug
  if (pad.getUserId() === authorId) return false;

  // an author has sent this client a chat message update, we need to show it in the dom
  if (action === 'recieveChatMessage') {
    authorName = decodeURI(escape(context.payload.authorName));
    if (authorName === 'null') {
      authorName = 'Anonymous'; // If the users username isn't set then display a smiley face
    }
    $(`#authorChatMessage-${authorClass}`).remove();
    const chatHtml = $('<p>').attr({
      class: authorClassCSS,
      id: `authorChatMessage-${authorClass}`,
    }).append(
        $('<b>').text(authorName))
        .append(document.createTextNode(`: ${message}...`));
    // if a container doesnt exist for this author yet
    if ($(`#authorChatMessage-${authorClass}`).length === 0) {
      if (message) {
        $('#chattext').append(chatHtml); // create new html
        parent.chat.scrollDown();
      }
    } else if (message) {
      $(`#authorChatMessage-${authorClass}`).empty().append(chatHtml); // update html value
      parent.chat.scrollDown();
    } else {
      $(`#authorChatMessage-${authorClass}`).remove();
    }
  }
};

const sendChat = () => {
  const myAuthorId = pad.getUserId();
  const padId = pad.getPadId();
  const messageV = $('#chatinput').val();
  // Send chat message to send to the server
  const message = {
    type: 'chat',
    action: 'sendChatMessage',
    message: messageV,
    padId,
    myAuthorId,
  };
  pad.collabClient.sendMessage(message); // Send the chat position message to the server
};

const getParam = (sname) => {
  let params = location.search.substr(location.search.indexOf('?') + 1);
  let sval = '';
  params = params.split('&');
  // split param and value into individual pieces
  for (let i = 0; i < params.length; i++) {
    const temp = params[i].split('=');
    if ([temp[0]] === sname) { sval = temp[1]; }
  }
  return sval;
};
