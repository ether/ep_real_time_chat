![Publish Status](https://github.com/ether/ep_real_time_chat/workflows/Node.js%20Package/badge.svg) [![Backend Tests Status](https://github.com/ether/ep_real_time_chat/actions/workflows/test-and-release.yml/badge.svg)](https://github.com/ether/ep_real_time_chat/actions/workflows/test-and-release.yml)

# ep_real_time_chat
Etherpad plugin to send real time chat updates

## Configuring

Add the below settings to settings.json or throught the settings UI
```
  "ep_real_time_chat":{
    "realTimeChatOnByDefault":true,
    "forceRealTimeChat": true
  }
```

It should be obvious what they do..

## Installation

Install from the Etherpad admin UI (**Admin → Manage Plugins**,
search for `ep_real_time_chat` and click *Install*), or from the Etherpad
root directory:

```sh
pnpm run plugins install ep_real_time_chat
```

> ⚠️ Don't run `npm i` / `npm install` yourself from the Etherpad
> source tree — Etherpad tracks installed plugins through its own
> plugin-manager, and hand-editing `package.json` can leave the
> server unable to start.

After installing, restart Etherpad.
