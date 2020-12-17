'use strict';

/** *
*
* Responsible for negotiating messages between two clients
*
****/

const authorManager = require('ep_etherpad-lite/node/db/AuthorManager');
const padMessageHandler = require('ep_etherpad-lite/node/handler/PadMessageHandler');

const sendToRoom = (message, msg) => {
  // Todo write some buffer handling for protection and to stop DDoS
  // This is bad..  We have to do it because ACE hasn't redrawn by the time the chat has arrived
  setTimeout(() => {
    padMessageHandler.handleCustomObjectMessage(msg, false, () => {
      // TODO: Error handling.
    });
  }
  , 100);
};

/*
* Handle incoming messages from clients
*/
exports.handleMessage = async (hookName, context) => {
  // Firstly ignore any request that aren't about chat
  let ischatMessage = false;
  if (context) {
    if (context.message && context.message) {
      if (context.message.type === 'COLLABROOM') {
        if (context.message.data) {
          if (context.message.data.type) {
            if (context.message.data.type === 'chat') {
              ischatMessage = true;
            }
          }
        }
      }
    }
  }

  if (!ischatMessage) {
    return false;
  }

  const message = context.message.data;
  /** *
    What's available in a message?
     * action -- The action IE chatPosition
     * padId -- The padId of the pad both authors are on
     * targetAuthorId -- The Id of the author this user wants to talk to
     * message -- the actual message
     * myAuthorId -- The Id of the author who is trying to talk to the targetAuthorId
  ***/
  if (message.action === 'sendChatMessage') {
    let authorName = await authorManager.getAuthorName(message.myAuthorId); // Get the authorname
    if (!authorName) authorName = 'Anonymous';
    const msg = {
      type: 'COLLABROOM',
      data: {
        type: 'CUSTOM',
        payload: {
          action: 'recieveChatMessage',
          authorId: message.myAuthorId,
          authorName,
          padId: message.padId,
          message: message.message,
        },
      },
    };
    sendToRoom(message, msg);
  }

  if (ischatMessage === true) {
    return null;
  } else {
    return true;
  }
};
