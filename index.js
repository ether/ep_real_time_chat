var settings = require('ep_etherpad-lite/node/utils/Settings');

exports.clientVars = function(hook, context, callback){
  var realTimeChatOnByDefault;
  var forceRealTimeChat;
  try {
    if (settings.ep_real_time_chat){
       realTimeChatOnByDefault = settings.ep_real_time_chat.realTimeChatOnByDefault;
       forceRealTimeChat = settings.ep_real_time_chat.forceRealTimeChat;
    }
  } catch (e){
    realTimeChatOnByDefault = "";
    forceRealTimeChat = false;
  }
  return callback({
    "realTimeChatOnByDefault": realTimeChatOnByDefault,
    "forceRealTimeChat": forceRealTimeChat
  });
};
