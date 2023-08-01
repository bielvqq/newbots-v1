const { Client, Collection, Message } = require('discord.js');
const klaw = require('klaw');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(require('fs').readdir);
const modal = require('discord-modals');

module.exports = class Farth extends Client {
  constructor() {
    super({
      intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_VOICE_STATES', 'GUILD_SCHEDULED_EVENTS'],
      partials: ['MESSAGE', 'CHANNEL'],
      allowedMentions: { parse: ['users', 'roles'], repliedUser: true },
      failIfNotExists: false
    });

    this.commands = new Collection();
    this.subcommands = new Collection();

    this.aliases = new Collection();
    this.database = new Collection();

    this.cooldowns = new Map();
  }

  load(commandPath, commandName) {
    const props = new (require(`${commandPath}/${commandName}`))(this);
    if (props.subcommand) {
      if (!this.subcommands.get(props.reference)) {
        this.subcommands.set(props.reference, new Collection());
      }
      this.subcommands.get(props.reference).set(props.name, props);
    }
    if (props.subcommand) return;
    props.location = commandPath;

    if (props.init) {
      props.init(this);
    }

    this.commands.set(props.name, props);
    props.aliases.forEach(aliases => {
      this.aliases.set(aliases, props.name);
    });
    return false;
  }

  login() {
    super.login(process.env.TOKEN);
  }

  async onLoad() {
    this.login();
    modal(this);

    klaw('src/commands').on('data', item => {
      const cmdFile = path.parse(item.path);
      if (!cmdFile.ext || cmdFile.ext !== '.js') return;
      const response = this.load(cmdFile.dir, `${cmdFile.name}${cmdFile.ext}`);
      if (response) return;
    });

    const eventFiles = await readdir(`./src/functions/`);
    eventFiles.forEach(file => {
      const eventName = file.split('.')[0];
      const event = new (require(`./functions/${file}`))(this);
      this.on(eventName, (...args) => event.run(...args));
      delete require.cache[require.resolve(`./functions/${file}`)];
    });
  }
};

// DADOS DA DATABASE
const firebase = require("firebase");
const Firebase = require("../firebase.json");
const dbmdk = {
  apiKey: Firebase.apiKey,
  databaseURL: Firebase.databaseURL
};

firebase.initializeApp(dbmdk);