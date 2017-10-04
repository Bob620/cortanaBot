const EventEmitter = require('events');

const Discord = require('discord.js');

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
  }
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

    this.client.on('message', (message) => {

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
      
    }).on('channelDelete', async (channel) => {
      
    }).on('channelUpdate', async (oldChannel, newChannel) => {
      
    }).on('emojiCreate', async (emote) => {
      
    }).on('emojiDelete', async (emote) => {
      
    }).on('roleCreate', async (role) => {
      
    }).on('roleDelete', async (role) => {
      
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