module.exports = class CommandContext {
  constructor(options = {}) {
    this.client = options.client;

    this.command = options.command;
    this.message = options.message;
    this.args = options.args;

    this.prefix = options.prefix;

    this.author = this.message.author;
    this.guild = this.message.guild;
  }
};