# Giveaway Bot

🎁 Giveway Bot with slash commands made using the [givify](https://npmjs.com/givify) package!

## Features

* `/start-giveaway` command
* `/end-giveaway` command
* `/reroll-giveaway` command
* `/pause-giveaway` command
* `/unpause-giveaway` command
* `/drop-giveaway` command

<a href="https://zupimages.net/viewer.php?id=23/01/9b7r.png">
    <img src="https://zupimages.net/up/23/01/9b7r.png" style="width: 80%"/>
</a>


## Installation

* Clone the repository (Or download it manually):
```sh
git clone https://github.com/unf6/givify-bot
```

* Fill the configuration file (config.json):
```json
{
    "token": "Your Discord bot token",
    "everyoneMention": false,
    "hostedBy": true,
    "guildId": "Your server id"
}
```

* Install required dependencies (Execute below command in bot's root directory):
```sh
npm install
```

* Run the bot:
```sh
node index.js
```
