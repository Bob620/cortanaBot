const EventEmitter = require('events');

const Discord = require('discord.js'),
      moment = require('moment-timezone'),
      Random = require('random-js');

const random = new Random(Random.engines.mt19937().autoSeed());

/** Events
 * guildBanAdd
 * guildBanRemove
 * guildMemberAdd
 * guildMemberRemove
 * channelCreate
 * channelDelete
 * channelUpdate
 * emojiCreate
 * emojiDelete
 * roleCreate
 * roleDelete
 */

/** SimpleStore
 * prefix
 * guild -> logChannel id match
 */

simpleStore = {
  guilds: {
    '161183834010943488': {
      prefix: '*',      
      logChannel: '364959277586055168',
      events: ['guildMemberAdd', 'guildMemberRemove', 'guildBanAdd', 'guildBanRemove']
    },
    '308270660889739268': {
      prefix: '*',
      logChannel: '310571392049348610',
      events: ['guildMemberAdd', 'guildMemberRemove', 'guildBanAdd', 'guildBanRemove']
    }
  },
  colors: {
    guildBanAdd: '15466496',
    guildBanRemove: '12779520',
    guildMemberAdd: '34303',
    guildMemberRemove: '157377'
  },
  countries: [
    'America/Thule',
    'America/New_York',
    'Asia/Tokyo',
    'Australia/Sydney',
    'America/Los_Angeles',
    'Europe/London',
    'Antarctica/Macquarie',
    'America/Inuvik'
  ],
  timeFormats: [
    'dddd',
    'dddd Do',
    'dddd DDDo of the year YYYY',
    'It\'s currently h:m:s',
    'It\'s currently k:m:s',
    'It\'s currently h:m:s:SSSS',
    'It\'s currently k:m:s:SSSS',
    'It\'s currently h:m:s Z',
    'It\'s currently k:m:s Z',
    'It\'s currently h:m:s:SSSS ZZ',
    'It\'s currently k:m:s:SSSS ZZ',
    'It\'s currently x'
  ]
}

class Bot extends EventEmitter {
  constructor() {
    super();

    this.botStatus = 'disconnected';
    this.client = new Discord.Client();
    this.banSuppress = [];

    this.client.on('ready', () => {
      this.updateStatus('connected');
    }).on('disconnect', () => {
      this.updateStatus('disconnected');
    }).on('reconnecting', () => {
      this.updateStatus('reconnecting');
    }).on('resume', () => {
      this.updateStatus('connected');
    });

    this.client.on('message', async (message) => {
      try {
        const content = message.cleanContent.toLowerCase();
        const prefix = simpleStore.guilds[message.guild].prefix;
        
        console.log(this.heyMessage(content.slice(11), message));

        if (content.startsWith('hey cortana')) {
          console.log(this.heyMessage(content.slice(11), message));
          message.reply(await this.heyMessage(content.slice(11), message));
        } else if (content.startsWith(prefix)) {
          this.commandMessage(content.slice(prefix.length), message);
        }
      } catch(err) {
        console.log(err);
      }
    });

    this.client.on('guildBanAdd', async (guild, user) => {
      try {
        const logChannel = await this.getLogChannelForEvent(guild, 'guildBanAdd');

        this.banSuppress.push(user.id);
        
        logChannel.send({embed: {
          description: `The user was banned at ${new Date().toUTCString()}`,
          color: simpleStore.colors.guildBanAdd,
          title: `${user.username}#${user.discriminator} (${user.id}) Banned`,
          thumbnail: {url: user.avatarURL}
        }});
      } catch(err) {}
    }).on('guildBanRemove', async (guild, user) => {
      try {
        const logChannel = await this.getLogChannelForEvent(guild, 'guildBanRemove');
        
        logChannel.send({embed: {
          description: `The user was unbanned at ${new Date().toUTCString()}`,
          color: simpleStore.colors.guildBanRemove,
          title: `${user.username}#${user.discriminator} (${user.id}) Unbanned`,
          thumbnail: {url: user.avatarURL}
        }});
      } catch(err) {}
    }).on('guildMemberAdd', async (member) => {
      try {
        const logChannel = await this.getLogChannelForEvent(member.guild, 'guildMemberAdd');
        
        logChannel.send({embed: {
          description: `A new member joined at ${new Date().toUTCString()}`,
          color: simpleStore.colors.guildMemberAdd,
          title: `${member.user.username}#${member.user.discriminator} (${member.id}) joined`,
          thumbnail: {url: member.user.avatarURL}
        }});
      } catch(err) {}
    }).on('guildMemberRemove', async (member) => {
      try {
        const logChannel = await this.getLogChannelForEvent(member.guild, 'guildMemberRemove');

        if (this.banSuppress.includes(member.id)) {
          this.banSuppress.splice(this.banSuppress.indexOf(member.id), 1);
        } else {
          logChannel.send({embed: {
            description: `A member left at ${new Date().toUTCString()}`,
            color: simpleStore.colors.guildMemberRemove,
            title: `${member.user.username}#${member.user.discriminator} (${member.id}) left`,
            thumbnail: {url: member.user.avatarURL}
          }});
        }
      } catch(err) {}
    }).on('channelCreate', async (channel) => {
      try {
        const logChannel = await this.getLogChannelForEvent(channel.guild, 'channelCreate');

        logChannel.send({embed: {
          description: `A channel was created at ${new Date().toUTCString()}`,
          color: simpleStore.colors.channelCreate,
          title: `${channel.name} (${channel.id})`,
        }});
      } catch(err) {}
    }).on('channelDelete', async (channel) => {
      try {
        const logChannel = await this.getLogChannelForEvent(channel.guild, 'channelDelete');

        logChannel.send({embed: {
          description: `A channel was deleted at ${new Date().toUTCString()}`,
          color: simpleStore.colors.channelDelete,
          title: `${channel.name} (${channel.id})`,
        }});
      } catch(err) {}
    }).on('channelUpdate', async (oldChannel, newChannel) => {
      try {
//        const logChannel = await this.getLogChannelForEvent(oldChannel.guild, 'channelUpdate');
//
//        logChannel.send({embed: {
//          description: `A member left at ${new Date().toUTCString()}`,
//          color: simpleStore.colors.guildMemberRemove,
//          title: `${member.user.username}#${member.user.discriminator} (${member.id})`,
//        }});
      } catch(err) {}
    }).on('emojiCreate', async (emote) => {
      try {
        const logChannel = await this.getLogChannelForEvent(emote.guild, 'emojiCreate');

        logChannel.send({embed: {
          description: `A emoji was created at ${new Date().toUTCString()}`,
          color: simpleStore.colors.emojiCreate,
          title: `${emote.name} (${emote.id})`,
          thumbnail: {url: emote.url}
        }});
      } catch(err) {}
    }).on('emojiDelete', async (emote) => {
      try {
        const logChannel = await this.getLogChannelForEvent(emote.guild, 'emojiDelete');

        logChannel.send({embed: {
          description: `A emoji was deleted at ${new Date().toUTCString()}`,
          color: simpleStore.colors.emojiDelete,
          title: `${emote.name} (${emote.id})`,
          thumbnail: {url: emote.url}
        }});
      } catch(err) {}
    }).on('roleCreate', async (role) => {
      try {
        const logChannel = await this.getLogChannelForEvent(role.guild, 'roleCreate');

        logChannel.send({embed: {
          description: `A role was created at ${new Date().toUTCString()}`,
          color: simpleStore.colors.roleCreate,
          title: `${role.name} (${role.id})`,
        }});
      } catch(err) {}
    }).on('roleDelete', async (role) => {
      try {
        const logChannel = await this.getLogChannelForEvent(role.guild, 'roleDelete');

        logChannel.send({embed: {
          description: `A role was deleted at ${new Date().toUTCString()}`,
          color: simpleStore.colors.roleDelete,
          title: `${role.name} (${role.id})`,
        }});
      } catch(err) {}
    });
  }

  login(token) {
    this.client.login(token);
  }

  async getLogChannelForEvent(guild, event) {
    try {
      const guildInfo = simpleStore.guilds[guild.id];
      if (guildInfo.events.includes(event)) {
        return guild.channels.get(guildInfo.logChannel);
      }
      throw 'unwanted event for guild '+guild.id;
    } catch(err) {
      throw new Error('unable to get log channel of guild '+guild.id);
    }
  }

  async heyMessage(content, {guild, member}) {
    try {
      switch(content.trim()) {
        case 'what time is it':
        case 'what time is it?':
        case 'what is the time':
        case 'what is the time?':
          const country = simpleStore.countries[random.integer(0, simpleStore.countries.length)];
          const format = simpleStore.countries[random.integer(0, simpleStore.countries.length)];

          console.log(country);
          console.log(format);

          return `It is currently ${moment.tz(Date.now(), 'UTC').tz(country).format(format)}`;
          break;
        default:
          console.log('rip');
          break;
      }
    } catch(err) {
      console.log(err);
      throw err;
    }
  }

  async commandMessage(content) {

  }

  updateStatus(newStatus) {
    this.botStatus = newStatus;
    this.emit('status', this.status);
  }

  get status() {
    return this.botStatus;
  }
  set status(bleh) {}

}

module.exports = Bot;