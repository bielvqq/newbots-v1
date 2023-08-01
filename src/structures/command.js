const { MessageEmbed } = require('discord.js');

module.exports = class Command {
  constructor(options = {}, client) {
    this.client = client;

    this.name = options.name;
    this.aliases = options.aliases || [];

    this.category = options.category;
    this.description = options.description || '';
    this.usage = options.usage || '';

    this.options = options.options;

    this.reference = options.reference || '';
    this.subcommand = options.subcommand || false;
  }

  async executeCMD(context) {
    try {
      await this.run(context);
    } catch (error) {
      await this.errorCommand(context, error);
      console.log(error);
    }
  }

  async errorCommand({ message, author, command }, error) {
    const EMBED = new MessageEmbed()
      .setDescription(`<:done:1053297806359662673> Um erro foi encontrado, reporte para um Administrador.`)
      .addFields(
        {
          name: `Comando:`,
          value: command.name,
          inline: true
        },
        {
          name: `Usado por:`,
          value: author.tag,
          inline: true
        },
        {
          name: `Mensagem de Erro:`,
          value: `\`\`\`${error.message}\`\`\``
        }
      )
      .setColor(`a700d7`);

    return message.reply({ embeds: [EMBED] });
  }
};