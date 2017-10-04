const Bot = require('./Bot.js');
      kagi = require('kagi');

const bot = new Bot();

bot.login(kagi.getChain('cortana.chn').getLink('cortana').data.token);