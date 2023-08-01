const CommandContext = require('../structures/commandcontext');
const firebase = require("firebase");
const fetch = require("node-fetch");
const fs = require("fs");
const Canvas = require('canvas')

const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Util, MessageAttachment } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');

const emojis = require('../../emojis.json');
const imgur = require('../../imgur.json');
const config = require('../../configuracoes.json');

const cooldowns = new Map();

module.exports = class interactionCreate {
  constructor(client) {
    this.client = client;
  }

  async run(interaction) {
    const database = firebase.database();

    var cliente = this.client;

    var Error = new MessageEmbed()
      .setAuthor({
        name: 'Sem permissão',
        iconURL: imgur.Cancelado,
        url: null
      })
      .setDescription(`Você não possui permissão para executar este processo.`)
      .setColor(config.COLOR)


    //////////////////////////////// COMANDOS ///////////////////////////////

    if (interaction.isCommand()) {
      if (!interaction.guild) return;
      const command = this.client.commands.get(interaction.commandName);

      interaction.author = interaction.user;

      const args = [];

      for (const option of interaction.options.data) {
        if (option.type === 'SUB_COMMAND_GROUP') {
          if (option.name) args.push(option.name);
          option.options?.forEach(x => {
            if (x.name) args.push(x.name);

            if (x.options[0]) args.push(x.options[0].value);
          });
        } else if (option.type === 'SUB_COMMAND') {
          if (option.name) args.push(option.name);
          option.options?.forEach(x => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }

      const message = interaction;

      const context = new CommandContext({
        client: this.client,
        message,
        args,
        author: message.author,
        interaction,
        command
      });

      command.executeCMD(context);
    }

    //////////////////////////////// COMANDOS GERAIS ///////////////////////////////

    if (interaction.commandName === 'painel') {
      if (interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "492846129382293537"
        && interaction.member.id !== "447147188120846345"
        && interaction.member.id !== "1073233249494642759") {
        interaction.reply({ embeds: [Error], ephemeral: true });
        return;
      }

      database
        .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
        .once("value", async snapshot => {

          if (snapshot.val().prefix) {
            var prefix = snapshot.val().prefix;
          } else {
            var prefix = ";";

            database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
              prefix: "/",
            });
          }

          const agora = new Date();
          const diffTime = snapshot.val().expirar - agora;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

          let PainelEmbed = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - ' + interaction.guild.name,
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\n**»** Expiração: \`${diffDays} dia(s), ${diffHours} hora(s) e ${diffMinutes} minuto(s)\`\nSistemas para configuração: \`15\`\nPrefixo: \`${prefix}\`` })
            .setColor(config.COLOR)

          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('fotobot')
                .setLabel('Alterar Avatar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('nomebot')
                .setLabel('Alterar Nickname')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('prefixo')
                .setLabel('Alterar Prefixo')
            )
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('listcomandos')
                .setLabel('Lista de Comandos')
            )

          const row = new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId('painelmenu')
              .setPlaceholder('Selecione um painel de configuração')
              .addOptions(
                {
                  label: `Sistema de Segurança`,
                  emoji: `${emojis.discordlogo}`,
                  description: `Painel de configuração do Sistema de Segurança.`,
                  value: `SegurancaP`
                },
                {
                  label: `Sistema de Primeira Dama`,
                  emoji: `${emojis.alianca}`,
                  description: `Painel de configuração do Sistema de Primeira Dama.`,
                  value: `PrimeiraDamaP`
                },
                {
                  label: `Sistema de Twitter`,
                  emoji: `${emojis.twitter}`,
                  description: `Painel de configuração do Sistema de Twitter.`,
                  value: `TwitterP`
                },
                {
                  label: `Sistema de Instagram`,
                  emoji: `${emojis.insta2}`,
                  description: `Painel de configuração do Sistema de Instagram.`,
                  value: `InstagramP`
                },
                {
                  label: `Sistema de Tellonym`,
                  emoji: `${emojis.tellonym}`,
                  description: `Painel de configuração do Sistema de Tellonym.`,
                  value: `TellonymP`
                },
                {
                  label: `Sistema de Seja Membro`,
                  emoji: `${emojis.group2}`,
                  description: `Painel de configuração do Sistema de Seja Membro.`,
                  value: `SejaMembroP`
                },
                {
                  label: `Sistema de Verificação`,
                  emoji: `${emojis.right}`,
                  description: `Painel de configuração do Sistema de Verificação.`,
                  value: `VerificacaoP`
                },
                {
                  label: `Sistema de Suporte`,
                  emoji: `${emojis.headset}`,
                  description: `Painel de configuração do Sistema de Suporte.`,
                  value: `SuporteP`
                },
                {
                  label: `Sistema de Influencer`,
                  emoji: `${emojis.coracao}`,
                  description: `Painel de configuração do Sistema de Influencer.`,
                  value: `InfluencerP`
                },
                {
                  label: `Sistema de Migração`,
                  emoji: `${emojis.etiq}`,
                  description: `Painel de configuração do Sistema de Migração.`,
                  value: `MigracaoP`
                },
                {
                  label: `Sistema de Registro`,
                  emoji: `${emojis.listverify}`,
                  description: `Painel de configuração do Sistema de Registro.`,
                  value: `RegistroP`
                },
                {
                  label: `Sistema de Prefixos`,
                  emoji: `${emojis.sound}`,
                  description: `Painel de configuração do Sistema de Prefixos.`,
                  value: `PrefixosP`
                },
                {
                  label: `Sistema de Contador`,
                  emoji: `${emojis.group3}`,
                  description: `Painel de configuração do Sistema de Contador.`,
                  value: `ContadorP`
                },
                {
                  label: `Sistema de Economia`,
                  emoji: `${emojis.trophy}`,
                  description: `Painel de configuração do Sistema de Economia.`,
                  value: `CarteirasP`
                },
                {
                  label: `Sistema de Blacklist`,
                  emoji: `${emojis.logverify}`,
                  description: `Painel de configuração do Sistema de Blacklist.`,
                  value: `BlacklistP`
                },
              )
          );

          interaction.reply({ embeds: [PainelEmbed], components: [row, row2] });
          return;
        });
    }

    if (interaction.commandName === 'carteira') {
      database
        .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
        .once("value")
        .then(async function (snapshot) {

          let usuario = interaction.guild.members.cache.get(interaction.user.id)

          if (!snapshot.val()) return interaction.reply({ embeds: [Error], ephemeral: true });

          if (!snapshot.val().cargo_moeda) return interaction.reply({ embeds: [Error], ephemeral: true });

          if (!usuario.roles.cache.has(snapshot.val().cargo_moeda) && !interaction.member.permissions.has(`ADMINISTRATOR`)) {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }

          let user = interaction.options.getUser('usuario') || interaction.user;

          database
            .ref(`Cash/Carteira/${user.id}`)
            .once("value", snapshot => {

              if (interaction.user.id === user.id) {

                if (!snapshot.val()) {
                  interaction.reply({ content: `> Você não possui uma carteira de moedas.`, ephemeral: true })
                  return;
                }

                let Moedas = new MessageEmbed()
                  .setAuthor({
                    name: 'Carteira de ' + interaction.user.username,
                    iconURL: imgur.Trofeu,
                    url: null
                  })
                  .setDescription(`**»** Seu saldo atual é de **${snapshot.val().carteira} moeda(s)**.`)
                  .setColor(config.COLOR)

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('enviar')
                    .setLabel('Transferência')
                    .setEmoji(`${emojis.transfer}`)
                )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('loja')
                      .setLabel('Shopping')
                      .setEmoji(`${emojis.shop}`)
                  )

                interaction.reply({ embeds: [Moedas], components: [row], ephemeral: true });
              } else {

                if (!snapshot.val()) {
                  interaction.reply({ content: `> ${user} não possui uma carteira de moedas.`, ephemeral: true })
                  return;
                }

                let Moedas = new MessageEmbed()
                  .setAuthor({
                    name: 'Carteira de ' + user.username,
                    iconURL: imgur.Trofeu,
                    url: null
                  })
                  .setDescription(`**»** ${user} possui **${snapshot.val().carteira} moeda(s)**.`)
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Moedas], ephemeral: true });
              }
            });
        });
    }

    if (interaction.commandName === 'blacklist') {
      database
        .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist/${interaction.user.id}`)
        .once("value")
        .then(async function (snap2) {

          if (!snap2.val() && interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "692407609814286468"
            && interaction.member.id !== "492846129382293537"
            && interaction.member.id !== "492846129382293537") {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }

          database
            .ref(`Servidores/${interaction.guild.id}/Blacklist`)
            .once("value", snapshot2 => {

              var counter3 = 0;

              snapshot2.forEach(v => {
                counter3++;
              });

              let PainelBlack = new MessageEmbed()
                .setAuthor({
                  name: 'Painel de Blacklist',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nUsuários em Blacklist: \`${counter3}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('addblack')
                  .setLabel('Adicionar Membro')
                  .setEmoji(`${emojis.right}`)
              )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('remblack')
                    .setLabel('Remover Membro')
                    .setEmoji(`${emojis.done}`)
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('listblack')
                    .setLabel('Listar Blacklist')
                    .setEmoji(`${emojis.listverify}`)
                )

              interaction.reply({ embeds: [PainelBlack], components: [row] });
            });
        });
    }

    //////////////////////////////// MENU DE SELEÇÕES ///////////////////////////////
    if (interaction.isSelectMenu()) {
      const { customId } = interaction;

      ///// MIGRAÇÃO (SISTEMA DE SELEÇÃO) /////

      if (customId === 'painelmigra') {

        if (interaction.values[0].includes('MigrarP')) {
          let textinput = new TextInputComponent()
            .setCustomId('migrarpessoas-input')
            .setLabel("QUANTIDADE DE PESSOAS")
            .setStyle('SHORT')
            .setMinLength(1)
            .setMaxLength(10)
            .setRequired(true)

          let textinput2 = new TextInputComponent()
            .setCustomId('migrarurl-input')
            .setLabel("URL DO SERVIDOR")
            .setStyle('SHORT')
            .setMinLength(1)
            .setMaxLength(30)
            .setRequired(true)

          const modal = new Modal()
            .setCustomId('migrariniciar-modal')
            .setTitle('SISTEMA DE MIGRAÇÃO')
            .addComponents([textinput, textinput2])

          showModal(modal, {
            client: this.client,
            interaction: interaction,
          });
        }

        if (interaction.values[0].includes('RecrutarP')) {
          let textinput = new TextInputComponent()
            .setCustomId('recrutarp-input')
            .setLabel("ESCREVA SUA ÁREA")
            .setStyle('SHORT')
            .setMinLength(1)
            .setMaxLength(30)
            .setRequired(true)

          const modal = new Modal()
            .setCustomId('recrutarp-modal')
            .setTitle('SISTEMA DE MIGRAÇÃO')
            .addComponents([textinput])

          showModal(modal, {
            client: this.client,
            interaction: interaction,
          });
        }

        if (interaction.values[0].includes('AreasP')) {
          var arr = [];

          database
            .ref(`Servidores/${interaction.guild.id}/Areas`)
            .once("value", async migra => {

              if (migra.val()) {
                migra.forEach(m => {
                  arr.push(
                    `${m.key}`
                  );
                });

                var areas = arr.join(`\n`)

                const Embed = new MessageEmbed()
                  .setAuthor({
                    name: 'Áreas - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields({ name: `${emojis.bol} Lista de áreas disponíveis:`, value: `${areas}` })
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Embed], ephemeral: true });

              } else {

                const Embed = new MessageEmbed()
                  .setAuthor({
                    name: 'Áreas - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields({ name: `${emojis.bol} Lista de áreas disponíveis:`, value: `Nenhuma área definida.` })
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Embed], ephemeral: true });

              }

            });
        }
      }

      /////////////////////////////////////////////////////////////////////


      ///// PAINEL GERAL (MENU DE SELEÇÕES) /////

      //// MIGRAÇÃO PAINEL
      if (customId === 'painelmenu') {
        if (!interaction.message.interaction) {
          if (interaction.message.mentions.users.first().id !== interaction.user.id) {
            interaction.reply({ embeds: [Error], ephemeral: true }).catch(err => { });
            return;
          }
        }

        if (!interaction.message.mentions.users.first()) {
          if (interaction.message.interaction.user.id !== interaction.user.id) {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }
        }

        if (interaction.values[0].includes('PrimeiraDamaP')) {
          let instagram = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - PRIMEIRA DAMA',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('inicio')
                .setLabel('Voltar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('cargopd')
                .setLabel('Configurar Cargo')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('limitepd')
                .setLabel('Configurar Limites')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('listconfig')
                .setLabel('Listar Configurações')
            )
            .addComponents(
              new MessageButton()
                .setStyle('DANGER')
                .setCustomId('resetarpd')
                .setLabel('Resetar Configurações')
            )

          interaction.update({ embeds: [instagram], components: [row] });
        }

        if (interaction.values[0].includes('InstagramP')) {
          let instagram = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - INSTAGRAM',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('PRIMARY')
              .setCustomId('inicio')
              .setLabel('Voltar')
          )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('instacanal')
                .setLabel('Configurar Canal')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('instamensagens')
                .setLabel('Configurar Mensagens')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('instainfluencer')
                .setLabel('Configurar Destaque')
            )

          interaction.update({ embeds: [instagram], components: [row] });
        }

        if (interaction.values[0].includes('SegurancaP')) {
          let Seguranca = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - SEGURANÇA',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nTempo definido para limpeza: \`10 minuto(s).\`` })
            .setColor(config.COLOR)

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('PRIMARY')
              .setCustomId('inicio')
              .setLabel('Voltar')
          )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('canalgeral')
                .setLabel('Limpeza de Segurança')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('canalgerallogs')
                .setLabel('Configurar Logs')
            )

          interaction.update({ embeds: [Seguranca], components: [row] });
        }

        if (interaction.values[0].includes('TwitterP')) {
          let twitter = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - TWITTER',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('PRIMARY')
              .setCustomId('inicio')
              .setLabel('Voltar')
          )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('twittercanal')
                .setLabel('Configurar Canal')
            )

          interaction.update({ embeds: [twitter], components: [row] });
        }

        if (interaction.values[0].includes('TellonymP')) {
          let tellonym = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - TELLONYM',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('inicio')
                .setLabel('Voltar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellomsg')
                .setLabel('Configurar Mensagem')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellobanner')
                .setLabel('Configurar Banner')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellobarrinha')
                .setLabel('Configurar Barrinha')
            )

          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('telloemoji')
                .setLabel('Configurar Reação')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellocanal')
                .setLabel('Configurar Canal')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellofiltro')
                .setLabel('Configurar Filtro')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('tellologs')
                .setLabel('Configurar Logs')
            )

          interaction.update({ embeds: [tellonym], components: [row, row2] });
        }

        if (interaction.values[0].includes('MigracaoP')) {
          let migracao = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - MIGRAÇÃO',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('inicio')
                .setLabel('Voltar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migracanal')
                .setLabel('Configurar Mensagem')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migrabanner')
                .setLabel('Configurar Banner')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('areasmigra')
                .setLabel('Configurar Áreas')
            )

          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migrafichas')
                .setLabel('Configurar Fichas')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migracategoria')
                .setLabel('Configurar Categoria')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migracargo')
                .setLabel('Configurar Cargo')
            )

          const row3 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('migralogs')
                .setLabel('Configurar Logs (Migração)')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('recrulogs')
                .setLabel('Configurar Logs (Recrutamento)')
            )

          interaction.update({ embeds: [migracao], components: [row, row2, row3] });
        }

        if (interaction.values[0].includes('InfluencerP')) {
          database
            .ref(`Servidores/${interaction.guild.id}/Influencer`)
            .once("value", snapshot2 => {

              var counter3 = 0;

              snapshot2.forEach(v => {
                counter3++;
              });

              let influencer = new MessageEmbed()
                .setAuthor({
                  name: 'Painel Geral - INFLUENCER',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nInfluencers postados: \`${counter3}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('PRIMARY')
                    .setCustomId('inicio')
                    .setLabel('Voltar')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('msginf')
                    .setLabel('Configurar Mensagem')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('canalinf')
                    .setLabel('Configurar Canal')
                )

              const row2 = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('cargoinf')
                    .setLabel('Configurar Cargo')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('cargoinfadm')
                    .setLabel('Configurar Cargo (ADM)')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('DANGER')
                    .setCustomId('reset1INF')
                    .setLabel('Resetar Influencers')
                )

              interaction.update({ embeds: [influencer], components: [row, row2] });
            });
        }

        if (interaction.values[0].includes('SuporteP')) {
          let suporte = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - SUPORTE',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('inicio')
                .setLabel('Voltar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('suportecanal')
                .setLabel('Configurar Mensagem')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('suportebanner')
                .setLabel('Configurar Banner')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('suportecargo')
                .setLabel('Configurar Cargo')
            )

          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('suportecategoria')
                .setLabel('Configurar Categoria')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('suportelogs')
                .setLabel('Configurar Logs')
            )

          interaction.update({ embeds: [suporte], components: [row, row2] });
        }

        if (interaction.values[0].includes('VerificacaoP')) {
          database
            .ref(`Servidores/${interaction.guild.id}/Verificados`)
            .once("value", snapshot => {

              var counter = 0;

              snapshot.forEach(v => {
                counter++;
              });

              let verificar = new MessageEmbed()
                .setAuthor({
                  name: 'Painel Geral - VERIFICAÇÃO',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nVerificados: \`${counter}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('PRIMARY')
                    .setCustomId('inicio')
                    .setLabel('Voltar')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarcanal')
                    .setLabel('Configurar Mensagem')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarbanner')
                    .setLabel('Configurar Banner')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarcargo')
                    .setLabel('Configurar Cargo')
                )

              const row2 = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarcargoadm')
                    .setLabel('Configurar Cargo (ADM)')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarcategoria')
                    .setLabel('Configurar Categoria')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('verificarlogs')
                    .setLabel('Configurar Logs')
                )

              interaction.update({ embeds: [verificar], components: [row, row2] });
            });
        }

        if (interaction.values[0].includes('SejaMembroP')) {
          database
            .ref(`Servidores/${interaction.guild.id}/SejaMembro`)
            .once("value", snapshot => {

              var counter = 0;

              snapshot.forEach(v => {
                counter++;
              });

              let sejamembro = new MessageEmbed()
                .setAuthor({
                  name: 'Painel Geral - SEJA MEMBRO',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nVerificados: \`${counter}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('PRIMARY')
                    .setCustomId('inicio')
                    .setLabel('Voltar')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('canalsejamembro')
                    .setLabel('Configurar Mensagem')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('sejamembrobanner')
                    .setLabel('Configurar Banner')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('sejamembrourl')
                    .setLabel('Configurar URL')
                )

              const row2 = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('sejamembrocargo')
                    .setLabel('Configurar Cargo')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('sejamembrologs')
                    .setLabel('Configurar Logs')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('listmembros')
                    .setLabel('Listar Verificados')
                )

              interaction.update({ embeds: [sejamembro], components: [row, row2] });
            });
        }

        if (interaction.values[0].includes('PrefixosP')) {
          let Prefixos = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - PREFIXOS',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nTempo de atualização: \`1 minuto\`` })
            .setColor(config.COLOR)

          const row = new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('PRIMARY')
              .setCustomId('inicio')
              .setLabel('Voltar')
          )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('canalprefixos')
                .setLabel('Configurar Mensagem')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('adicionarbot')
                .setLabel('Adicionar Bot')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('removerbot')
                .setLabel('Remover Bot')
            )

          const row2 = new MessageActionRow().addComponents(
            new MessageButton()
              .setStyle('DANGER')
              .setCustomId('resetprefixos')
              .setLabel('Resetar Prefixos')
          )

          interaction.update({ embeds: [Prefixos], components: [row, row2] });
        }

        if (interaction.values[0].includes('RegistroP')) {
          let Registro = new MessageEmbed()
            .setAuthor({
              name: 'Painel Geral - REGISTRO',
              iconURL: imgur.Cadeado,
              url: null
            })
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)` })
            .setColor(config.COLOR)

          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('PRIMARY')
                .setCustomId('inicio')
                .setLabel('Voltar')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('canalregistro')
                .setLabel('Configurar Mensagem')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('registrobanner')
                .setLabel('Configurar Banner')
            )

          const row2 = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('cargosregistro')
                .setLabel('Configurar Cargos')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('cargovisitante')
                .setLabel('Configurar Visitante')
            )
            .addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('registrologs')
                .setLabel('Configurar Logs')
            )

          interaction.update({ embeds: [Registro], components: [row, row2] });
        }

        if (interaction.values[0].includes('ContadorP')) {
          database
            .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
            .once("value", snapshot => {

              const msg = snapshot.val().msgcontador ? snapshot.val().msgcontador : 'Mensagem não definida.'

              let Contador = new MessageEmbed()
                .setAuthor({
                  name: 'Painel Geral - CONTADOR',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nTempo de atualização: \`5 minutos\`\nSintaxe: \`{contador}\`\nMensagem: \`${msg}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('PRIMARY')
                  .setCustomId('inicio')
                  .setLabel('Voltar')
              )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('atualizar')
                    .setLabel('Atualizar')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('mensagemC')
                    .setLabel('Configurar Mensagem')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('categoria')
                    .setLabel('Configurar Contador')
                )

              interaction.update({ embeds: [Contador], components: [row] });
            });
        }

        if (interaction.values[0].includes('CarteirasP')) {
          database
            .ref(`Cash/Carteira`)
            .once("value", snapshot => {

              var countermo = 0;

              snapshot.forEach(v => {
                countermo++;
              });

              let Permissao = new MessageEmbed()
                .setAuthor({
                  name: 'Painel Geral - ECONOMIA',
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nUsuários com Carteira: \`${countermo}\`` })
                .setColor(config.COLOR)

              const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('PRIMARY')
                  .setCustomId('inicio')
                  .setLabel('Voltar')
              )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('logsmo')
                    .setLabel('Configurar Logs')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('cargomo')
                    .setLabel('Configurar Cargo')
                )
                .addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('listamo')
                    .setLabel('Listar Carteiras')
                )

              const row2 = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('DANGER')
                  .setCustomId('reset1mo')
                  .setLabel('Resetar Carteiras')
              )

              interaction.update({ embeds: [Permissao], components: [row, row2] });
            });
        }

        if (interaction.values[0].includes('BlacklistP')) {
          database
            .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist`)
            .once("value", snapshot => {

              var counter2 = 0;

              snapshot.forEach(v => {
                counter2++;
              });

              database
                .ref(`Servidores/${interaction.guild.id}/Blacklist`)
                .once("value", snapshot2 => {

                  var counter3 = 0;

                  snapshot2.forEach(v => {
                    counter3++;
                  });

                  let Permissao = new MessageEmbed()
                    .setAuthor({
                      name: 'Painel Geral - BLACKLIST',
                      iconURL: imgur.Cadeado,
                      url: null
                    })
                    .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                    .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\nUsuários com Permissão: \`${counter2}\`\nUsuários em Blacklist: \`${counter3}\`` })
                    .setColor(config.COLOR)

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('PRIMARY')
                      .setCustomId('inicio')
                      .setLabel('Voltar')
                  )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('add')
                        .setLabel('Adicionar Permissão')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('rem')
                        .setLabel('Remover Permissão')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('listperm')
                        .setLabel('Listar Permissões')
                    )

                  const row2 = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('logs')
                        .setLabel('Configurar Logs')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('reset1')
                        .setLabel('Resetar Blacklist')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('reset2')
                        .setLabel('Resetar Permissões')
                    )

                  interaction.update({ embeds: [Permissao], components: [row, row2] });
                });
            });
        }
      }
    }
    /////////////////////////////////////////////////////////////

    //////////////////////////////// BOTÕES MENUS ///////////////////////////////
    if (interaction.isButton()) {
      const { customId } = interaction;

      database
        .ref(`Servidores/${config.Guild}/Configuracoes`)
        .once("value", async configclicou => {

          if (!interaction.message.interaction) {
            if (['telloemoji', 'registrologs', 'sejamembrourl', 'tellobarrinha', 'tellofiltro', 'cargovisitante', 'cargoinfadm', 'cargoverificaradm', 'sejamembrologs', 'tellobanner', 'sejamembrobanner', 'verificarbanner', 'migrabanner', 'suportebanner', 'registrobanner', 'migracategoria', 'resetarpd', 'areasmigra', 'tellomsg', 'cargopd', 'limitepd', 'listconfig', 'suportecargo', 'suportecategoria', 'ranktello', 'mensagemC', 'verificarlogs', 'instacanal', 'instamensagens', 'instainfluencer', 'canalgeral', 'canalgerallogs', 'twittercanal', 'fotobot', 'nomebot', 'listcomandos', 'prefixo', 'tellologs', 'tellocanal', 'migracanal', 'migrafichas', 'migralogs', 'recrulogs', 'cargoinf', 'msginf', 'canalinf', 'reset1INF', 'reset2INF', 'logsINF', 'verificarcargos2', 'verificarcategoria', 'verificarcanal', 'verificarcargo', 'verificarlista', 'resetprefixos', 'sejamembrocargo', 'canalsejamembro', 'listmembros', 'adicionarbot', 'removerbot', 'canalprefixos', 'resetp', 'inicio', 'canalregistro', 'cargosregistro', 'add', 'rem', 'logs', 'reset1', 'reset2', 'listperm', 'listamo', 'logsmo', 'cargomo', 'atualizar', 'categoria', 'addpd', 'rempd', 'canalembed', 'cancelarembed', 'descembed', 'tituloembed', 'thumbembed', 'bannerembed', 'enviarmbed'].includes(customId)
              && interaction.message.mentions.users.first().id !== interaction.user.id) {
              interaction.reply({ embeds: [Error], ephemeral: true }).catch(err => { });
              return;
            }
          }

          if (!interaction.message.mentions.users.first()) {
            if (['telloemoji', 'registrologs', 'sejamembrourl', 'tellobarrinha', 'tellofiltro', 'cargovisitante', 'cargoinfadm', 'cargoverificaradm', 'sejamembrologs', 'tellobanner', 'sejamembrobanner', 'verificarbanner', 'migrabanner', 'suportebanner', 'registrobanner', 'migrabanner', 'migracargo', 'resetarpd', 'areasmigra', 'tellomsg', 'cargopd', 'limitepd', 'listconfig', 'suportecargo', 'suportecategoria', 'ranktello', 'mensagemC', 'verificarlogs', 'instacanal', 'instamensagens', 'instainfluencer', 'canalgeral', 'canalgerallogs', 'twittercanal', 'fotobot', 'nomebot', 'listcomandos', 'prefixo', 'tellologs', 'tellocanal', 'migracanal', 'migrafichas', 'migralogs', 'recrulogs', 'addINF', 'remINF', 'listpermINF', 'reset1INF', 'reset2INF', 'logsINF', 'verificarcargos2', 'verificarcategoria', 'verificarcanal', 'verificarcargo', 'verificarlista', 'resetprefixos', 'sejamembrocargo', 'canalsejamembro', 'listmembros', 'adicionarbot', 'removerbot', 'canalprefixos', 'resetp', 'inicio', 'canalregistro', 'cargosregistro', 'add', 'rem', 'logs', 'reset1', 'reset2', 'listperm', 'listamo', 'logsmo', 'cargomo', 'atualizar', 'categoria'].includes(customId)
              && interaction.message.interaction.user.id !== interaction.user.id) {
              interaction.reply({ embeds: [Error], ephemeral: true })
              return;
            }
          }

          if (['aceitarP', 'callP', 'imagemP'].includes(customId) && interaction.member.id !== interaction.guild.ownerId && !interaction.member.permissions.has(`ADMINISTRATOR`)
            && !interaction.member.roles.cache.has(configclicou.val().cargoverificaradm)) {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }

          if (['aceitarS', 'callS'].includes(customId) && interaction.member.id !== interaction.guild.ownerId && !interaction.member.permissions.has(`ADMINISTRATOR`)
            && !interaction.member.roles.cache.has(configclicou.val().suportecargo)) {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }

          if (['cargoconcluirMIG', 'cargoremoverMIG', 'definircargoMIG', 'cargoconcluirREC', 'cargoremoverREC', 'definircargoREC', 'assumirficha', 'callM', 'remM', 'addM', 'aceitarM', 'cargoM', 'assumirfichaREC', 'aceitarREC', 'callREC', 'cargoREC'].includes(customId) && interaction.member.id !== interaction.guild.ownerId
            && !interaction.member.roles.cache.has(configclicou.val().migracargo)) {
            interaction.reply({ embeds: [Error], ephemeral: true })
            return;
          }

          ///////////// LOJA ///////////////


          if (customId === 'loja') {
            interaction.reply({ content: `**»** Estamos fazendo atualizações no Shopping, aguarde novas informações.`, ephemeral: true });
          }

          ///////////// LOJA ///////////////

          if (customId === 'tellosim') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", snapshot => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snapshot2 => {

                    if (!snapshot.val().tellocanal) return;

                    const Embed = new MessageEmbed()
                      .setDescription(`Você aceitou esta mensagem anônima e a mesma foi enviada para o canal <#${snapshot.val().tellocanal}>`)
                      .setColor(config.COLOR)

                    interaction.reply({ embeds: [Embed], ephemeral: true });

                    if (interaction.message.mentions.users.first()) {

                      interaction.guild.channels.cache.get(snapshot.val().tellocanal).send({ content: `${interaction.message.mentions.users.first()}`, files: [interaction.message.attachments.first()] }).then(m => {
                        if (snapshot.val().telloemoji) {
                          m.react(`${snapshot.val().telloemoji}`).catch(err => { });
                        }

                        if (snapshot2.val().barrinha) {
                          m.channel.send({ files: [snapshot2.val().barrinha] });
                        }

                        if (!snapshot.val().tellologs) return;

                        const logstello = new MessageEmbed()
                          .setAuthor({
                            name: 'Tellonym - ' + interaction.guild.name,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                            url: null
                          })
                          .setDescription(` **Responsável:** ${interaction.user} - \`${interaction.user.id}\``)
                          .setColor('FFFFFF')

                        const row = new MessageActionRow()
                          .addComponents(
                            new MessageButton()
                              .setStyle('LINK')
                              .setLabel('Ir até mensagem anônima')
                              .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${m.channel.id}/${m.id}`)
                          )

                        interaction.guild.channels.cache.get(snapshot.val().tellologs).send({ embeds: [logstello], components: [row] });
                      });

                      setTimeout(() => {
                        interaction.message.delete().catch(err => { });
                      }, 800);

                    } else {

                      interaction.guild.channels.cache.get(snapshot.val().tellocanal).send({ files: [interaction.message.attachments.first()] }).then(m => {
                        if (snapshot.val().telloemoji) {
                          m.react(`${snapshot.val().telloemoji}`).catch(err => { });
                        }

                        if (snapshot2.val().barrinha) {
                          m.channel.send({ files: [snapshot2.val().barrinha] });
                        }

                        if (!snapshot.val().tellologs) return;

                        const logstello = new MessageEmbed()
                          .setAuthor({
                            name: 'Tellonym - ' + interaction.guild.name,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                            url: null
                          })
                          .setDescription(` **Responsável:** ${interaction.user} - \`${interaction.user.id}\``)
                          .setColor('FFFFFF')

                        const row = new MessageActionRow()
                          .addComponents(
                            new MessageButton()
                              .setStyle('LINK')
                              .setLabel('Ir até mensagem anônima')
                              .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${m.channel.id}/${m.id}`)
                          )

                        interaction.guild.channels.cache.get(snapshot.val().tellologs).send({ embeds: [logstello], components: [row] });
                      });

                      setTimeout(() => {
                        interaction.message.delete().catch(err => { });
                      }, 800);
                    }
                  });
              });
          }

          if (customId === 'tellonao') {
            const Embed = new MessageEmbed()
              .setDescription(`Você recusou esta mensagem anônima.`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed], ephemeral: true });

            setTimeout(() => {
              interaction.message.delete().catch(err => { });
            }, 800);
          }

          if (customId === 'tellopublicar') {
            let textinput = new TextInputComponent()
              .setCustomId('tellopublicar-input')
              .setLabel("ID DOS USUÁRIOS")
              .setStyle('SHORT')
              .setMinLength(16)
              .setMaxLength(19)
              .setRequired(false)

            let textinput2 = new TextInputComponent()
              .setCustomId('tellopublicar2-input')
              .setLabel("MENSAGEM DO TELLONYM")
              .setStyle('LONG')
              .setMinLength(5)
              .setMaxLength(500)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('tellopublicar-modal')
              .setTitle(`Tellonym - ${interaction.guild.name}`)
              .addComponents([textinput, textinput2])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            })
          }

          if (customId === 'tellomsg') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal do tellonym (para publicar) no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    if (snap2.val()) {
                      if (snap2.val().tellonym) {
                        var banner = snap2.val().tellonym;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Tellonym:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                    const Tellonym = new MessageEmbed()
                      .setAuthor({
                        name: 'Tellonym - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`Envie uma mensagem anônima para a pessoa que você gosta ou odeia, causando intrigas, contando fofocas ou até mesmo se declarando para o próximo.`)
                      .addFields({
                        name: `Como funciona?`,
                        value: `\`1\` Clique no botão abaixo e insira as informações pedidas;\n\`2\` Seu tellonym passará por uma verificação;\n\`3\` Após a verificação o mesmo é postado automaticamente.`
                      })
                      .setColor(config.COLOR)
                      .setImage(banner)

                    const row = new MessageActionRow()
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('tellopublicar')
                          .setEmoji(`${emojis.tellonym}`)
                          .setLabel(`Enviar Tellonym`)
                      )

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [Tellonym], components: [row] })
                  });
              }
            });
          }

          if (customId === 'telloemoji') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o emoji usado para reagir no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vEmoji = collected.first().content

              database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                telloemoji: vEmoji
              });

              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Alteração nas Configurações',
                  iconURL: imgur.Sucesso,
                  url: null
                })
                .setDescription(`**Emoji para Reação (Tellonym):**\n**+** ${vEmoji}`)
                .setColor(config.COLOR)

              interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
            });
          }

          if (customId === 'tellofiltro') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de filtro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  tellofiltro: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Filtro:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'registrologs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de registro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs10: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Registro):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'sejamembrologs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de seja membro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs9: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Seja Membro):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'migracategoria') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a categoria de migração no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  migracategoria: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Categoria de Migração:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'migracargo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de migração no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  migracargo: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Migração:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              }
            });
          }

          if (customId === 'cargovisitante') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de visitante no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargovisitante: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Visitante:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              }
            });
          }

          if (customId === 'tellobarrinha') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a barrinha de tellonym no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`A barrinha do **TELLONYM** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1088906271555584080')({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ barrinha: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'tellobanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de tellonym no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **TELLONYM** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ tellonym: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'registrobanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de registro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **REGISTRO** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ registro: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'sejamembrobanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de seja membro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **SEJA MEMBRO** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ sejamembro: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'suportebanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de suporte no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **SUPORTE** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ suporte: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'verificarbanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **VERIFICAÇÃO** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ verificacao: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'migrabanner') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner de migração no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                const Embed2 = new MessageEmbed()
                  .setDescription(`O banner de **MIGRAÇÃO** foi definido com sucesso.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [Embed2], ephemeral: true });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Banners`).update({ migracao: m.attachments.first().url });
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'sejamembrourl') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a url do seja membro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vURL = collected.first().content.replace(/\s/g, '');

              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Alteração nas Configurações',
                  iconURL: imgur.Sucesso,
                  url: null
                })
                .setDescription(`A URL foi do Seja Membro foi alterada para: \`${vURL}\`.`)
                .setColor(config.COLOR)

              interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              await database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({ url: vURL });
            });
          }

          if (customId === 'mensagemC') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a mensagem do contador no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vMensagem = collected.first().content

              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Alteração nas Configurações',
                  iconURL: imgur.Sucesso,
                  url: null
                })
                .setDescription(`**Mensagem do Contador:**\n**+** ${vMensagem}`)
                .setColor(config.COLOR)

              interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              await database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({ msgcontador: vMensagem });
            });
          }

          if (customId === 'areasmigra') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a área de recrutamento no chat\nDigite \`cancelar\` para cancelar esta ação\nDigite \`resetar\` para resetar as áreas`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().content.includes('resetar')) {
                await database.ref(`Servidores/${interaction.guild.id}/Areas`).remove();

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`Todas as áreas foram resetadas.`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
                return;
              }

              var vArea = collected.first().content.replace(/\s/g, '');

              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Alteração nas Configurações',
                  iconURL: imgur.Sucesso,
                  url: null
                })
                .setDescription(`**Nova área adicionada:**\n**+** ${vArea}`)
                .setColor(config.COLOR)

              interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              await database.ref(`Servidores/${interaction.guild.id}/Areas/${vArea}`).update({ colocou: interaction.user.id });
            });
          }

          if (customId === 'resetarpd') {
            database
              .ref(`Servidores/${interaction.guild.id}/PD`)
              .once("value", async snap => {

                if (snap.val()) {
                  database
                    .ref(`Servidores/${interaction.guild.id}/PD`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Primeira Dama',
                      iconURL: imgur.Sucesso,
                      url: null
                    })
                    .setDescription(`Todos as configurações de **Primeira Dama** foram resetados por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });
                }
              });
          }

          if (customId === 'listconfig') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                database
                  .ref(`Servidores/${interaction.guild.id}/PD/Cargos`)
                  .once("value", async cargo => {

                    var msgArr = [];

                    cargo.forEach(msg => {
                      msgArr.push(
                        `<@&${msg.key}> - **LIMITE:** ${msg.val().limite}`
                      );
                    })

                    msgArr = msgArr.join(`\n`)

                    const Lista = new MessageEmbed()
                      .setAuthor({
                        name: 'Primeira Dama - ' + interaction.guild.name,
                        iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                        url: null
                      })
                      .setColor('ec86f0')
                      .setDescription(`**Cargo de PD:** <@&${snapshot.val().cargopd}>\n\n${msgArr}`);

                    interaction.reply({ embeds: [Lista], ephemeral: true }).catch(err => { });
                  });
              });
          }

          if (customId === 'rempd') {
            var arr = [];
            var damas = [];

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async configs => {

                database
                  .ref(`Servidores/${interaction.guild.id}/PD/Cargos`)
                  .once("value", async cargo => {

                    cargo.forEach(v => {
                      if (!interaction.member.roles.cache.has(v.key)) return;

                      arr.push({
                        CARGO: v.key,
                        LIMITE: v.val().limite
                      });
                    });

                    var perm = arr.slice(0);

                    const Embed = new MessageEmbed()
                      .setDescription(`Envie a primeira dama para ser removida no chat\nDigite \`cancelar\` para cancelar esta ação`)
                      .setColor(config.COLOR)

                    interaction.reply({ embeds: [Embed] }).catch(err => { });

                    const filter = m => m.author.id === interaction.user.id
                    await interaction.channel.awaitMessages({
                      filter,
                      max: 1
                    }).then(async collected => {
                      setTimeout(async () => {
                        await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                        await interaction.deleteReply().catch(err => { });
                      }, 150);

                      if (collected.first().content.includes('cancelar')) {
                        return;
                      }

                      var vUser = collected.first().content.replace(/\D/g, '');

                      if (cliente.users.cache.get(vUser)) {
                        database
                          .ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}/${vUser}`)
                          .once("value", async setada => {

                            if (setada.val()) {
                              const Removido = new MessageEmbed()
                                .setAuthor({
                                  name: 'Primeira Dama - ' + interaction.guild.name,
                                  iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                                  url: null
                                })
                                .setColor('ec86f0')
                                .setDescription(`**Primeira Dama Removida:** <@${vUser}> (\`${vUser}\`)\n**Responsável:** ${interaction.user}`);

                              await database.ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}/${vUser}`).remove();

                              interaction.followUp({ embeds: [Removido] }).then(m => {
                                setTimeout(async () => {
                                  await m.delete().catch(err => { });
                                }, 100e3);
                              }).catch(err => { });

                              setTimeout(async () => {
                                database
                                  .ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}`)
                                  .once("value", async pds => {

                                    if (pds.val()) {
                                      pds.forEach(msg => {
                                        damas.push(
                                          `<@${msg.key}>`
                                        );
                                      });
                                    } else {
                                      damas.push(`Nenhuma primeira dama foi encontrada.`)
                                    }

                                    var damas2 = damas.join(`\n`)

                                    const EmbedPD = new MessageEmbed()
                                      .setAuthor({
                                        name: 'Primeira Dama - ' + interaction.guild.name,
                                        iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                                        url: null
                                      })
                                      .setDescription(`**Usuário:** ${interaction.user} (\`${interaction.user.id}\`)\n**Cargo:** <@&${perm[0]['CARGO']}>\n**Limite:** ${perm[0]['LIMITE']}\n\n**Lista de PDs:**\n${damas2}`)
                                      .setColor('ec86f0')
                                      .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

                                    interaction.message.edit({ embeds: [EmbedPD] }).catch(err => { });
                                  });

                              }, 300);

                              if (interaction.guild.members.cache.get(vUser)) {
                                await interaction.guild.members.cache.get(vUser).roles.remove(configs.val().cargopd).catch(err => { });
                              }
                            }
                          });
                      }
                    });
                  });
              });
          }

          if (customId === 'addpd') {
            var arr = [];
            var damas = [];

            database
              .ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}`)
              .once("value", async pd => {

                database
                  .ref(`Servidores/${interaction.guild.id}/PD/Cargos`)
                  .once("value", async cargo => {

                    database
                      .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                      .once("value", async configs => {

                        cargo.forEach(v => {
                          if (!interaction.member.roles.cache.has(v.key)) return;

                          arr.push({
                            CARGO: v.key,
                            LIMITE: v.val().limite
                          });
                        });

                        var perm = arr.slice(0);

                        var embed2 = new MessageEmbed()
                          .setAuthor({
                            name: 'Limite de atingido',
                            iconURL: imgur.Cancelado,
                            url: null
                          })
                          .setDescription(`Você atingiu seu limite de primeiras damas.`)
                          .setColor(config.COLOR)

                        if (pd.val()) {
                          if (Object.keys(pd.val()).length >= Number(perm[0]['LIMITE'])) return interaction.reply({ embeds: [embed2], ephemeral: true }).catch(err => { });
                        }

                        const Embed = new MessageEmbed()
                          .setDescription(`Envie sua nova primeira dama no chat\nDigite \`cancelar\` para cancelar esta ação`)
                          .setColor(config.COLOR)

                        interaction.reply({ embeds: [Embed] }).catch(err => { });

                        const filter = m => m.author.id === interaction.user.id
                        await interaction.channel.awaitMessages({
                          filter,
                          max: 1
                        }).then(async collected => {
                          setTimeout(async () => {
                            await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                            await interaction.deleteReply().catch(err => { });
                          }, 150);

                          if (collected.first().content.includes('cancelar')) {
                            return;
                          }

                          var vUser = collected.first().content.replace(/\D/g, '');

                          if (interaction.guild.members.cache.get(vUser)) {

                            const Setado = new MessageEmbed()
                              .setAuthor({
                                name: 'Primeira Dama - ' + interaction.guild.name,
                                iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                                url: null
                              })
                              .setColor('ec86f0')
                              .setDescription(`**Primeira Dama:** <@${vUser}> (\`${vUser}\`)\n**Responsável:** ${interaction.user}`);

                            await database.ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}/${vUser}`).update({ dono: interaction.user.id });
                            await interaction.guild.members.cache.get(vUser).roles.add(configs.val().cargopd).catch(err => { });

                            interaction.followUp({ embeds: [Setado] }).then(m => {
                              setTimeout(async () => {
                                await m.delete().catch(err => { });
                              }, 100e3);
                            }).catch(err => { });

                            setTimeout(async () => {
                              database
                                .ref(`Servidores/${interaction.guild.id}/PD/Damas/${interaction.user.id}`)
                                .once("value", async pds => {

                                  if (pds.val()) {
                                    pds.forEach(msg => {
                                      damas.push(
                                        `<@${msg.key}>`
                                      );
                                    });
                                  } else {
                                    damas.push(`Nenhuma primeira dama foi encontrada.`)
                                  }

                                  var damas2 = damas.join(`\n`)

                                  const EmbedPD = new MessageEmbed()
                                    .setAuthor({
                                      name: 'Primeira Dama - ' + interaction.guild.name,
                                      iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                                      url: null
                                    })
                                    .setDescription(`**Usuário:** ${interaction.user} (\`${interaction.user.id}\`)\n**Cargo:** <@&${perm[0]['CARGO']}>\n**Limite:** ${perm[0]['LIMITE']}\n\n**Lista de PDs:**\n${damas2}`)
                                    .setColor('ec86f0')
                                    .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

                                  interaction.message.edit({ embeds: [EmbedPD] }).catch(err => { });
                                });
                            }, 300);
                          }
                        });
                      });
                  });
              });
          }

          if (customId === 'cargopd') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de primeira dama no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargopd: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Primeira Dama:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

              }
            });
          }

          if (customId === 'limitepd') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo com acesso a primeira dama no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/PD/Cargos/${vCargo}`).update({
                  limite: 1
                });

                const Embed2 = new MessageEmbed()
                  .setDescription(`Envie o limite de <@&${vCargo}> no chat\nDigite \`cancelar\` para cancelar esta ação`)
                  .setColor(config.COLOR)

                interaction.channel.send({ embeds: [Embed2] }).then(async m => {

                  await interaction.channel.awaitMessages({
                    filter,
                    max: 1
                  }).then(async collected => {
                    setTimeout(async () => {
                      await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                      await m.delete().catch(err => { });
                    }, 150);

                    var numero = collected.first().content;

                    if (!isNaN(numero)) {
                      database.ref(`Servidores/${interaction.guild.id}/PD/Cargos/${vCargo}`).update({
                        limite: numero
                      });

                      let EmbedExemplo = new MessageEmbed()
                        .setAuthor({
                          name: 'Alteração nas Configurações',
                          iconURL: imgur.Sucesso,
                          url: null
                        })
                        .setDescription(`**Limites e Permissões (PD):**\n**+** <@&${vCargo}> - **Limite:** ${numero}`)
                        .setColor(config.COLOR)

                      interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
                    }
                  });
                });
              }
            });
          }

          if (customId === 'enviarmbed') {
            const nomecanal = interaction.message.embeds[0].author.name.slice(18);
            const canal = interaction.guild.channels.cache.find(m => m.name == nomecanal)

            if (!canal) return interaction.reply({ content: `> O canal inserido anteriormente para o envio da embed não foi encontrado.`, ephemeral: true });

            if (interaction.message.embeds[0].title == 'Título') return interaction.reply({ content: `> Você precisa inserir um título.`, ephemeral: true });
            if (interaction.message.embeds[0].description == '> Todas as alterações serão mostradas neste exemplo prévio, quando a embed for enviada, campos não inseridos não serão mostrados.') return interaction.reply({ content: `> Você precisa inserir uma descrição.`, ephemeral: true });

            const banner = interaction.message.embeds[0].image.url == 'https://i.imgur.com/qvnZOeu.png' ? null : interaction.message.embeds[0].image.url;
            const thumbnail = interaction.message.embeds[0].thumbnail.url == 'https://i.imgur.com/u7CQCAP.png' ? null : interaction.message.embeds[0].thumbnail.url;

            setTimeout(async () => {
              interaction.message.delete().catch(err => { });
            }, 150);

            const Embed = new MessageEmbed()
              .setTitle(interaction.message.embeds[0].title)
              .setDescription(interaction.message.embeds[0].description)
              .setImage(banner)
              .setThumbnail(thumbnail)
              .setColor(config.COLOR)
              .setFooter({ text: `${interaction.guild.name} ©` })

            canal.send({ embeds: [Embed] }).then(m => {
              const Enviada = new MessageEmbed()
                .setDescription(`A embed foi enviada no canal ${canal} com sucesso.`)
                .setColor(config.COLOR)

              const row = new MessageActionRow()
                .addComponents(
                  new MessageButton()
                    .setStyle('LINK')
                    .setLabel(`Ir até a embed`)
                    .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${canal.id}/${m.id}`)
                )

              interaction.reply({ embeds: [Enviada], components: [row], ephemeral: true });
            });
          }

          if (customId === 'thumbembed') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a thumbnail da embed no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                cliente.guilds.cache.get('796055673770868777').channels.cache.get('1061082782933196871').send({ files: [foto] }).then(m => {
                  interaction.message.embeds[0].thumbnail.url = m.attachments.first().url;
                  const atualizarembed = interaction.message.embeds[0];

                  interaction.message.edit({ embeds: [atualizarembed] });
                }).catch(err => { });
              }
            });
          }

          if (customId === 'bannerembed') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o banner da embed no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                cliente.guilds.cache.get('796055673770868777').channels.cache.get('1061082782933196871').send({ files: [foto] }).then(m => {
                  interaction.message.embeds[0].image.url = m.attachments.first().url;
                  const atualizarembed = interaction.message.embeds[0];

                  interaction.message.edit({ embeds: [atualizarembed] });
                }).catch(err => { });
              }
            });
          }

          if (customId === 'descembed') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a descrição da embed no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().content.length > 4090) return;

              interaction.message.embeds[0].description = collected.first().content;
              const atualizarembed = interaction.message.embeds[0];

              interaction.message.edit({ embeds: [atualizarembed] });
            });
          }

          if (customId === 'tituloembed') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o título da embed no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().content.length > 256) return;

              interaction.message.embeds[0].title = collected.first().content;
              const atualizarembed = interaction.message.embeds[0];

              interaction.message.edit({ embeds: [atualizarembed] });
            });
          }

          if (customId === 'cancelarembed') {
            interaction.message.delete().catch(err => { });

            const Embed = new MessageEmbed()
              .setDescription(`A criação da embed foi cancelada por você.`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed], ephemeral: true });
          }

          if (customId === 'canalembed') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal da embed no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                const Embed = new MessageEmbed()
                  .setAuthor({
                    name: `Criando no canal: ${interaction.guild.channels.cache.get(vCanal).name}`,
                    iconURL: 'https://cdn.discordapp.com/emojis/966464122357174312.gif',
                    url: null
                  })
                  .setColor(config.COLOR)
                  .setTitle(`Título`)
                  .setDescription(`> Todas as alterações serão mostradas neste exemplo prévio, quando a embed for enviada, campos não inseridos não serão mostrados.`)
                  .setThumbnail(`https://i.imgur.com/u7CQCAP.png`)
                  .setImage(`https://i.imgur.com/qvnZOeu.png`)
                  .setFooter({ text: `${interaction.guild.name} ©` })

                const row = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setStyle('DANGER')
                      .setCustomId('cancelarembed')
                      .setLabel(`Cancelar`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('tituloembed')
                      .setLabel(`Definir Título`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('descembed')
                      .setLabel(`Definir Descrição`)
                  )


                const row2 = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('bannerembed')
                      .setLabel(`Definir Banner`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('thumbembed')
                      .setLabel(`Definir Thumbnail`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SUCCESS')
                      .setCustomId('enviarmbed')
                      .setLabel(`Enviar`)
                  )

                interaction.message.edit({ embeds: [Embed], components: [row, row2] })
              }
            });
          }

          if (customId === 'listcomandos') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (snapshot.val().prefix) {
                  var prefix = snapshot.val().prefix;
                } else {
                  var prefix = ";";

                  database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                    prefix: ";",
                  });
                }

                const Embed = new MessageEmbed()
                  .setAuthor({
                    name: 'Lista de Comandos - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields({ name: 'Comandos em **(/)**', value: `\`/painel\`\n\`/blacklist\`\n\`/carteira\`` },
                    { name: `Comandos em **(${prefix})**`, value: `\`tomalerda\` (não precisa de prefixo) - limpa as últimas 100 mensagens.\n\`${prefix}embed\`\n\`${prefix}pd\`\n\`${prefix}painel\`\n\`${prefix}blacklist\`` })
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Embed], ephemeral: true });
              });
          }

          if (customId === 'prefixo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o novo prefixo do bot no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                prefix: collected.first().content,
              });

              const Embed2 = new MessageEmbed()
                .setDescription(`O Prefixo do bot foi alterado para (\`${collected.first().content}\`) por ${interaction.user}.`)
                .setColor(config.COLOR)

              interaction.channel.send({ embeds: [Embed2] }).then(m => {
                setTimeout(async () => {
                  m.delete().catch(err => { });
                }, 20 * 1000);
              });
            });
          }

          if (customId === 'nomebot') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o novo nickname do bot no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              await cliente.user.setUsername(collected.first().content).catch(err => { });

              const Embed2 = new MessageEmbed()
                .setDescription(`O Nickname do bot foi alterado por ${interaction.user}.`)
                .setColor(config.COLOR)

              interaction.channel.send({ embeds: [Embed2] }).then(m => {
                setTimeout(async () => {
                  m.delete().catch(err => { });
                }, 20 * 1000);
              });

            });
          }

          if (customId === 'fotobot') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o novo avatar do bot no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                await cliente.user.setAvatar(foto).catch(err => { })

                const Embed2 = new MessageEmbed()
                  .setDescription(`O Avatar do bot foi alterado por ${interaction.user}.`)
                  .setColor(config.COLOR)

                interaction.channel.send({ embeds: [Embed2] }).then(m => {
                  setTimeout(async () => {
                    m.delete().catch(err => { });
                  }, 20 * 1000);
                });
              }
            });
          }

          if (interaction.customId === 'deletarT') {
            database
              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}`)
              .once("value", async snapshot => {

                if (snapshot.val().id !== interaction.member.id
                  && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [Error], ephemeral: true })

                setTimeout(async () => {
                  await interaction.message.delete().catch(err => { })
                }, 150);

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`Seu Tweet foi deletado com sucesso.`)

                interaction.reply({ embeds: [Embed], ephemeral: true }).catch(err => { })

                await database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/`).remove();
              });
          }

          if (interaction.customId === 'infoT') {
            var arr = [];

            var curtidas = 0;
            var rts = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT`)
              .once("value", async snap2 => {

                snap2.forEach(v => {
                  rts++;
                });

                database
                  .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu`)
                  .once("value", async snapshot => {

                    snapshot.forEach(v => {
                      curtidas++;
                    });

                    database
                      .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/m/mensagens`)
                      .once("value", snapshot => {

                        if (!snapshot.val()) {
                          let Teste = new MessageEmbed()
                            .setAuthor({
                              name: 'INFORMAÇÕES DO TWEET',
                              iconURL: imgur.Twitter,
                              url: null
                            })
                            .addFields(
                              { name: `<:likeT:1057424142279913602> Curtidas:`, value: `${curtidas}`, inline: true },
                              { name: `<:retweet:1057424140421845012> Retweet's:`, value: `${rts}`, inline: true },
                              { name: `<:coments:1060155099038613534> Comentários:`, value: `Nenhum comentário encontrado.` }
                            )
                            .setColor('40b4fe')

                          interaction.reply({ embeds: [Teste], ephemeral: true }).catch(err => { });
                          return;

                        } else {

                          var msgArr = [];

                          snapshot.val().forEach(msg => {
                            msgArr.push(
                              `<@${msg.author}>: ${msg.mensagem}\n`
                            );
                          })

                          msgArr = msgArr.join(``)

                          let Teste = new MessageEmbed()
                            .setAuthor({
                              name: 'INFORMAÇÕES DO TWEET',
                              iconURL: imgur.Twitter,
                              url: null
                            })
                            .addFields(
                              { name: `<:likeT:1057424142279913602> Curtidas:`, value: `${curtidas}`, inline: true },
                              { name: `<:retweet:1057424140421845012> Retweet's:`, value: `${rts}`, inline: true },
                              { name: `<:coments:1060155099038613534> Comentários:`, value: `${msgArr}` }
                            )
                            .setColor('40b4fe')

                          interaction.reply({ embeds: [Teste], ephemeral: true }).catch(err => { });
                        }
                      });
                  });
              });
          }

          if (interaction.customId === 'comentT') {
            let textinput = new TextInputComponent()
              .setCustomId('comentarT-input')
              .setLabel("Escreva seu comentário")
              .setMaxLength(100)
              .setMinLength(1)
              .setStyle("LONG")
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('comentarT-modal')
              .setTitle(`Twitter - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (interaction.customId === 'tweet') {
            var counter = 0;
            var counter2 = 0;
            var counter3 = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}`)
              .once("value", async snap1 => {

                const Embed2 = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`Você não pode Retweetar seu próprio Tweet.`)

                if (interaction.user.id === snap1.val().id) return interaction.reply({ embeds: [Embed2], ephemeral: true }).catch(err => { });

                const webhook = await interaction.channel.fetchWebhooks();

                if (!webhook.first()) return interaction.channel.createWebhook('Twitter ®️', { avatar: 'https://i.imgur.com/BhRQXgL.png' });

                database
                  .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT`)
                  .once("value", async snap2 => {

                    snap2.forEach(v => {
                      counter2++;
                    });

                    database
                      .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu`)
                      .once("value", async snapshot => {

                        snapshot.forEach(v => {
                          counter++;
                        });

                        database
                          .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/m/mensagens`)
                          .once("value", async snap3 => {

                            snap3.forEach(v => {
                              counter3++;
                            });

                            database
                              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT/${interaction.member.id}`)
                              .once("value", async snapshot2 => {

                                if (!snapshot2.val()) {

                                  let fundo = "https://i.imgur.com/0n5RuAB.png";

                                  const canvas = Canvas.createCanvas(752, 285)
                                  const ctx = canvas.getContext('2d')

                                  const background = await Canvas.loadImage(fundo)
                                  ctx.drawImage(background, 0, 0)

                                  ctx.font = 'bold 23px arial',
                                    ctx.fillStyle = '#ffffff';
                                  ctx.fillText(`${snap1.val().username}`, 105, 45);

                                  function BreakLines(text, length) {
                                    const temp = [];
                                    for (let i = 0; i < text.length; i += length) {
                                      temp.push(text.slice(i, i + length));
                                    }
                                    return temp.map(x => x.trim());
                                  }

                                  ctx.font = '25px arial'
                                  ctx.fillText(BreakLines(snap1.val().mensagem, 50).join('\n'), 30, 123);

                                  ctx.font = '20px arial',
                                    ctx.fillStyle = '#8899a6';
                                  ctx.fillText(`@${snap1.val().username}`, 100, 70);

                                  ctx.font = '20px arial'
                                  ctx.fillText(Number(counter), 65, 260);

                                  ctx.fillText(Number(counter2) + 1, 140, 260);

                                  ctx.fillText(Number(counter3), 218, 260);

                                  ctx.font = '20px arial'
                                  ctx.fillText(snap1.val().data, 520, 260);

                                  const pfp = await Canvas.loadImage(interaction.guild.members.cache.get(snap1.val().id).user.avatarURL({ format: 'png', size: 64 }));

                                  ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
                                  ctx.lineWidth = 6;
                                  ctx.closePath();
                                  ctx.clip();

                                  ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

                                  const attachment = new MessageAttachment(canvas.toBuffer())

                                  await database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT/${interaction.member.id}`).update({ id: interaction.member.id, username: interaction.user.username });

                                  interaction.message.components[0].components[1].label = Number(counter2) + 1;
                                  let buttons = interaction.message.components[0];
                                  await interaction.update({ files: [attachment], components: [buttons] }).catch(err => { });

                                  const row = new MessageActionRow()
                                    .addComponents(
                                      new MessageButton()
                                        .setStyle('LINK')
                                        .setLabel(`Confira o Tweet`)
                                        .setEmoji(`<:blue_twitter:1057459487595823245>`)
                                        .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${interaction.channel.id}/${snap1.key}`)
                                    )

                                  webhook.first().send({ content: `> <:blue_twitter:1057459487595823245> ${interaction.member} deu Retweet no Tweet de <@${snap1.val().id}>.`, files: [attachment], components: [row] }).then(m => {
                                    database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT/${interaction.member.id}`).update({ mensagemid: m.id });
                                  }).catch(err => { });

                                } else {

                                  let fundo = "https://i.imgur.com/0n5RuAB.png";

                                  const canvas = Canvas.createCanvas(752, 285)
                                  const ctx = canvas.getContext('2d')

                                  const background = await Canvas.loadImage(fundo)
                                  ctx.drawImage(background, 0, 0)

                                  ctx.font = 'bold 23px arial',
                                    ctx.fillStyle = '#ffffff';
                                  ctx.fillText(`${snap1.val().username}`, 105, 45);

                                  function BreakLines(text, length) {
                                    const temp = [];
                                    for (let i = 0; i < text.length; i += length) {
                                      temp.push(text.slice(i, i + length));
                                    }
                                    return temp.map(x => x.trim());
                                  }

                                  ctx.font = '25px arial'
                                  ctx.fillText(BreakLines(snap1.val().mensagem, 50).join('\n'), 30, 123);

                                  ctx.font = '20px arial',
                                    ctx.fillStyle = '#8899a6';
                                  ctx.fillText(`@${snap1.val().username}`, 100, 70);

                                  ctx.font = '20px arial'
                                  ctx.fillText(Number(counter), 65, 260);

                                  ctx.fillText(Number(counter2) - 1, 140, 260);

                                  ctx.fillText(Number(counter3), 218, 260);

                                  ctx.font = '20px arial'
                                  ctx.fillText(snap1.val().data, 520, 260);

                                  const pfp = await Canvas.loadImage(interaction.guild.members.cache.get(snap1.val().id).user.avatarURL({ format: 'png', size: 64 }));

                                  ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
                                  ctx.lineWidth = 6;
                                  ctx.closePath();
                                  ctx.clip();

                                  ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

                                  const attachment = new MessageAttachment(canvas.toBuffer())

                                  interaction.channel.messages.delete(snapshot2.val().mensagemid).catch(err => { });

                                  const Embed = new MessageEmbed()
                                    .setColor(config.COLOR)
                                    .setDescription(`O Retweet do Tweet de <@${snap1.val().id}> foi excluido.`)

                                  await database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT/${interaction.member.id}`).remove();

                                  interaction.message.components[0].components[1].label = Number(counter2) - 1;
                                  let buttons = interaction.message.components[0];
                                  await interaction.update({ files: [attachment], components: [buttons] }).catch(err => { });

                                  interaction.followUp({ embeds: [Embed], ephemeral: true }).catch(err => { });
                                }
                              });
                          });
                      });
                  });
              });
          }

          if (interaction.customId === 'likeT') {
            var counter = 0;
            var counter2 = 0;
            var counter3 = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}`)
              .once("value", async snap1 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/RT`)
                  .once("value", async snap2 => {

                    snap2.forEach(v => {
                      counter2++;
                    });

                    database
                      .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu`)
                      .once("value", async snapshot => {

                        snapshot.forEach(v => {
                          counter++;
                        });

                        database
                          .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/m/mensagens`)
                          .once("value", async snap3 => {

                            snap3.forEach(v => {
                              counter3++;
                            });

                            database
                              .ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu/${interaction.member.id}`)
                              .once("value", async snapshot2 => {

                                if (!snapshot2.val()) {
                                  let fundo = "https://i.imgur.com/0n5RuAB.png";

                                  const canvas = Canvas.createCanvas(752, 285)
                                  const ctx = canvas.getContext('2d')

                                  const background = await Canvas.loadImage(fundo)
                                  ctx.drawImage(background, 0, 0)

                                  ctx.font = 'bold 23px arial',
                                    ctx.fillStyle = '#ffffff';
                                  ctx.fillText(`${snap1.val().username}`, 105, 45);

                                  function BreakLines(text, length) {
                                    const temp = [];
                                    for (let i = 0; i < text.length; i += length) {
                                      temp.push(text.slice(i, i + length));
                                    }
                                    return temp.map(x => x.trim());
                                  }

                                  ctx.font = '25px arial'
                                  ctx.fillText(BreakLines(snap1.val().mensagem, 55).join('\n'), 30, 123);

                                  ctx.font = '20px arial',
                                    ctx.fillStyle = '#8899a6';
                                  ctx.fillText(`@${snap1.val().username}`, 100, 70);

                                  ctx.font = '20px arial'
                                  ctx.fillText(Number(counter) + 1, 65, 260);

                                  ctx.fillText(Number(counter2), 140, 260);

                                  ctx.fillText(Number(counter3), 218, 260);

                                  ctx.font = '20px arial'
                                  ctx.fillText(snap1.val().data, 520, 260);

                                  const pfp = await Canvas.loadImage(interaction.guild.members.cache.get(snap1.val().id).user.avatarURL({ format: 'png', size: 64 }));

                                  ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
                                  ctx.lineWidth = 6;
                                  ctx.closePath();
                                  ctx.clip();

                                  ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

                                  const attachment = new MessageAttachment(canvas.toBuffer())

                                  await database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu/${interaction.member.id}`).update({ like: interaction.member.id });

                                  interaction.message.components[0].components[0].label = Number(counter) + 1;
                                  let buttons = interaction.message.components[0];
                                  await interaction.update({ files: [attachment], components: [buttons] }).catch(err => { });

                                } else {
                                  let fundo = "https://i.imgur.com/0n5RuAB.png";

                                  const canvas = Canvas.createCanvas(752, 285)
                                  const ctx = canvas.getContext('2d')

                                  const background = await Canvas.loadImage(fundo)
                                  ctx.drawImage(background, 0, 0)

                                  ctx.font = 'bold 23px arial',
                                    ctx.fillStyle = '#ffffff';
                                  ctx.fillText(`${snap1.val().username}`, 105, 45);

                                  function BreakLines(text, length) {
                                    const temp = [];
                                    for (let i = 0; i < text.length; i += length) {
                                      temp.push(text.slice(i, i + length));
                                    }
                                    return temp.map(x => x.trim());
                                  }

                                  ctx.font = '25px arial'
                                  ctx.fillText(BreakLines(snap1.val().mensagem, 55).join('\n'), 30, 123);

                                  ctx.font = '20px arial',
                                    ctx.fillStyle = '#8899a6';
                                  ctx.fillText(`@${snap1.val().username}`, 100, 70);

                                  ctx.font = '20px arial'
                                  ctx.fillText(Number(counter) - 1, 65, 260);

                                  ctx.fillText(Number(counter2), 140, 260);

                                  ctx.fillText(Number(counter3), 218, 260);

                                  ctx.font = '20px arial'
                                  ctx.fillText(snap1.val().data, 520, 260);

                                  const pfp = await Canvas.loadImage(interaction.guild.members.cache.get(snap1.val().id).user.avatarURL({ format: 'png', size: 64 }));

                                  ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
                                  ctx.lineWidth = 6;
                                  ctx.closePath();
                                  ctx.clip();

                                  ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

                                  const attachment = new MessageAttachment(canvas.toBuffer())

                                  await database.ref(`Servidores/${interaction.guild.id}/Twitter/${interaction.message.id}/Curtiu/${interaction.member.id}`).remove();

                                  interaction.message.components[0].components[0].label = Number(counter) - 1;
                                  let buttons = interaction.message.components[0];
                                  await interaction.update({ files: [attachment], components: [buttons] }).catch(err => { });
                                }
                              });
                          });
                      });
                  });
              });
          }

          if (interaction.customId === 'deletar') {
            database
              .ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}`)
              .once("value", async snapshot => {

                if (snapshot.val().postou !== interaction.member.id
                  && !interaction.member.permissions.has('ADMINISTRATOR')) return interaction.reply({ embeds: [Error], ephemeral: true })

                await interaction.message.delete().catch(err => { })

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`Sua publicação foi deletada com sucesso.`)

                interaction.reply({ embeds: [Embed], ephemeral: true })

                await database.ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/`).remove();
              });
          }

          if (interaction.customId === 'listacomentarios') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/m/mensagens`)
              .once("value", snapshot => {

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`Nenhum comentário foi encontrado nesta publicação.`)

                if (!snapshot.val()) {
                  return interaction.reply({ embeds: [Embed], ephemeral: true })
                }

                var msgArr = [];

                snapshot.val().forEach(msg => {
                  msgArr.push(
                    `<@${msg.author}>: ${msg.mensagem}\n`
                  );
                })

                msgArr = msgArr.join(``)

                let Teste = new MessageEmbed()
                  .setAuthor({
                    name: 'COMENTÁRIOS DA PUBLICAÇÃO',
                    iconURL: imgur.Comentario,
                    url: null
                  })
                  .setDescription(msgArr)
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Teste], ephemeral: true }).catch(err => { });
              });
          }

          if (interaction.customId === 'listalikes') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/Curtiu`)
              .once("value", snapshot => {

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`Nenhuma curtida foi encontrado nesta publicação.`)

                if (!snapshot.val()) {
                  interaction.reply({ embeds: [Embed], ephemeral: true })
                  return;
                }

                snapshot.forEach(v => {
                  arr.push({
                    ID: v.key,
                  });

                  counter++;

                  if (counter === snapshot.numChildren()) {
                    arr.sort(function (a, b) {
                      return b - a;
                    });

                    var lista = arr.slice(0);
                    var msgArr = [];
                    var count = 0;

                    lista.forEach(u => {
                      msgArr.push(
                        `<@${u.ID}>\n`
                      );

                      count++;
                      if (count == lista.length) {
                        var msg2 = msgArr.join(``);

                        let Teste = new MessageEmbed()
                          .setAuthor({
                            name: 'CURTIDAS DA PUBLICAÇÃO',
                            iconURL: imgur.Curtidas,
                            url: null
                          })
                          .setDescription(msg2)
                          .setColor(config.COLOR)

                        interaction.reply({ embeds: [Teste], ephemeral: true }).catch(err => { });
                      }
                    });
                  }
                });
              });
          }

          if (interaction.customId === 'like') {
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/Curtiu`)
              .once("value", async snapshot => {

                snapshot.forEach(v => {
                  counter++;
                });

                database
                  .ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/Curtiu/${interaction.member.id}`)
                  .once("value", async snapshot2 => {

                    if (!snapshot2.val()) {
                      await database.ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/Curtiu/${interaction.member.id}`).update({ like: interaction.member.id });

                      interaction.message.components[0].components[0].label = Number(counter) + 1;
                      let buttons = interaction.message.components[0];
                      await interaction.update({ components: [buttons] }).catch(err => { });

                    } else {

                      await database.ref(`Servidores/${interaction.guild.id}/Instagram/${interaction.message.id}/Curtiu/${interaction.member.id}`).remove();

                      interaction.message.components[0].components[0].label = Number(counter) - 1;
                      let buttons = interaction.message.components[0];
                      await interaction.update({ components: [buttons] }).catch(err => { });
                    }
                  });
              });
          }

          if (interaction.customId === 'comentar') {
            let textinput = new TextInputComponent()
              .setCustomId('comentar-input')
              .setLabel("Escreva seu comentário")
              .setMaxLength(100)
              .setMinLength(1)
              .setStyle("LONG")
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('comentar-modal')
              .setTitle(`Instagram - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'assumirfichaREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`)
              .once("value")
              .then(async function (snap2) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value")
                  .then(async function (snap1) {

                    const Usuario = interaction.guild.members.cache.get(snap2.key)

                    await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`).update({ assumiu: interaction.user.id })

                    const Ficha = new MessageEmbed()
                      .setAuthor({
                        name: 'Recrutamento - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`**Membro:** ${Usuario.user} (\`${Usuario.user.id}\`)\n**Responsável:** <@${interaction.user.id}>\n\n**»** Área(s): **${snap2.val().area}**\n\n*Esta ficha se encontra em andamento...*`)
                      .setColor(config.COLOR)

                    const row = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('1k23k12k3')
                        .setLabel('Ficha em andamento')
                        .setDisabled(true)
                    )
                      .addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Ir até o canal')
                          .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${snap2.val().canal}`)
                      )

                    await interaction.guild.channels.cache.get(snap1.val().canalfichas).messages.fetch({ around: snap2.val().ficha, limit: 1 }).then(msg => {
                      msg.first().edit({ embeds: [Ficha], components: [row] });
                    });

                    const Migracao = new MessageEmbed()
                      .setAuthor({
                        name: 'Recrutamento - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`**Membro:** ${Usuario.user} (\`${Usuario.user.id}\`)\n**Responsável:** <@${interaction.user.id}>\n\n**»** Área(s): **${snap2.val().area}**`)
                      .setColor(config.COLOR)
                      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

                    const row3 = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('excluirREC')
                        .setLabel('Cancelar')
                    )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('callREC')
                          .setLabel('Criar Call')
                          .setEmoji(`${emojis.sound}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('cargoREC')
                          .setLabel('Definir Cargo')
                          .setEmoji(`${emojis.listverify}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('aceitarREC')
                          .setLabel('Concluir')
                          .setEmoji(`${emojis.right}`)
                      )

                    interaction.update({ embeds: [Migracao], components: [row3] });
                  });
              });
          }

          if (customId === 'aceitarREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            var arr = [];

            let Error2 = new MessageEmbed()
              .setAuthor({
                name: 'Sem permissão',
                iconURL: imgur.Cancelado,
                url: null
              })
              .setDescription(`Esta ficha não foi assumida por você, então você não pode concluir a mesma.`)
              .setColor(config.COLOR)

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", snapshot1 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`)
                  .once("value", async snapshot4 => {

                    if (interaction.user.id !== snapshot4.val().assumiu) return interaction.reply({ embeds: [Error2], ephemeral: true })

                    database
                      .ref(`Servidores/${interaction.guild.id}/Recrutamento/ADM/${interaction.user.id}`)
                      .once("value", async contar => {

                        database
                          .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/cargos`)
                          .once("value", snapshot => {

                            var msgArr = [];

                            if (interaction.guild.channels.cache.get(snapshot4.val().canalvoz)) {
                              interaction.guild.channels.cache.get(snapshot4.val().canalvoz).delete();
                            }

                            if (!contar.val()) {
                              if (snapshot.val()) {
                                snapshot.val().forEach(msg => {
                                  msgArr.push(
                                    `<@${msg.membro}> - Cargo: <@&${msg.cargo}>\n`
                                  );

                                  interaction.guild.members.cache.get(msg.membro).roles.add(msg.cargo).catch(err => { });
                                })
                              } else {
                                msgArr.push(`Nenhum cargo foi definido.`)
                              }

                              msgArr = msgArr.join(``)

                              const Logs = new MessageEmbed()
                                .setAuthor({
                                  name: `Recrutamento - ` + interaction.guild.name,
                                  iconURL: interaction.guild.iconURL({ dynamic: true }),
                                  url: null
                                })
                                .setColor('FFFFFF')
                                .setDescription(` **RECRUTAMENTO CONCLUIDO**\n\n **Membro(s):** <@${chn.topic}>\n **Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}`)
                                .setFooter({ text: `${interaction.user.tag} já recrutou 1 membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                              database.ref(`Servidores/${interaction.guild.id}/Recrutamento/ADM/${interaction.user.id}`).update({ count: 1 })
                              interaction.guild.channels.cache.get(snapshot1.val().canal_logs7).send({ embeds: [Logs] })

                              const MigracaoM = new MessageEmbed()
                                .setAuthor({
                                  name: 'Recrutamento - ' + interaction.guild.name,
                                  iconURL: interaction.guild.iconURL({ dynamic: true }),
                                  url: null
                                })
                                .setColor('FFFFFF')
                                .setDescription(`O Recrutamento foi concluído com sucesso e será finalizado em breve.`)
                                .addFields({ name: `${emojis.bol} Informações:`, value: `・ **Membro(s):** <@${chn.topic}>\n・ **Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}` })
                                .setFooter({ text: `Todos os canais deste recrutamento serão deletados em 10 segundo(s).` })

                              interaction.reply({ embeds: [MigracaoM] })

                              interaction.guild.channels.cache.get(snapshot1.val().canalfichas).messages.fetch({ around: snapshot4.val().ficha, limit: 1 }).then(m => {
                                m.first().delete();
                              })

                              setTimeout(async () => {
                                await interaction.guild.channels.cache.get(snapshot4.val().canal).delete();
                              }, 10000);

                              setTimeout(async () => {
                                await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`).remove();
                              }, 15000);

                            } else {

                              var countz = Number(contar.val().count + 1)
                              database.ref(`Servidores/${interaction.guild.id}/Recrutamento/ADM/${interaction.user.id}`).update({ count: countz })

                              if (snapshot.val()) {
                                snapshot.val().forEach(msg => {
                                  msgArr.push(
                                    `<@${msg.membro}> - Cargo: <@&${msg.cargo}>\n`
                                  );

                                  interaction.guild.members.cache.get(msg.membro).roles.add(msg.cargo).catch(err => { });
                                })
                              } else {
                                msgArr.push(`Nenhum cargo foi definido.`)
                              }

                              msgArr = msgArr.join(``)

                              const Logs = new MessageEmbed()
                                .setAuthor({
                                  name: `Recrutamento - ` + interaction.guild.name,
                                  iconURL: interaction.guild.iconURL({ dynamic: true }),
                                  url: null
                                })
                                .setColor('FFFFFF')
                                .setDescription(` **RECRUTAMENTO CONCLUIDO**\n\n **Membro(s):** <@${chn.topic}>\n **Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}`)
                                .setFooter({ text: `${interaction.user.tag} já recrutou ${countz} membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                              interaction.guild.channels.cache.get(snapshot1.val().canal_logs7).send({ embeds: [Logs] })

                              const MigracaoM = new MessageEmbed()
                                .setAuthor({
                                  name: 'Recrutamento - ' + interaction.guild.name,
                                  iconURL: interaction.guild.iconURL({ dynamic: true }),
                                  url: null
                                })
                                .setColor('FFFFFF')
                                .setDescription(`O Recrutamento foi concluído com sucesso e será finalizado em breve.`)
                                .addFields({ name: `${emojis.bol} Informações:`, value: `・ **Membro(s):** <@${chn.topic}>\n・ **Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}` })
                                .setFooter({ text: `Todos os canais deste recrutamento serão deletados em 10 segundo(s).` })

                              interaction.reply({ embeds: [MigracaoM] })

                              interaction.guild.channels.cache.get(snapshot1.val().canalfichas).messages.fetch({ around: snapshot4.val().ficha, limit: 1 }).then(m => {
                                m.first().delete();
                              });

                              setTimeout(async () => {
                                await interaction.guild.channels.cache.get(snapshot4.val().canal).delete();
                              }, 10000);

                              setTimeout(async () => {
                                await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`).remove();
                              }, 15000);

                            }
                          });
                      });
                  });
              });
          }

          if (customId === 'cargoconcluirREC') {
            var msgArr = [];

            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            database
              .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/cargos`)
              .once("value", async snap2 => {

                if (snap2.val()) {
                  snap2.val().forEach(msg => {
                    msgArr.push(
                      `<@&${msg.cargo}>`
                    );
                  });

                } else {
                  msgArr.push(`<@&${cargo}>`)
                }

                msgArr = msgArr.join(`\n`)

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setAuthor({
                    name: 'Recrutamento - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS DEFINIDOS:**\n${msgArr}`)
                  .setFooter({ text: `Os cargos só serão adicionados após concluir o recrutamento.` })

                interaction.reply({ embeds: [Embed] });
                interaction.message.delete().catch(err => { });
              });
          }

          if (customId === 'cargoremoverREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/`).remove();

            const Embed = new MessageEmbed()
              .setColor(config.COLOR)
              .setAuthor({
                name: 'Recrutamento - ' + interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
                url: null
              })
              .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS:**\nNenhum cargo definido.`)
              .setFooter({ text: `Os cargos só serão adicionados após concluir o recrutamento.` })

            interaction.message.edit({ embeds: [Embed] });

            const Embed2 = new MessageEmbed()
              .setColor(config.COLOR)
              .setDescription(`Os cargos definidos anteriormente foram removidos por ${interaction.user}.`)

            interaction.reply({ embeds: [Embed2] })
          }

          if (customId === 'definircargoREC') {
            var msgArr = [];

            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const filter = m => m.author.id === interaction.user.id
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            interaction.reply({ content: `> **»** Insira ou mencione o ID do cargo.`, ephemeral: true }).catch(err => { })

            await interaction.channel.awaitMessages({
              filter,
              max: 1,
              time: 60000,
              errors: ["time"]
            }).then(async collected => {
              collected.first().delete().catch(err => { });

              database
                .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos`)
                .once("value", async snap => {

                  database
                    .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/cargos`)
                    .once("value", async snap2 => {

                      const cargomencao = collected.first().mentions.roles.first()
                      const cargoid = interaction.guild.roles.cache.get(collected.first().content)

                      if (!cargomencao && !cargoid) return interaction.editReply({ content: `> **»** Você precisa mencionar um cargo ou inserir o ID.`, ephemeral: true })

                      const cargo = cargomencao ? cargomencao.id : collected.first().content

                      const cargosetado = interaction.guild.roles.cache.get(cargo).rawPosition
                      const cargomigrador = interaction.guild.members.cache.get(interaction.user.id).roles.highest.rawPosition

                      if (cargosetado > cargomigrador) return interaction.editReply({ content: `> **»** Você não pode recrutar alguém inserindo um cargo maior que o seu.`, ephemeral: true })

                      if (snap2.val()) {
                        snap2.val().forEach(msg => {
                          msgArr.push(
                            `<@&${msg.cargo}>`
                          );
                        });

                      } else {
                        msgArr.push(`<@&${cargo}>`)
                      }

                      msgArr = msgArr.join(`\n`)

                      const Embed = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setAuthor({
                          name: 'Recrutamento - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}\n\n**ULTIMO CARGO ADICIONADO:** \n<@&${cargo}>`)
                        .setFooter({ text: `Os cargos só serão adicionados após concluir o recrutamento.` })

                      interaction.editReply(`> **»** O cargo <@&${cargo}> foi definido com sucesso.`);

                      if (!snap.val()) {
                        await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/`).set({ cargos: [{ cargo: cargo, membro: membro.user.id }] })
                        interaction.message.edit({ embeds: [Embed] });
                      } else {
                        await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/cargos`).update({ [`${Object.keys(snap.val().cargos).length}`]: { cargo: cargo, membro: membro.user.id } })
                        interaction.message.edit({ embeds: [Embed] });
                      }
                    });
                });
            });
          }

          if (customId === 'cargoREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const membro = interaction.guild.members.cache.get(chn.topic)

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true })

            database
              .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Cargos/cargos`)
              .once("value", async snap2 => {

                var msgArr = [];

                if (snap2.val()) {
                  snap2.val().forEach(msg => {
                    msgArr.push(
                      `<@&${msg.cargo}>\n`
                    );
                  })
                } else {
                  msgArr.push(`Nenhum cargo foi definido.`)
                }

                msgArr = msgArr.join(``)

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setAuthor({
                    name: 'Recrutamento - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}`)
                  .setFooter({ text: `Os cargos só serão adicionados após concluir o recrutamento.` })

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('DANGER')
                    .setCustomId('cargoremoverREC')
                    .setLabel('Remover Cargos')
                )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('definircargoREC')
                      .setLabel('Definir Cargo')
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SUCCESS')
                      .setCustomId('cargoconcluirREC')
                      .setLabel('Concluir')
                  )

                interaction.reply({ embeds: [Embed], components: [row] });
              });
          }

          if (customId === 'callREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            var usuario = interaction.guild.members.cache.get(chn.topic);

            database
              .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`)
              .once("value", async snap2 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value", async configs => {

                    const CriadoCanal = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setDescription(`**»** Um canal de voz já foi criado.`)

                    if (snap2.val().canalvoz) return interaction.reply({ embeds: [CriadoCanal], ephemeral: true })

                    interaction.guild.channels.create(`📋・${usuario.user.username}`, {
                      permissionOverwrites: [
                        {
                          type: 'member',
                          id: chn.topic,
                          allow: ['STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.everyone,
                          deny: ['VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.cache.get(configs.val().migracargo),
                          allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                      ],
                      type: 'GUILD_VOICE',
                      parent: configs.val().migracategoria
                    }).then(async channel => {

                      await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`).update({ canalvoz: channel.id })

                      let invite = await channel.createInvite(
                        {
                          maxAge: 10 * 60 * 1000,
                          maxUses: 2
                        },
                        `Suporte por ${interaction.user.tag}`
                      ).catch(err => { })

                      const CanalVoz = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setDescription(`**»** Canal de voz criado, para se conectar ao mesmo clique no botão abaixo.`)

                      const row = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Conectar ao Canal de Voz')
                          .setURL(`${invite}`)
                      )

                      await interaction.reply({ embeds: [CanalVoz], components: [row] });

                      var arr = [];
                      database
                        .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}/Membro`)
                        .once("value")
                        .then(async function (snap) {

                          if (!snap) return;

                          snap.forEach(v => {
                            arr.push({
                              ID: v.key
                            });

                            var lista = arr.slice(0);

                            lista.forEach(u => {
                              const membro = interaction.guild.members.cache.get(u.ID)

                              if (!membro) return;

                              channel.permissionOverwrites.edit(membro, {
                                STREAM: true,
                                CONNECT: true,
                                SPEAK: true,
                                VIEW_CHANNEL: true
                              });
                            });
                          });
                        });
                    });
                  });
              });
          }

          if (customId === 'excluirREC') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snap1 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`)
                  .once("value", async snap2 => {

                    await interaction.guild.channels.cache.get(snap1.val().canalfichas).messages.fetch({ around: snap2.val().ficha, limit: 1 }).then(m => {
                      m.first().delete();
                    })

                    if (interaction.guild.channels.cache.get(snap2.val().canalvoz)) {
                      await interaction.guild.channels.cache.get(snap2.val().canalvoz).delete();
                    }

                    const ExcluirM = new MessageEmbed()
                      .setAuthor({
                        name: 'Recrutamento - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setColor(config.COLOR)
                      .setDescription(`O Recrutamento foi cancelado e será finalizado em breve.`)
                      .setFooter({ text: `Todos os canais deste recrutamento serão deletados em 5 segundo(s).` })

                    await interaction.reply({ embeds: [ExcluirM] });

                    await database.ref(`Servidores/${interaction.guild.id}/Recrutamento/${chn.topic}`).remove();

                    setTimeout(async () => {
                      await interaction.guild.channels.cache.get(snap2.val().canal).delete();
                    }, 5000);
                  });
              });
          }

          if (customId === 'assumirficha') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`)
              .once("value")
              .then(async function (snap2) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value")
                  .then(async function (snap1) {

                    const Usuario = interaction.guild.members.cache.get(snap2.key)

                    await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`).update({ assumiu: interaction.user.id })

                    const Ficha = new MessageEmbed()
                      .setAuthor({
                        name: 'Migração - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`**Membro:** ${Usuario.user} (\`${Usuario.user.id}\`)\n**Responsável:** <@${interaction.user.id}>\n\n**»** Pessoas que vão vir: **${snap2.val().quantidade}**\n**»** URL do Servidor: **${snap2.val().servidor}**\n\n*Esta ficha se encontra em andamento...*`)
                      .setColor(config.COLOR)

                    const row = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('botaodesativado')
                        .setLabel('Ficha em andamento')
                        .setDisabled(true)
                    )
                      .addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Ir até o canal')
                          .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${snap2.val().canal}`)
                      )


                    await interaction.guild.channels.cache.get(snap1.val().canalfichas).messages.fetch({ around: snap2.val().ficha, limit: 1 }).then(msg => {
                      msg.first().edit({ embeds: [Ficha], components: [row] });
                    });

                    const Migracao = new MessageEmbed()
                      .setAuthor({
                        name: 'Migração - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`**Membro:** ${Usuario.user} (\`${Usuario.user.id}\`)\n**Responsável:** <@${interaction.user.id}>\n\n**»** Pessoas que vão vir: **${snap2.val().quantidade}**\n**»** URL do Servidor: **${snap2.val().servidor}**`)
                      .setColor(config.COLOR)
                      .setThumbnail(interaction.guild.iconURL({ dynamic: true }))

                    const row3 = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('excluirM')
                        .setLabel('Cancelar')
                    )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('callM')
                          .setLabel('Criar Call')
                          .setEmoji(`${emojis.sound}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('addM')
                          .setLabel('Adicionar Membro')
                          .setEmoji(`${emojis.group2}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('remM')
                          .setLabel('Remover Membro')
                          .setEmoji(`${emojis.group2}`)
                      )

                    const row4 = new MessageActionRow()
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('cargoM')
                          .setLabel('Definir Cargo')
                          .setEmoji(`${emojis.listverify}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('aceitarM')
                          .setLabel('Concluir')
                          .setEmoji(`${emojis.right}`)
                      )

                    interaction.update({ embeds: [Migracao], components: [row3, row4] });
                  });
              });
          }

          if (customId === 'aceitarM') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            var arr = [];

            let Error2 = new MessageEmbed()
              .setAuthor({
                name: 'Sem permissão',
                iconURL: imgur.Cancelado,
                url: null
              })
              .setDescription(`Esta ficha não foi assumida por você, então você não pode concluir a mesma.`)
              .setColor(config.COLOR)

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", snapshot1 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Membro`)
                  .once("value", snapshot2 => {

                    database
                      .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`)
                      .once("value", async snapshot4 => {

                        if (interaction.user.id !== snapshot4.val().assumiu) return interaction.reply({ embeds: [Error2], ephemeral: true })

                        database
                          .ref(`Servidores/${interaction.guild.id}/Migracao/ADM/${interaction.user.id}`)
                          .once("value", async contar => {

                            database
                              .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/cargos`)
                              .once("value", snapshot => {

                                var msgArr = [];

                                if (interaction.guild.channels.cache.get(snapshot4.val().canalvoz)) {
                                  interaction.guild.channels.cache.get(snapshot4.val().canalvoz).delete();
                                }

                                if (!contar.val()) {
                                  if (snapshot.val()) {
                                    snapshot.val().forEach(msg => {
                                      msgArr.push(
                                        `<@${msg.membro}> - Cargo: <@&${msg.cargo}>\n`
                                      );

                                      interaction.guild.members.cache.get(msg.membro).roles.add(msg.cargo).catch(err => { });
                                    })
                                  } else {
                                    msgArr.push(`Nenhum cargo foi definido.`)
                                  }

                                  var msgArr2 = [];

                                  if (snapshot2.val()) {
                                    snapshot2.forEach(v => {
                                      arr.push({
                                        ID: v.key,
                                      });
                                    });

                                    var lista = arr.slice(0);

                                    lista.forEach(u => {
                                      msgArr2.push(
                                        `<@${u.ID}>`
                                      );
                                    });
                                  } else {
                                    msgArr2.push(`Esta migração contém apenas 1 membro.`)
                                  }

                                  var msg2 = msgArr2.join(`, `);
                                  msgArr = msgArr.join(``)

                                  const Logs = new MessageEmbed()
                                    .setAuthor({
                                      name: `Migração - ` + interaction.guild.name,
                                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                                      url: null
                                    })
                                    .setColor('FFFFFF')
                                    .setDescription(` **MIGRAÇÃO CONCLUIDA**\n\n **Membro(s):** <@${chn.topic}> - ${msg2}\n **Responsável:** ${interaction.user}\n**URL:** ${snapshot4.val().servidor}\n\n**CARGOS:**\n${msgArr}`)
                                    .setFooter({ text: `${interaction.user.tag} já migrou 1 membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                                  database.ref(`Servidores/${interaction.guild.id}/Migracao/ADM/${interaction.user.id}`).update({ count: 1 })
                                  interaction.guild.channels.cache.get(snapshot1.val().canal_logs6).send({ embeds: [Logs] })

                                  const MigracaoM = new MessageEmbed()
                                    .setAuthor({
                                      name: 'Migração - ' + interaction.guild.name,
                                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                                      url: null
                                    })
                                    .setColor('FFFFFF')
                                    .setDescription(`A Migração foi concluída com sucesso e será finalizado em breve.`)
                                    .addFields({ name: `${emojis.bol} Informações:`, value: `・ **Membro:** <@${chn.topic}> - ${msg2}\n・ **Responsável:** ${interaction.user}\n・ **URL:** ${snapshot4.val().servidor}\n\n**CARGOS:**\n${msgArr}` })
                                    .setFooter({ text: `Todos os canais desta migração serão deletados em 10 segundo(s).` })

                                  interaction.reply({ embeds: [MigracaoM] })

                                  interaction.guild.channels.cache.get(snapshot1.val().canalfichas).messages.fetch({ around: snapshot4.val().ficha, limit: 1 }).then(m => {
                                    m.first().delete();
                                  })

                                  setTimeout(async () => {
                                    await interaction.guild.channels.cache.get(snapshot4.val().canal).delete();
                                  }, 10000);

                                  setTimeout(async () => {
                                    await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`).remove();
                                  }, 15000);
                                } else {

                                  var countz = Number(contar.val().count + 1)
                                  database.ref(`Servidores/${interaction.guild.id}/Migracao/ADM/${interaction.user.id}`).update({ count: countz })

                                  if (snapshot.val()) {
                                    snapshot.val().forEach(msg => {
                                      msgArr.push(
                                        `<@${msg.membro}> - Cargo: <@&${msg.cargo}>\n`
                                      );

                                      interaction.guild.members.cache.get(msg.membro).roles.add(msg.cargo).catch(err => { });
                                    })
                                  } else {
                                    msgArr.push(`Nenhum cargo foi definido.`)
                                  }

                                  var msgArr2 = [];

                                  if (snapshot2.val()) {
                                    snapshot2.forEach(v => {
                                      arr.push({
                                        ID: v.key,
                                      });
                                    });

                                    var lista = arr.slice(0);

                                    lista.forEach(u => {
                                      msgArr2.push(
                                        `<@${u.ID}>`
                                      );
                                    });
                                  } else {
                                    msgArr2.push(`Esta migração contém apenas 1 membro.`)
                                  }

                                  var msg2 = msgArr2.join(`, `);
                                  msgArr = msgArr.join(``)

                                  const Logs = new MessageEmbed()
                                    .setAuthor({
                                      name: `Migração - ` + interaction.guild.name,
                                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                                      url: null
                                    })
                                    .setColor('FFFFFF')
                                    .setDescription(` **MIGRAÇÃO CONCLUIDA**\n\n **Membro(s):** <@${chn.topic}> - ${msg2}\n **Responsável:** ${interaction.user}\n<:z_padlock:1062431058756374619> **URL:** ${snapshot4.val().servidor}\n\n**CARGOS:**\n${msgArr}`)
                                    .setFooter({ text: `${interaction.user.tag} já migrou ${countz} membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                                  interaction.guild.channels.cache.get(snapshot1.val().canal_logs6).send({ embeds: [Logs] })

                                  const MigracaoM = new MessageEmbed()
                                    .setAuthor({
                                      name: `Migração - ` + interaction.guild.name,
                                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                                      url: null
                                    })
                                    .setColor('FFFFFF')
                                    .setDescription(`A Migração foi concluída com sucesso e será finalizado em breve.`)
                                    .addFields({ name: `${emojis.bol} Informações:`, value: `・ **Membro:** <@${chn.topic}> - ${msg2}\n・ **Responsável:** ${interaction.user}\n・ **URL:** ${snapshot4.val().servidor}\n\n**CARGOS:**\n${msgArr}` })
                                    .setFooter({ text: `Todos os canais desta migração serão deletados em 10 segundo(s).` })

                                  interaction.reply({ embeds: [MigracaoM] })

                                  interaction.guild.channels.cache.get(snapshot1.val().canalfichas).messages.fetch({ around: snapshot4.val().ficha, limit: 1 }).then(m => {
                                    m.first().delete();
                                  });

                                  setTimeout(async () => {
                                    await interaction.guild.channels.cache.get(snapshot4.val().canal).delete();
                                  }, 10000);

                                  setTimeout(async () => {
                                    await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`).remove();
                                  }, 15000);
                                }
                              });
                          });
                      });
                  });
              });
          }

          if (customId === 'cargoM') {
            let textinput = new TextInputComponent()
              .setCustomId('cargoM-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('cargoM-modal')
              .setTitle(`Migração - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'cargoconcluirMIG') {
            var msgArr = [];

            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            database
              .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/cargos`)
              .once("value", async snap2 => {

                if (snap2.val()) {
                  snap2.val().forEach(msg => {
                    msgArr.push(
                      `<@&${msg.cargo}>`
                    );
                  });

                } else {
                  msgArr.push(`<@&${cargo}>`)
                }

                msgArr = msgArr.join(`\n`)

                const Embed = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setAuthor({
                    name: 'Migração - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS DEFINIDOS:**\n${msgArr}`)
                  .setFooter({ text: `Os cargos só serão adicionados após concluir a migração.` })

                interaction.reply({ embeds: [Embed] });
                interaction.message.delete().catch(err => { });
              });
          }

          if (customId === 'cargoremoverMIG') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/`).remove();

            const Embed = new MessageEmbed()
              .setColor(config.COLOR)
              .setAuthor({
                name: 'Migração - ' + interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
                url: null
              })
              .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS:**\nNenhum cargo definido.`)
              .setFooter({ text: `Os cargos só serão adicionados após concluir a migração.` })

            interaction.message.edit({ embeds: [Embed] });

            const Embed2 = new MessageEmbed()
              .setColor(config.COLOR)
              .setDescription(`Os cargos definidos anteriormente foram removidos por ${interaction.user}.`)

            interaction.reply({ embeds: [Embed2] })
          }

          if (customId === 'definircargoMIG') {
            var msgArr = [];

            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            const filter = m => m.author.id === interaction.user.id
            const membro = interaction.guild.members.cache.get(chn.topic);

            if (!membro) return interaction.reply({ content: `<@${chn.topic}> não está mais no servidor.`, ephemeral: true }).catch(err => { })

            interaction.reply({ content: `> **»** Insira ou mencione o ID do cargo.`, ephemeral: true }).catch(err => { })

            await interaction.channel.awaitMessages({
              filter,
              max: 1,
              time: 60000,
              errors: ["time"]
            }).then(async collected => {
              collected.first().delete().catch(err => { });

              database
                .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos`)
                .once("value", async snap => {

                  database
                    .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/cargos`)
                    .once("value", async snap2 => {

                      const cargomencao = collected.first().mentions.roles.first()
                      const cargoid = interaction.guild.roles.cache.get(collected.first().content)

                      if (!cargomencao && !cargoid) return interaction.editReply({ content: `> **»** Você precisa mencionar um cargo ou inserir o ID.`, ephemeral: true })

                      const cargo = cargomencao ? cargomencao.id : collected.first().content

                      const cargosetado = interaction.guild.roles.cache.get(cargo).rawPosition
                      const cargomigrador = interaction.guild.members.cache.get(interaction.user.id).roles.highest.rawPosition

                      if (cargosetado > cargomigrador) return interaction.editReply({ content: `> **»** Você não pode recrutar alguém inserindo um cargo maior que o seu.`, ephemeral: true })

                      if (snap2.val()) {
                        snap2.val().forEach(msg => {
                          msgArr.push(
                            `<@&${msg.cargo}>`
                          );
                        });

                      } else {
                        msgArr.push(`<@&${cargo}>`)
                      }

                      msgArr = msgArr.join(`\n`)

                      const Embed = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setAuthor({
                          name: 'Migração - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${interaction.user}\n\n**CARGOS:**\n${msgArr}\n\n**ULTIMO CARGO ADICIONADO:** \n<@&${cargo}>`)
                        .setFooter({ text: `Os cargos só serão adicionados após concluir a migração.` })

                      interaction.editReply(`> **»** O cargo <@&${cargo}> foi definido com sucesso.`);

                      if (!snap.val()) {
                        await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/`).set({ cargos: [{ cargo: cargo, membro: membro.user.id }] })
                        interaction.message.edit({ embeds: [Embed] });
                      } else {
                        await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Cargos/cargos`).update({ [`${Object.keys(snap.val().cargos).length}`]: { cargo: cargo, membro: membro.user.id } })
                        interaction.message.edit({ embeds: [Embed] });
                      }
                    });
                });
            });
          }

          if (customId === 'callM') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            var usuario = interaction.guild.members.cache.get(chn.topic);

            database
              .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`)
              .once("value", async snap2 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value", async configs => {

                    const CriadoCanal = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setDescription(`**»** Um canal de voz já foi criado.`)

                    if (snap2.val().canalvoz) return interaction.reply({ embeds: [CriadoCanal], ephemeral: true })

                    interaction.guild.channels.create(`👑・${usuario.user.username}`, {
                      permissionOverwrites: [
                        {
                          type: 'member',
                          id: chn.topic,
                          allow: ['STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.everyone,
                          deny: ['VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.cache.get(configs.val().migracargo),
                          allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                      ],
                      type: 'GUILD_VOICE',
                      parent: configs.val().migracategoria
                    }).then(async channel => {

                      await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`).update({ canalvoz: channel.id })

                      let invite = await channel.createInvite(
                        {
                          maxAge: 10 * 60 * 1000,
                          maxUses: 5
                        },
                        `Suporte por ${interaction.user.tag}`
                      ).catch(err => { })

                      const CanalVoz = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setDescription(`**»** Canal de voz criado, para se conectar ao mesmo clique no botão abaixo.`)

                      const row = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Conectar ao Canal de Voz')
                          .setURL(`${invite}`)
                      )

                      await interaction.reply({ embeds: [CanalVoz], components: [row] });

                      var arr = [];
                      database
                        .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}/Membro`)
                        .once("value")
                        .then(async function (snap) {

                          if (!snap) return;

                          snap.forEach(v => {
                            arr.push({
                              ID: v.key
                            });

                            var lista = arr.slice(0);

                            lista.forEach(u => {
                              const membro = interaction.guild.members.cache.get(u.ID)

                              if (!membro) return;

                              channel.permissionOverwrites.edit(membro, {
                                STREAM: true,
                                CONNECT: true,
                                SPEAK: true,
                                VIEW_CHANNEL: true
                              });
                            });
                          });
                        });
                    });
                  });
              });
          }

          if (customId === 'excluirM') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snap1 => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`)
                  .once("value", async snap2 => {

                    await interaction.guild.channels.cache.get(snap1.val().canalfichas).messages.fetch({ around: snap2.val().ficha, limit: 1 }).then(m => {
                      m.first().delete();
                    })

                    if (interaction.guild.channels.cache.get(snap2.val().canalvoz)) {
                      await interaction.guild.channels.cache.get(snap2.val().canalvoz).delete();
                    }

                    const ExcluirM = new MessageEmbed()
                      .setAuthor({
                        name: `Migração - ` + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setColor(config.COLOR)
                      .setDescription(`A Migração foi cancelada e será finalizado em breve.`)
                      .setFooter({ text: `Todos os canais desta migração serão deletados em 5 segundo(s).` })

                    await interaction.reply({ embeds: [ExcluirM] });

                    await database.ref(`Servidores/${interaction.guild.id}/Migracao/${chn.topic}`).remove();

                    setTimeout(async () => {
                      await interaction.guild.channels.cache.get(snap2.val().canal).delete();
                    }, 5000);
                  });
              });
          }

          if (customId === 'listinfluencer') {
            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Influencer/${interaction.user.id}`)
              .once("value")
              .then(async function (snap2) {

                if (!snap2.val() && interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "452225239032791062"
                  && interaction.member.id !== "1015229792276201542"
                  && interaction.member.id !== "452225239032791062") {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                var arr = [];
                var counter = 0;

                database
                  .ref(`Servidores/${interaction.guild.id}/Influencer`)
                  .once("value", snapshot => {

                    if (!snapshot.val()) {
                      interaction.reply({ content: `> Não há ninguém em influencer.`, ephemeral: true })
                      return;
                    }

                    snapshot.forEach(v => {
                      arr.push({
                        ID: v.val().dono,
                        MENSAGEM: v.key
                      });

                      counter++;

                      if (counter === snapshot.numChildren()) {
                        arr.sort(function (a, b) {
                          return b - a;
                        });

                        var lista = arr.slice(0);
                        var msgArr = [];
                        var count = 0;

                        lista.forEach(u => {
                          msgArr.push(
                            `> <@${u.ID}> (\`${u.ID}\`) [Clique aqui para ir até a publicação](https://discord.com/channels/${interaction.guild.id}/${config.CanalInfluencer}/${u.MENSAGEM})\n`
                          );

                          count++;
                          if (count == lista.length) {
                            var msg2 = msgArr.join(``);

                            const chunks = Util.splitMessage(msg2);

                            let Teste = new MessageEmbed()
                              .setAuthor({
                                name: 'LISTA DE INFLUENCERS - ' + interaction.guild.name,
                                iconURL: imgur.Lista,
                                url: null
                              })
                              .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                              .setColor(config.COLOR)


                            interaction.reply({ content: `> Enviando lista...`, ephemeral: true })

                            setTimeout(async () => {

                              if (chunks.length > 1) {
                                chunks.forEach((chunk, i) =>
                                  interaction.followUp({
                                    embeds: [Teste.setDescription(chunk).setFooter({
                                      text: `Lista ${i + 1} / ${chunks.length}`,
                                    })], ephemeral: true
                                  })
                                );
                              } else {
                                interaction.followUp({ embeds: [Teste.setDescription(chunks[0])], ephemeral: true })
                              }
                            }, 300);
                          }
                        });
                      }
                    });
                  });
              });
          }

          if (customId === 'canalinf') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canalinfluencer: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Influencer:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'cargoinfadm') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo da equipe de influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargoinfadm: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo da Equipe de Influencer:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'cargoinf') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargoinf: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Inlfuencer:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'msginf') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal do tellonym (para publicar) no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    if (snap2.val()) {
                      if (snap2.val().tellonym) {
                        var banner = snap2.val().tellonym;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Tellonym:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                    const Influencer = new MessageEmbed()
                      .setAuthor({
                        name: 'Influencer - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`Sistema de influencer totalmente automático, siga os passos abaixo.`)
                      .addFields({
                        name: `Como funciona?`,
                        value: `\`1\` Clique no botão abaixo e insira as informações pedidas;\n\`2\` Após inserir as informações basta publicar.`
                      })
                      .setColor(config.COLOR)
                      .setImage(banner)

                    const row = new MessageActionRow()
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('addinf')
                          .setLabel(`Enviar Influencer`)
                      )

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [Influencer], components: [row] })
                  });
              }
            });
          }

          if (customId === 'addinf') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val().cargoinfadm) return;

                if (!interaction.member.roles.cache.has(snapshot.val().cargoinfadm)) {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                const Embed = new MessageEmbed()
                  .setDescription(`Envie o novo influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [Embed] }).catch(err => { });

                const filter = m => m.author.id === interaction.user.id
                await interaction.channel.awaitMessages({
                  filter,
                  max: 1
                }).then(async collected => {
                  setTimeout(async () => {
                    await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                    await interaction.deleteReply().catch(err => { });
                  }, 150);

                  if (collected.first().content.includes('cancelar')) {
                    return;
                  }

                  var vUser = collected.first().content.replace(/\D/g, '');

                  if (interaction.guild.members.cache.get(vUser)) {
                    const Usuario = interaction.guild.members.cache.get(vUser);

                    const EmbedInfluencer = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setAuthor({
                        name: `Influencer - ` + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setThumbnail(Usuario.user.avatarURL({ dynamic: true }))
                      .addFields({ name: `${emojis.trophy} Influencer:`, value: `${Usuario}` })

                    const row = new MessageActionRow()
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setLabel('Publicar')
                          .setCustomId('enviarinfluencer')
                          .setEmoji(`${emojis.right}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setLabel('Definir Foto')
                          .setCustomId('definirfoto')
                          .setEmoji(`${emojis.cam}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setLabel('Definir Instagram')
                          .setCustomId('definirinstagram')
                          .setEmoji(`${emojis.coracao}`)
                      )

                    database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`).update({ colocou: Usuario.user.id, imagem: false, instagram: false })

                    interaction.channel.send({ embeds: [EmbedInfluencer], components: [row] })
                  }
                });
              });
          }

          if (customId === 'enviarinfluencer') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snapshot) {

                if (!snapshot.val().cargoinfadm) return;
                if (!snapshot.val().canalinfluencer) return;

                if (!interaction.member.roles.cache.has(snapshot.val().cargoinfadm)) {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                database
                  .ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`)
                  .once("value", async verificar => {

                    if (!verificar.val()) return;

                    await interaction.message.delete().catch(err => { });

                    const Usuario = interaction.guild.members.cache.get(verificar.val().colocou)
                    interaction.reply({ content: `> **»** Estamos preparando sua publicação, a mesma será enviada no canal <#${snapshot.val().canalinfluencer}>`, ephemeral: true })

                    const EmbedInfluencer = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setAuthor({
                        name: `Influencer - ` + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setThumbnail(Usuario.user.avatarURL({ dynamic: true }))
                      .addFields({ name: `${emojis.trophy} Influencer:`, value: `${Usuario}` })

                    Usuario.roles.add(snapshot.val().cargoinf);
                    interaction.guild.channels.cache.get(snapshot.val().canalinfluencer).send({ embeds: [EmbedInfluencer] });

                    const row = new MessageActionRow()
                      .addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('darlike')
                          .setLabel('0')
                          .setEmoji(`${emojis.coracao}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Instagram')
                          .setEmoji(`${emojis.instanovo}`)
                          .setURL(`${verificar.val().instagram}`)
                      )
                      .addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Discord')
                          .setEmoji(`${emojis.discordlogo}`)
                          .setURL(`https://discord.com/users/${verificar.val().colocou}`)
                      )

                    interaction.guild.channels.cache.get(snapshot.val().canalinfluencer).send({ files: [verificar.val().imagem], components: [row] }).then(m => {
                      database.ref(`Servidores/${interaction.guild.id}/Influencer/${m.id}`).update({ dono: Usuario.user.id, instagram: verificar.val().instagram })
                      database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`).remove();
                    });
                  });
              });
          }

          if (customId === 'darlike') {
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.message.id}/Curtiu`)
              .once("value", async snapshot => {

                snapshot.forEach(v => {
                  counter++;
                });

                database
                  .ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.message.id}/Curtiu/${interaction.member.id}`)
                  .once("value", async snapshot2 => {

                    if (!snapshot2.val()) {
                      await database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.message.id}/Curtiu/${interaction.member.id}`).update({ like: interaction.member.id });

                      interaction.message.components[0].components[0].label = Number(counter) + 1;
                      let buttons = interaction.message.components[0];
                      await interaction.update({ components: [buttons] });
                    } else {
                      await database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.message.id}/Curtiu/${interaction.user.id}`).remove();

                      interaction.message.components[0].components[0].label = Number(counter) - 1;
                      let buttons = interaction.message.components[0];
                      await interaction.update({ components: [buttons] });
                    }
                  });;
              });
          }

          if (customId === 'definirfoto') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snapshot) {

                if (!snapshot.val().cargoinfadm) return;

                if (!interaction.member.roles.cache.has(snapshot.val().cargoinfadm)) {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                database
                  .ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`)
                  .once("value", async verificar => {

                    const Usuario = interaction.guild.members.cache.get(verificar.val().colocou)

                    const Embed = new MessageEmbed()
                      .setDescription(`Envie a foto do influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
                      .setColor(config.COLOR)

                    interaction.reply({ embeds: [Embed] });

                    const filter = m => m.author.id === interaction.user.id
                    await interaction.channel.awaitMessages({
                      filter,
                      max: 1
                    }).then(async collected => {
                      setTimeout(async () => {
                        await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                        await interaction.deleteReply().catch(err => { });
                      }, 150);

                      if (collected.first().content.includes('cancelar')) {
                        return;
                      }

                      if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                        const foto = collected.first().attachments.size > 0
                          ? collected.first().attachments.first().url
                          : collected.first().content

                        setTimeout(async () => {
                          await cliente.channels.cache.get('1061082782933196871').send({ files: [foto] }).then(async m => {
                            database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`).update({ imagem: foto })
                          });
                        }, 1000);

                        const EmbedInfluencer = new MessageEmbed()
                          .setColor(config.COLOR)
                          .setAuthor({
                            name: `Influencer - ` + interaction.guild.name,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                            url: null
                          })
                          .setThumbnail(Usuario.user.avatarURL({ dynamic: true }))
                          .addFields({ name: `${emojis.trophy} Influencer:`, value: `${Usuario}` })
                          .setImage(foto)

                        interaction.message.edit({ embeds: [EmbedInfluencer] });
                      }
                    });
                  });
              });
          }

          if (customId === 'definirinstagram') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snapshot) {

                if (!snapshot.val().cargoinfadm) return;

                if (!interaction.member.roles.cache.has(snapshot.val().cargoinfadm)) {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                database
                  .ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`)
                  .once("value", async verificar => {

                    const Usuario = interaction.guild.members.cache.get(verificar.val().colocou)

                    const Embed = new MessageEmbed()
                      .setDescription(`Envie o instagram do influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
                      .setColor(config.COLOR)

                    interaction.reply({ embeds: [Embed] });

                    const filter = m => m.author.id === interaction.user.id

                    await interaction.channel.awaitMessages({
                      filter,
                      max: 1,
                      time: 60000,
                      errors: ["time"]
                    }).then(async collected => {
                      setTimeout(async () => {
                        await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                        await interaction.deleteReply().catch(err => { });
                      }, 150);

                      if (!collected.first().content.includes('https://', 'http://')) return;

                      const instagram = collected.first().content;

                      database.ref(`Servidores/${interaction.guild.id}/Influencer/${interaction.user.id}`).update({ instagram: instagram })

                      const EmbedInfluencer = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setAuthor({
                          name: `Influencer - ` + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setThumbnail(Usuario.user.avatarURL({ dynamic: true }))
                        .addFields({ name: `${emojis.trophy} Influencer:`, value: `${Usuario}` })
                        .setImage(verificar.val().imagem)

                      interaction.message.edit({ embeds: [EmbedInfluencer] });
                    });
                  });
              });
          }

          if (customId === 'suporteiniciar') {
            database
              .ref(`Servidores/${interaction.guild.id}/Suporte/${interaction.user.id}`)
              .once("value", async verificar => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value", async configs => {

                    const JaAbriu = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setDescription(`Você já abriu um pedido de suporte, aguarde o processo ser finalizado.`);

                    if (!verificar.val()) await database.ref(`Servidores/${interaction.guild.id}/Suporte/${interaction.user.id}`).update({ abriu: false, canal: null })

                    if (verificar.val()) {
                      if (verificar.val().abriu === true) {
                        const row = new MessageActionRow().addComponents(
                          new MessageButton()
                            .setStyle('LINK')
                            .setLabel('Clique para ir até seu pedido de Suporte')
                            .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${verificar.val().canal}`)
                        )

                        interaction.reply({ embeds: [JaAbriu], components: [row], ephemeral: true });
                        return;
                      }
                    }

                    database.ref(`Servidores/${interaction.guild.id}/Suporte/${interaction.user.id}`).update({ abriu: true, canal: null })

                    interaction.guild.channels.create(`📞ticket-${interaction.user.tag}`, {
                      topic: interaction.user.id,
                      permissionOverwrites: [
                        {
                          type: 'member',
                          id: interaction.user.id,
                          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'],
                        },
                        {
                          id: interaction.guild.roles.everyone,
                          deny: ['VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.cache.get(configs.val().suportecargo),
                          allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                      ],
                      type: 'GUILD_TEXT',
                      parent: configs.val().suportecategoria
                    }).then(async channel => {

                      await database.ref(`Servidores/${interaction.guild.id}/Suporte/${interaction.user.id}`).update({ canal: channel.id })

                      const AbriuAgora = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setDescription(`Você iniciou um pedido de suporte, para ir até o canal clique no botão abaixo.`);

                      const row2 = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Clique para ir até seu pedido de suporte')
                          .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${channel.id}`)
                      )

                      interaction.reply({ embeds: [AbriuAgora], components: [row2], ephemeral: true })

                      /////////////////////////////////

                      const MensagemVerify = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setAuthor({
                          name: `Suporte - ` + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setTitle(`Suporte - ${interaction.user.tag}`)
                        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                        .setDescription(`Você está em um canal em contato com a nossa equipe de suporte, em breve o responsável pelo suporte irá lhe atender.`)
                        .addFields({ name: `Necessário:`, value: `\`1\` Não abrir suporte para assuntos desnecessários;\n\`2\` Seguir todas as regras do servidor.` })

                      const row3 = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('DANGER')
                          .setCustomId('excluirS')
                          .setLabel('Cancelar')
                      )
                        .addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('callS')
                            .setLabel('Criar Call')
                            .setEmoji(`${emojis.sound}`)
                        )
                        .addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('aceitarS')
                            .setLabel('Resolvido')
                            .setEmoji(`${emojis.right}`)
                        )

                      channel.send({ embeds: [MensagemVerify], components: [row3] })
                      channel.send(`<@&${configs.val().suportecargo}>`).then(m => m.delete());
                    });
                  });
              });
          }

          if (customId === 'excluirS') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`)
              .once("value", async verificar => {
                await database.ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`).remove();

                if (interaction.guild.channels.cache.get(verificar.val().canalvoz)) {
                  await interaction.guild.channels.cache.get(verificar.val().canalvoz).delete();
                }

                const VerificadoS = new MessageEmbed()
                  .setAuthor({
                    name: `Suporte - ` + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setColor(config.COLOR)
                  .setDescription(`O Pedido de Suporte foi cancelado e será finalizado em breve.`)
                  .setFooter({ text: `Todos os canais de suporte serão deletados em 5 segundo(s).` })

                await interaction.reply({ embeds: [VerificadoS] });

                setTimeout(async () => {
                  await interaction.guild.channels.cache.get(verificar.val().canal).delete();
                }, 5000);
              });
          }

          if (customId === 'callS') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async configs => {

                var chn = interaction.guild.channels.cache.get(interaction.channelId)

                var usuario = interaction.guild.members.cache.get(chn.topic);

                interaction.guild.channels.create(`📞・${usuario.user.username}`, {
                  permissionOverwrites: [
                    {
                      type: 'member',
                      id: chn.topic,
                      allow: ['STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                    {
                      id: interaction.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                    {
                      id: interaction.guild.roles.cache.get(configs.val().suportecargo),
                      allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                  ],
                  type: 'GUILD_VOICE',
                  parent: configs.val().suportecategoria
                }).then(async channel => {

                  await database.ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`).update({ canalvoz: channel.id })

                  let invite = await channel.createInvite(
                    {
                      maxAge: 10 * 60 * 1000,
                      maxUses: 5
                    },
                    `Suporte por ${interaction.user.tag}`
                  ).catch(err => { })

                  const CanalVoz = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`**»** Canal de voz criado, para se conectar ao mesmo clique no botão abaixo.`)

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Conectar ao Canal de Voz')
                      .setURL(`${invite}`)
                  )

                  await interaction.reply({ embeds: [CanalVoz], components: [row] });
                });
              });
          }

          if (customId === 'aceitarS') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`)
              .once("value", async verificar => {

                database.ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`).update({ abriu: false, resolvido: true })

                if (interaction.guild.channels.cache.get(verificar.val().canalvoz)) {
                  await interaction.guild.channels.cache.get(verificar.val().canalvoz).delete();
                }

                const VerificadoS = new MessageEmbed()
                  .setAuthor({
                    name: `Suporte - ` + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setColor(config.COLOR)
                  .setDescription(`O Pedido de Suporte foi resolvido com sucesso e será finalizado em breve.`)
                  .addFields({ name: `${emojis.bol} Informações:`, value: `**Membro:** <@${chn.topic}> (\`${chn.topic}\`)\n**Responsável:** ${interaction.user}` })
                  .setFooter({ text: `Todos os canais de suporte serão deletados em 10 segundo(s).` })

                await interaction.reply({ embeds: [VerificadoS] });

                await database.ref(`Servidores/${interaction.guild.id}/Suporte/${chn.topic}`).remove();

                setTimeout(async () => {
                  await interaction.guild.channels.cache.get(verificar.val().canal).delete();
                }, 10000);

                /// COUNT
                database
                  .ref(`Servidores/${interaction.guild.id}/Suporte/ADM/${interaction.user.id}`)
                  .once("value", async contar => {

                    /// LOGS
                    database
                      .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                      .once("value", async logs => {

                        if (!contar.val()) {
                          database.ref(`Servidores/${interaction.guild.id}/Suporte/ADM/${interaction.user.id}`).update({ count: 1 })

                          const Logs = new MessageEmbed()
                            .setAuthor({
                              name: `Suporte - ` + interaction.guild.name,
                              iconURL: interaction.guild.iconURL({ dynamic: true }),
                              url: null
                            })
                            .setColor('FFFFFF')
                            .setDescription(`**SUPORTE RESOLVIDO**\n\n**Membro:** <@${chn.topic}> (\`${chn.topic}\`) \n**Responsável:** ${interaction.user}`)
                            .setFooter({ text: `${interaction.user.tag} já resolveu 1 suporte(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                          interaction.guild.channels.cache.get(logs.val().canal_logs4).send({ embeds: [Logs] })

                        } else {
                          var countz = Number(contar.val().count + 1)
                          database.ref(`Servidores/${interaction.guild.id}/Suporte/ADM/${interaction.user.id}`).update({ count: countz })


                          const Logs = new MessageEmbed()
                            .setAuthor({
                              name: `Suporte - ` + interaction.guild.name,
                              iconURL: interaction.guild.iconURL({ dynamic: true }),
                              url: null
                            })
                            .setColor('FFFFFF')
                            .setDescription(` **SUPORTE RESOLVIDO**\n\n **Membro:** <@${chn.topic}> (\`${chn.topic}\`) \n **Responsável:** ${interaction.user}`)
                            .setFooter({ text: `${interaction.user.tag} já resolveu ${countz} suporte(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                          interaction.guild.channels.cache.get(logs.val().canal_logs4).send({ embeds: [Logs] })
                        }
                      });
                  });
              });
          }

          if (customId === 'verificariniciar') {
            database
              .ref(`Servidores/${interaction.guild.id}/Verificacao/${interaction.user.id}`)
              .once("value", async verificar => {

                database
                  .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                  .once("value", async configs => {

                    const JaAbriu = new MessageEmbed()
                      .setColor(config.COLOR)
                      .setDescription(`Você já abriu uma verificação, aguarde o processo ser finalizado.`);

                    if (!configs.val().cargoverificaradm) return;
                    if (!configs.val().categoriaverificar) return;

                    if (interaction.member.roles.cache.has(configs.val().cargoverificar)) return interaction.reply({ content: `Você já possui o cargo de verificação e não pode se verificar novamente.`, ephemeral: true })

                    if (!verificar.val()) await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${interaction.user.id}`).update({ abriu: false, canal: null })

                    if (verificar.val()) {
                      if (verificar.val().abriu === true) {
                        const row = new MessageActionRow().addComponents(
                          new MessageButton()
                            .setStyle('LINK')
                            .setLabel('Clique para ir até sua verificação')
                            .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${verificar.val().canal}`)
                        )

                        interaction.reply({ embeds: [JaAbriu], components: [row], ephemeral: true });
                        return;
                      }
                    }

                    database.ref(`Servidores/${interaction.guild.id}/Verificacao/${interaction.user.id}`).update({ abriu: true, canal: null })

                    interaction.guild.channels.create(`🔎-${interaction.user.tag}`, {
                      topic: interaction.user.id,
                      permissionOverwrites: [
                        {
                          type: 'member',
                          id: interaction.user.id,
                          allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'],
                        },
                        {
                          id: interaction.guild.roles.cache.get(configs.val().cargoverificaradm),
                          allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                        },
                        {
                          id: interaction.guild.roles.everyone,
                          deny: ['VIEW_CHANNEL'],
                        },
                      ],
                      type: 'GUILD_TEXT',
                      parent: `${configs.val().categoriaverificar}`
                    }).then(async channel => {

                      await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${interaction.user.id}`).update({ canal: channel.id })

                      const AbriuAgora = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setDescription(`Você iniciou um processo de verificação, para ir até o canal clique no botão abaixo.`);

                      const row2 = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('LINK')
                          .setLabel('Clique para ir até sua verificação')
                          .setURL(`https://ptb.discord.com/channels/${interaction.guild.id}/${channel.id}`)
                      )

                      interaction.reply({ embeds: [AbriuAgora], components: [row2], ephemeral: true })

                      /////////////////////////////////

                      const MensagemVerify = new MessageEmbed()
                        .setColor(config.COLOR)
                        .setAuthor({
                          name: `Verificação - ` + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setTitle(`Verificação - ${interaction.user.tag}`)
                        .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
                        .setDescription(`Você está em um canal em contato com a nossa equipe de verificação, em breve o responsável pela verificação irá lhe atender.`)
                        .addFields({ name: `Necessário:`, value: `\`1\` Seguir todos os pedidos dos verificadores;\n\`2\` Seguir todas as regras do servidor.` })

                      const row3 = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('DANGER')
                          .setCustomId('excluirP')
                          .setLabel('Cancelar')
                      )
                        .addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('callP')
                            .setLabel('Criar Call')
                            .setEmoji(`${emojis.sound}`)
                        )
                        .addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('imagemP')
                            .setLabel('Enviar Print')
                            .setEmoji(`${emojis.cam}`)
                        )
                        .addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('aceitarP')
                            .setLabel('Verificar')
                            .setEmoji(`${emojis.right}`)
                        )

                      channel.send({ embeds: [MensagemVerify], components: [row3] })

                      channel.send(`<@&${configs.val().cargoverificaradm}>`).then(m => m.delete());
                    });
                  });
              });
          }

          if (customId === 'excluirP') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`)
              .once("value", async verificar => {
                await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`).remove();

                if (interaction.guild.channels.cache.get(verificar.val().canalvoz)) {
                  await interaction.guild.channels.cache.get(verificar.val().canalvoz).delete();
                }

                const VerificadoS = new MessageEmbed()
                  .setAuthor({
                    name: `Verificação - ` + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setColor(config.COLOR)
                  .setDescription(`O Processo de verificação foi cancelado e será finalizado em breve.`)
                  .setFooter({ text: `Todos os canais de verificação serão deletados em 5 segundo(s).` })

                await interaction.reply({ embeds: [VerificadoS] });

                setTimeout(async () => {
                  await interaction.guild.channels.cache.get(verificar.val().canal).delete();
                }, 5000);
              });
          }

          if (customId === 'callP') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async configs => {
                var chn = interaction.guild.channels.cache.get(interaction.channelId)

                var usuario = interaction.guild.members.cache.get(chn.topic);

                interaction.guild.channels.create(`🔎・${usuario.user.username}`, {
                  permissionOverwrites: [
                    {
                      type: 'member',
                      id: chn.topic,
                      allow: ['STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                    {
                      id: configs.val().cargoverificaradm,
                      allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                    {
                      id: interaction.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                  ],
                  type: 'GUILD_VOICE',
                  parent: `${configs.val().categoriaverificar}`
                }).then(async channel => {

                  await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`).update({ canalvoz: channel.id })

                  let invite = await channel.createInvite(
                    {
                      maxAge: 10 * 60 * 1000,
                      maxUses: 5
                    },
                    `Verificação por ${interaction.user.tag}`
                  ).catch(err => { })

                  const CanalVoz = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`**»** Canal de voz criado, para se conectar ao mesmo clique no botão abaixo.`)

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Conectar ao Canal de Voz')
                      .setURL(`${invite}`)
                  )

                  await interaction.reply({ embeds: [CanalVoz], components: [row] }).catch(err => { });
                });
              });
          }

          if (customId === 'imagemP') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)
            var usuario = interaction.guild.members.cache.get(chn.topic)

            const Embed = new MessageEmbed()
              .setDescription(`Envie a print no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              if (collected.first().attachments.size > 0 || collected.first().content.includes('https://' || 'http://')) {

                const foto = collected.first().attachments.size > 0
                  ? collected.first().attachments.first().url
                  : collected.first().content

                interaction.followUp({ content: `A print foi anexada a verificação com sucesso.`, ephemeral: true }).catch(err => { });

                setTimeout(async () => {
                  await cliente.channels.cache.get('1099392208383266857')({ files: [foto] }).then(async m => {
                    await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`).update({ imagem: m.attachments.first().url })
                  });
                }, 1000);
              }
            });
          }

          if (customId === 'aceitarP') {
            var chn = interaction.guild.channels.cache.get(interaction.channelId)

            database
              .ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`)
              .once("value", async verificar => {

                database.ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`).update({ abriu: false, verificado: true })

                if (interaction.guild.channels.cache.get(verificar.val().canalvoz)) {
                  await interaction.guild.channels.cache.get(verificar.val().canalvoz).delete();
                }

                const VerificadoS = new MessageEmbed()
                  .setAuthor({
                    name: `Verificação - ` + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setColor(config.COLOR)
                  .setDescription(`O Processo de verificação foi concluido com sucesso e será finalizado em breve.`)
                  .addFields({ name: `Informações:`, value: `・ **Membro:** <@${chn.topic}> (\`${chn.topic}\`)\n・ **Verificador:** ${interaction.user}` })
                  .setFooter({ text: `Todos os canais de verificação serão deletados em 10 segundo(s).` })

                await interaction.reply({ embeds: [VerificadoS] });

                await database.ref(`Servidores/${interaction.guild.id}/Verificacao/${chn.topic}`).remove();

                setTimeout(async () => {
                  await interaction.guild.channels.cache.get(verificar.val().canal).delete();
                }, 10000);

                /// COUNT
                database
                  .ref(`Servidores/${interaction.guild.id}/Verificacao/ADM/${interaction.user.id}`)
                  .once("value", async contar => {

                    /// LOGS
                    database
                      .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                      .once("value", async logs => {

                        await interaction.guild.members.cache.get(chn.topic).roles.add(logs.val().cargoverificar)

                        if (!contar.val()) {
                          database.ref(`Servidores/${interaction.guild.id}/Verificacao/ADM/${interaction.user.id}`).update({ count: 1 })

                          const Logs = new MessageEmbed()
                            .setAuthor({
                              name: `Verificação - ` + interaction.guild.name,
                              iconURL: interaction.guild.iconURL({ dynamic: true }),
                              url: null
                            })
                            .setColor('FFFFFF')
                            .setDescription(` **VERIFICAÇÃO CONCLUIDA**\n\n **Membro:** <@${chn.topic}> (\`${chn.topic}\`) \n **Responsável:** ${interaction.user}`)
                            .setFooter({ text: `${interaction.user.tag} já verificou 1 membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                          const row2 = new MessageActionRow().addComponents(
                            new MessageButton()
                              .setStyle('LINK')
                              .setLabel('Print da verificação')
                              .setURL(`${verificar.val().imagem == undefined ? "https://tm.ibxk.com.br/2022/05/26/26232122827007.jpg" : verificar.val().imagem}`)
                          )

                          interaction.guild.channels.cache.get(logs.val().canal_logs3).send({ embeds: [Logs], components: [row2] })

                        } else {
                          var countz = Number(contar.val().count + 1)
                          database.ref(`Servidores/${interaction.guild.id}/Verificacao/ADM/${interaction.user.id}`).update({ count: countz })


                          const Logs = new MessageEmbed()
                            .setAuthor({
                              name: `Verificação - ` + interaction.guild.name,
                              iconURL: interaction.guild.iconURL({ dynamic: true }),
                              url: null
                            })
                            .setColor('FFFFFF')
                            .setDescription(` **VERIFICAÇÃO CONCLUIDA**\n\n **Membro:** <@${chn.topic}> (\`${chn.topic}\`) \n **Responsável:** ${interaction.user}`)
                            .setFooter({ text: `${interaction.user.tag} já verificou ${countz} membro(s).`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

                          const row2 = new MessageActionRow().addComponents(
                            new MessageButton()
                              .setStyle('LINK')
                              .setLabel('Print da verificação')
                              .setURL(`${verificar.val().imagem == undefined ? "https://cdn.discordapp.com/attachments/" : verificar.val().imagem}`)
                          )

                          interaction.guild.channels.cache.get(logs.val().canal_logs3).send({ embeds: [Logs], components: [row2] })
                        }
                      });
                  });
              });
          }

          if (customId === 'sejamembroverificar') {
            const Embed2 = new MessageEmbed()
              .setColor(config.COLOR)
              .setDescription(`**»** Você já é um membro da **${interaction.guild.name}**.`)

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val()) return;
                if (!snapshot.val().cargomembro) return;
                if (!snapshot.val().url) return;

                if (interaction.member.roles.cache.has(snapshot.val().cargomembro)) return interaction.reply({ embeds: [Embed2], ephemeral: true });

                const cooldown = cooldowns.get(interaction.user.id);

                if (cooldown) {
                  const EmbedV = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`**»** Aguarde **1 minuto** para verificar sua bio novamente.`)

                  return interaction.reply({ embeds: [EmbedV], ephemeral: true }).catch(err => { });
                }

                cooldowns.set(interaction.user.id, Date.now() + 1 * 60 * 1000);

                setTimeout(() => cooldowns.delete(interaction.user.id), 1 * 60 * 1000);

                var z = await fetch(`https://discord.com/api/v9/users/${interaction.user.id}/profile`, {
                  "headers": {
                    "authorization": "MTU4MzgyMzgxNDYyNDU0Mjcz.GqcBIt.Q1mFWE1SzUCQ0MlCwAWELTkPeS5g1gmCKp6RU4",
                  },
                  "body": null,
                  "method": "GET"
                });

                let json = await z.json();

                let sobremim = json.user.bio;

                if (sobremim.includes(`https://discord.gg/${snapshot.val().url}`) || sobremim.includes(`discord.gg/${snapshot.val().url}`) || sobremim.includes(`.gg/${snapshot.val().url}`) || sobremim.includes(`/${snapshot.val().url}`)) {
                  const Embed2 = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`**»** Sua **URL** foi encontrada com sucesso, suas vantagens já foram aplicadas.`)

                  interaction.reply({ embeds: [Embed2], ephemeral: true }).catch(err => { });

                  database.ref(`Servidores/${interaction.guild.id}/SejaMembro/${interaction.user.id}`).update({
                    tag: interaction.user.tag
                  });

                  await interaction.member.roles.add(snapshot.val().cargomembro)

                  if (!snapshot.val().canal_logs9) return;

                  const Logs = new MessageEmbed()
                    .setAuthor({
                      name: `Seja Membro - ` + interaction.guild.name,
                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setColor('FFFFFF')
                    .setDescription(` **Usuário:** ${interaction.user} - \`${interaction.user.id}\``)

                  interaction.guild.channels.cache.get(snapshot.val().canal_logs9).send({ embeds: [Logs] });

                } else {
                  const Embed3 = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`**»** Não consegui identificar a **URL** em sua bio, tente novamente após **1 minuto**.`)

                  interaction.reply({ embeds: [Embed3], ephemeral: true }).catch(err => { });
                }
              });
          }

          if (customId === 'resetprefixos') {
            database
              .ref(`Servidores/${interaction.guild.id}/Prefixos`)
              .once("value")
              .then(async function (snap) {

                if (snap.val()) {
                  database
                    .ref(`Servidores/${interaction.guild.id}/Prefixos`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Prefixos resetados',
                      iconURL: imgur.Sucesso,
                      url: null
                    })
                    .setDescription(`Todos os **Prefixos** foram resetados por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });
                }
              });
          }

          /////////////////////////////// REGISTRO ///////////////////////////////

          //// INICIO REGISTRO
          if (customId === 'registrof') {
            let GENERO = new MessageEmbed()
              .setAuthor({
                name: 'Registro - ' + interaction.guild.name,
                iconURL: interaction.guild.iconURL({ dynamic: true }),
                url: null
              })
              .addFields({ name: `**REGISTRANDO:** ${interaction.user.tag}`, value: `> **PERGUNTA:**\n・ Qual seu gênero?` })
              .setColor(config.COLOR)
              .setFooter({ text: `Página 1/2 ` })


            const row = new MessageActionRow().addComponents(
              new MessageButton()
                .setStyle('SECONDARY')
                .setCustomId('homem')
                .setLabel('Homem')
            )
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('mulher')
                  .setLabel('Mulher')
              )

            interaction.reply({ embeds: [GENERO], components: [row], ephemeral: true })
          }

          /// HOMEM
          if (customId === 'homem') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val()) return;
                if (!snapshot.val().homem) return;
                if (!snapshot.val().mulher) return;
                if (!snapshot.val().cargovisitante) return;

                if (interaction.member.roles.cache.has(snapshot.val().mulher)) interaction.member.roles.remove(snapshot.val().mulher)

                await interaction.member.roles.add(snapshot.val().homem);

                if (interaction.member.roles.cache.has(snapshot.val().cargovisitante)) interaction.member.roles.remove(snapshot.val().cargovisitante)

                let IDADE = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields({ name: `**REGISTRANDO:** ${interaction.user.tag}`, value: `> **PERGUNTA:**\n・ Qual sua idade?` })
                  .setFooter({ text: `Página 2/2 ` })
                  .setColor(config.COLOR)

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('+18')
                    .setLabel('+18')
                )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('-18')
                      .setLabel('-18')
                  )

                interaction.update({ embeds: [IDADE], components: [row], ephemeral: true })
              });
          }

          /// MULHER
          if (customId === 'mulher') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val()) return;
                if (!snapshot.val().homem) return;
                if (!snapshot.val().mulher) return;
                if (!snapshot.val().cargovisitante) return;

                if (interaction.member.roles.cache.has(snapshot.val().homem)) interaction.member.roles.remove(snapshot.val().homem)

                await interaction.member.roles.add(snapshot.val().mulher);

                if (interaction.member.roles.cache.has(snapshot.val().cargovisitante)) interaction.member.roles.remove(snapshot.val().cargovisitante)

                let IDADE = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields({ name: `**REGISTRANDO:** ${interaction.user.tag}`, value: `> **PERGUNTA:**\n・ Qual sua idade?` })
                  .setColor(config.COLOR)
                  .setFooter({ text: `Página 2/2 ` })


                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('+18')
                    .setLabel('+18')
                )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('-18')
                      .setLabel('-18')
                  )

                interaction.update({ embeds: [IDADE], components: [row], ephemeral: true })
              });
          }

          /// IDADE
          if (customId === '+18') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val()) return;
                if (!snapshot.val().maior) return;
                if (!snapshot.val().menor) return;
                if (!snapshot.val().cargovisitante) return;

                if (interaction.member.roles.cache.has(snapshot.val().menor)) interaction.member.roles.remove(snapshot.val().menor)

                await interaction.member.roles.add(snapshot.val().maior);

                if (interaction.member.roles.cache.has(snapshot.val().cargovisitante)) interaction.member.roles.remove(snapshot.val().cargovisitante)

                let IDADE = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**REGISTRO COMPLETO:** ${interaction.user.tag}`)
                  .setColor(config.COLOR)

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SUCCESS')
                    .setCustomId('botaodesativado')
                    .setLabel('Seu registro foi concluido')
                    .setDisabled(true)
                )

                interaction.update({ embeds: [IDADE], components: [row], ephemeral: true })

                if (!snapshot.val().canal_logs10) return;

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(` **REGISTRO EFETUADO**\n **Registrado(a):** ${interaction.user} (\`${interaction.user.id}\`)`)
                  .setColor('FFFFFF')

                interaction.guild.channels.cache.get(snapshot.val().canal_logs10).send({ embeds: [EmbedExemplo] }).catch(err => { });
              });
          }

          /// IDADE
          if (customId === '-18') {
            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (!snapshot.val()) return;
                if (!snapshot.val().maior) return;
                if (!snapshot.val().menor) return;
                if (!snapshot.val().cargovisitante) return;

                if (interaction.member.roles.cache.has(snapshot.val().maior)) interaction.member.roles.remove(snapshot.val().maior)

                await interaction.member.roles.add(snapshot.val().menor);

                if (interaction.member.roles.cache.has(snapshot.val().cargovisitante)) interaction.member.roles.remove(snapshot.val().cargovisitante)

                let IDADE2 = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**REGISTRO COMPLETO:** ${interaction.user.tag}`)
                  .setColor(config.COLOR)

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SUCCESS')
                    .setCustomId('botaodesativado')
                    .setLabel('Seu registro foi concluido')
                    .setDisabled(true)
                )

                interaction.update({ embeds: [IDADE2], components: [row], ephemeral: true })

                if (!snapshot.val().canal_logs10) return;

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Registro - ' + interaction.guild.name,
                    iconURL: interaction.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(` **REGISTRO EFETUADO**\n **Registrado(a):** ${interaction.user} (\`${interaction.user.id}\`)`)
                  .setColor('FFFFFF')

                interaction.guild.channels.cache.get(snapshot.val().canal_logs10).send({ embeds: [EmbedExemplo] }).catch(err => { });
              });
          }

          if (customId === 'atualizar') {
            const cooldown = cooldowns.get(interaction.user.id);

            if (cooldown) {
              return interaction.reply({ content: `> Você precisa aguardar \`5 minuto(s)\` para atualizar o Contador novamente.`, ephemeral: true });
            }

            cooldowns.set(interaction.user.id, Date.now() + 5 * 60 * 1000);

            setTimeout(() => cooldowns.delete(interaction.user.id), 5 * 60 * 1000);

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snap) {

                if (!snap.val()) return;

                if (!snap.val().contador) return interaction.reply({ content: `> O canal do contador não foi definido.`, ephemeral: true });
                if (!snap.val().msgcontador) return interaction.reply({ content: `> A mensagem do contador não foi definida.`, ephemeral: true });

                var msg = snap.val().msgcontador;

                const voiceChannels = interaction.guild.channels.cache.filter(c => c.type === 'GUILD_VOICE');

                let contador3 = voiceChannels.reduce((a, c) => {
                  if (!c.isVoice()) return;
                  return a + c.members.size
                }, 0
                )

                await interaction.guild.channels.cache.get(snap.val().contador).setName(`${msg.replace(/{contador}/g, contador3)}`)
              });

            let EmbedExemplo = new MessageEmbed()
              .setDescription(`**»** Você acabou de atualizar o Contador de Membros em Call.`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [EmbedExemplo], ephemeral: true });
          }

          if (customId === 'inicio') {
            if (interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "452225239032791062"
              && interaction.member.id !== "1015229792276201542"
              && interaction.member.id !== "452225239032791062") {
              interaction.reply({ embeds: [Error], ephemeral: true });
              return;
            }

            database
              .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
              .once("value", async snapshot => {

                if (snapshot.val().prefix) {
                  var prefix = snapshot.val().prefix;
                } else {
                  var prefix = ";";

                  database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                    prefix: ";",
                  });
                }

                const agora = new Date();
                const diffTime = snapshot.val().expirar - agora;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

                let PainelEmbed = new MessageEmbed()
                  .setAuthor({
                    name: 'Painel Geral - ' + interaction.guild.name,
                    iconURL: imgur.Cadeado,
                    url: null
                  })
                  .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                  .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${interaction.member} - \`${interaction.member.id}\`\n\n**»** Servidor: \`${interaction.guild.name}\` (\`${interaction.guild.id}\`)\n**»** Expiração: \`${diffDays} dia(s), ${diffHours} hora(s) e ${diffMinutes} minuto(s)\`\nSistemas para configuração: \`15\`\nPrefixo: \`${prefix}\`` })
                  .setColor(config.COLOR)

                const row2 = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('fotobot')
                      .setLabel('Alterar Avatar')
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('nomebot')
                      .setLabel('Alterar Nickname')
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('prefixo')
                      .setLabel('Alterar Prefixo')
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('PRIMARY')
                      .setCustomId('listcomandos')
                      .setLabel('Lista de Comandos')
                  )

                const row = new MessageActionRow().addComponents(
                  new MessageSelectMenu()
                    .setCustomId('painelmenu')
                    .setPlaceholder('Selecione um painel de configuração')
                    .addOptions(
                      {
                        label: `Sistema de Segurança`,
                        emoji: `${emojis.discordlogo}`,
                        description: `Painel de configuração do Sistema de Segurança.`,
                        value: `SegurancaP`
                      },
                      {
                        label: `Sistema de Primeira Dama`,
                        emoji: `${emojis.alianca}`,
                        description: `Painel de configuração do Sistema de Primeira Dama.`,
                        value: `PrimeiraDamaP`
                      },
                      {
                        label: `Sistema de Twitter`,
                        emoji: `${emojis.twitter}`,
                        description: `Painel de configuração do Sistema de Twitter.`,
                        value: `TwitterP`
                      },
                      {
                        label: `Sistema de Instagram`,
                        emoji: `${emojis.insta2}`,
                        description: `Painel de configuração do Sistema de Instagram.`,
                        value: `InstagramP`
                      },
                      {
                        label: `Sistema de Tellonym`,
                        emoji: `${emojis.tellonym}`,
                        description: `Painel de configuração do Sistema de Tellonym.`,
                        value: `TellonymP`
                      },
                      {
                        label: `Sistema de Seja Membro`,
                        emoji: `${emojis.group2}`,
                        description: `Painel de configuração do Sistema de Seja Membro.`,
                        value: `SejaMembroP`
                      },
                      {
                        label: `Sistema de Verificação`,
                        emoji: `${emojis.right}`,
                        description: `Painel de configuração do Sistema de Verificação.`,
                        value: `VerificacaoP`
                      },
                      {
                        label: `Sistema de Suporte`,
                        emoji: `${emojis.headset}`,
                        description: `Painel de configuração do Sistema de Suporte.`,
                        value: `SuporteP`
                      },
                      {
                        label: `Sistema de Influencer`,
                        emoji: `${emojis.coracao}`,
                        description: `Painel de configuração do Sistema de Influencer.`,
                        value: `InfluencerP`
                      },
                      {
                        label: `Sistema de Migração`,
                        emoji: `${emojis.etiq}`,
                        description: `Painel de configuração do Sistema de Migração.`,
                        value: `MigracaoP`
                      },
                      {
                        label: `Sistema de Registro`,
                        emoji: `${emojis.listverify}`,
                        description: `Painel de configuração do Sistema de Registro.`,
                        value: `RegistroP`
                      },
                      {
                        label: `Sistema de Prefixos`,
                        emoji: `${emojis.sound}`,
                        description: `Painel de configuração do Sistema de Prefixos.`,
                        value: `PrefixosP`
                      },
                      {
                        label: `Sistema de Contador`,
                        emoji: `${emojis.group3}`,
                        description: `Painel de configuração do Sistema de Contador.`,
                        value: `ContadorP`
                      },
                      {
                        label: `Sistema de Economia`,
                        emoji: `${emojis.trophy}`,
                        description: `Painel de configuração do Sistema de Economia.`,
                        value: `CarteirasP`
                      },
                      {
                        label: `Sistema de Blacklist`,
                        emoji: `${emojis.logverify}`,
                        description: `Painel de configuração do Sistema de Blacklist.`,
                        value: `BlacklistP`
                      },
                    )
                );

                interaction.update({ embeds: [PainelEmbed], components: [row, row2] });
                return;
              });
          }

          if (customId === 'listblack') {
            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist/${interaction.user.id}`)
              .once("value", snap2 => {

                if (!snap2.val() && interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "452225239032791062"
                  && interaction.member.id !== "1015229792276201542"
                  && interaction.member.id !== "452225239032791062") {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                var arr = [];
                var counter = 0;

                database
                  .ref(`Servidores/${interaction.guild.id}/Blacklist`)
                  .once("value", snapshot => {

                    if (!snapshot.val()) {
                      interaction.reply({ content: `> Não há ninguém na Blacklist.`, ephemeral: true })
                      return;
                    }

                    snapshot.forEach(v => {
                      arr.push({
                        ID: v.key,
                        STAFF: v.val().staff,
                        MOTIVO: v.val().motivo,
                        USUARIO: v.val().usuario
                      });

                      counter++;

                      if (counter === snapshot.numChildren()) {
                        arr.sort(function (a, b) {
                          return b - a;
                        });

                        var lista = arr.slice(0);
                        var msgArr = [];
                        var count = 0;

                        lista.forEach(u => {
                          msgArr.push(
                            `\`${u.USUARIO}\` (\`${u.ID}\`)\nMotivo: \`${u.MOTIVO}\`\nColocado(a) por: <@${u.STAFF}>\n`
                          );

                          count++;
                          if (count == lista.length) {
                            var msg2 = msgArr.join(`\n`);

                            const chunks = Util.splitMessage(msg2);

                            let Teste = new MessageEmbed()
                              .setAuthor({
                                name: 'BLACKLIST - ' + interaction.guild.name,
                                iconURL: imgur.Lista,
                                url: null
                              })
                              .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                              .setColor(config.COLOR)

                            interaction.reply({ content: `> Enviando lista de usuários em blacklist...`, ephemeral: true })

                            setTimeout(async () => {

                              if (chunks.length > 1) {
                                chunks.forEach((chunk, i) =>
                                  interaction.channel.send({
                                    embeds: [Teste.setDescription(chunk).setFooter({
                                      text: `Lista ${i + 1} / ${chunks.length}`,
                                    })]
                                  }).catch(err => { })
                                );
                              } else {
                                interaction.channel.send({ embeds: [Teste.setDescription(chunks[0])] }).catch(err => { })
                              }
                            }, 300);
                          }
                        });
                      }
                    });
                  });
              });
          }

          if (customId === 'listmembros') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/SejaMembro`)
              .once("value", snapshot => {

                if (snapshot.val() == null) {
                  interaction.reply({ content: `> Não há ninguém no Seja Membro.`, ephemeral: true })
                  return;
                }

                interaction.reply({ content: `> Enviando lista...`, ephemeral: true })

                setTimeout(() => {

                  snapshot.forEach(v => {
                    arr.push({
                      ID: v.key,
                      TAG: v.val().tag
                    });

                    counter++;

                    if (counter === snapshot.numChildren()) {
                      arr.sort(function (a, b) {
                        return b - a;
                      });

                      var lista = arr.slice(0);
                      var msgArr = [];
                      var count = 0;

                      lista.forEach(u => {
                        msgArr.push(
                          `**»** \`${u.TAG}\` (\`${u.ID}\`)\n`
                        );

                        count++;
                        if (count == lista.length) {
                          var msg2 = msgArr.join(``);

                          const chunks = Util.splitMessage(msg2);

                          let Teste = new MessageEmbed()
                            .setAuthor({
                              name: 'LISTA SEJA MEMBRO - ' + interaction.guild.name,
                              iconURL: imgur.Lista,
                              url: null
                            })
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setColor(config.COLOR)

                          if (chunks.length > 1) {
                            chunks.forEach((chunk, i) =>
                              interaction.followUp({
                                embeds: [Teste.setDescription(chunk).setFooter({
                                  text: `Lista ${i + 1} / ${chunks.length}`,
                                })]
                                , ephemeral: true
                              })
                            );
                          } else {
                            interaction.followUp({ embeds: [Teste.setDescription(chunks[0])], ephemeral: true })
                          }
                        }
                      });
                    }
                  });
                }, 500);
              });
          }

          if (customId === 'verificarlista') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Verificados`)
              .once("value", snapshot => {

                if (snapshot.val() == null) {
                  interaction.reply({ content: `> Não há ninguém nos Verificados.`, ephemeral: true })
                  return;
                }

                interaction.reply({ content: `> Enviando lista...`, ephemeral: true })

                setTimeout(() => {

                  snapshot.forEach(v => {
                    arr.push({
                      ID: v.key,
                      TAG: v.val().tag,
                      STAFF: v.val().staff
                    });

                    counter++;

                    if (counter === snapshot.numChildren()) {
                      arr.sort(function (a, b) {
                        return b - a;
                      });

                      var lista = arr.slice(0);
                      var msgArr = [];
                      var count = 0;

                      lista.forEach(u => {
                        msgArr.push(
                          `**»** \`${u.TAG}\` (\`${u.ID}\`) Verificado(a) por: <@${u.STAFF}>\n`
                        );

                        count++;
                        if (count == lista.length) {
                          var msg2 = msgArr.join(``);

                          const chunks = Util.splitMessage(msg2);

                          let Teste = new MessageEmbed()
                            .setAuthor({
                              name: 'LISTA VERIFICADOS - ' + interaction.guild.name,
                              iconURL: imgur.Lista,
                              url: null
                            })
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setColor(config.COLOR)

                          if (chunks.length > 1) {
                            chunks.forEach((chunk, i) =>
                              interaction.followUp({
                                embeds: [Teste.setDescription(chunk).setFooter({
                                  text: `Lista ${i + 1} / ${chunks.length}`,
                                })]
                                , ephemeral: true
                              })
                            );
                          } else {
                            interaction.followUp({ embeds: [Teste.setDescription(chunks[0])], ephemeral: true })
                          }
                        }
                      });
                    }
                  });
                }, 500);
              });
          }

          if (customId === 'listamo') {
            var arr = [];
            var counter = 0;
            var pos = 1;

            database
              .ref(`Cash/Carteira`)
              .once("value", snapshot => {

                if (snapshot.val() == null) {
                  interaction.reply({ content: `> Não há ninguém na database de Carteiras.`, ephemeral: true })
                  return;
                }

                interaction.reply({ content: `> Enviando lista...`, ephemeral: true })

                setTimeout(() => {

                  snapshot.forEach(v => {
                    arr.push({
                      ID: v.key,
                      MOEDAS: v.val().carteira
                    });

                    counter++;

                    if (counter === snapshot.numChildren()) {
                      arr.sort(function (a, b) {
                        return b.MOEDAS - a.MOEDAS;
                      });

                      var lista = arr.slice(0);
                      var msgArr = [];
                      var count = 0;

                      lista.forEach(u => {
                        msgArr.push(
                          `> **${pos++}º** <@${u.ID}> (\`${u.ID}\`) Carteira: **${u.MOEDAS} moedas**`
                        );

                        count++;

                        if (count == lista.length) {
                          var msg2 = msgArr.join(`\n`);

                          const chunks = Util.splitMessage(msg2);

                          let Teste = new MessageEmbed()
                            .setAuthor({
                              name: 'CARTEIRAS - ' + interaction.guild.name,
                              iconURL: imgur.Lista,
                              url: null
                            })
                            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                            .setColor(config.COLOR)


                          if (chunks.length > 1) {
                            chunks.forEach((chunk, i) =>
                              interaction.followUp({
                                embeds: [Teste.setDescription(chunk).setFooter({
                                  text: `Lista ${i + 1} / ${chunks.length}`,
                                })]
                                , ephemeral: true
                              })
                            );
                          } else {
                            interaction.followUp({ embeds: [Teste.setDescription(chunks[0])], ephemeral: true })
                          }
                        }
                      });
                    }
                  });
                }, 500);
              });
          }

          if (customId === 'reset1mo') {
            database
              .ref(`Cash/Carteira`)
              .once("value")
              .then(async function (snap) {

                if (snap.val()) {
                  database
                    .ref(`Cash/Carteira`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Carteiras Resetadas',
                      iconURL: imgur.right,
                      url: null
                    })
                    .setDescription(`As **Carteiras** foram resetadas por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });

                  /// LOGS ///
                  database
                    .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                    .once("value")
                    .then(async function (logs) {

                      if (!logs.val().canal_logs2) return;

                      /// EMBED ADICIONAR 
                      const reset1 = new MessageEmbed()
                        .setAuthor({
                          name: 'Economia - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(` **Carteiras** resetadas por ${interaction.user} (\`${interaction.user.id}\`)`)
                        .setColor('FFFFFF')

                      interaction.guild.channels.cache.get(logs.val().canal_logs2).send({ embeds: [reset1] }).catch(() => { });
                    });
                  /// LOGS ///
                  return;
                }
              });
          }

          if (customId === 'receber') {
            database
              .ref(`Cash/Carteira/${interaction.user.id}`)
              .once("value", async receber => {
                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('SECONDARY')
                    .setCustomId('resgatado')
                    .setLabel('Recompensa Resgatada')
                    .setEmoji(`${emojis.arrow}`)
                    .setDisabled(true)
                )

                interaction.message.edit({ components: [row] }).catch(err => { });

                if (!receber.val()) {
                  const RecebeuCoins = new MessageEmbed()
                    .setDescription(`**»** Você resgatou sua recompensa, use o comando \`/carteira\` para ver seu saldo.`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [RecebeuCoins], ephemeral: true })

                  database.ref(`Cash/Carteira/${interaction.user.id}`).update({
                    carteira: 30
                  });
                  return;
                }

                setTimeout(async () => {
                  await interaction.message.delete().catch(err => { });
                }, 100e3);

                var moedas = Number(receber.val().carteira) + 30;

                const RecebeuCoins = new MessageEmbed()
                  .setDescription(`**»** Você resgatou sua recompensa, use o comando \`/carteira\` para ver seu saldo.`)
                  .setColor(config.COLOR)

                interaction.reply({ embeds: [RecebeuCoins], ephemeral: true })

                database.ref(`Cash/Carteira/${interaction.user.id}`).update({
                  carteira: moedas
                });
              });
            return;
          }

          if (customId === 'reset1') {
            database
              .ref(`Servidores/${interaction.guild.id}/Blacklist`)
              .once("value")
              .then(async function (snap) {

                if (snap.val()) {

                  database
                    .ref(`Servidores/${interaction.guild.id}/Blacklist`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Blacklist Resetada',
                      iconURL: imgur.right,
                      url: null
                    })
                    .setDescription(`A **Blacklist Geral** foi resetada por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });

                  /// LOGS ///
                  database
                    .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                    .once("value")
                    .then(async function (logs) {

                      if (!logs.val()) return;

                      /// EMBED ADICIONAR 
                      const reset1 = new MessageEmbed()
                        .setAuthor({
                          name: 'Blacklist - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(` **Blacklist Geral** resetada por ${interaction.user} (\`${interaction.user.id}\`)`)
                        .setColor('FFFFFF')

                      interaction.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [reset1] }).catch(() => { });
                    });
                  /// LOGS ///
                  return;
                }
              });
          }

          if (customId === 'reset2') {
            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist`)
              .once("value")
              .then(async function (snap) {

                if (snap.val()) {
                  database
                    .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Permissões Resetadas',
                      iconURL: imgur.right,
                      url: null
                    })
                    .setDescription(`As **Permissões da Blacklist Geral** foram resetadas por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });

                  /// LOGS ///
                  database
                    .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                    .once("value")
                    .then(async function (logs) {

                      if (!logs.val().canal_logs) return;

                      /// EMBED ADICIONAR 
                      const reset2 = new MessageEmbed()
                        .setAuthor({
                          name: 'Blacklist - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(` **Permissões da Blacklist Geral** foram resetadas por ${interaction.user} (\`${interaction.user.id}\`)`)
                        .setColor('FFFFFF')

                      interaction.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [reset2] }).catch(() => { });
                    });
                  /// LOGS ///
                  return;
                }
              });
          }

          if (customId === 'reset1INF') {
            database
              .ref(`Servidores/${interaction.guild.id}/Influencer`)
              .once("value")
              .then(async function (snap) {

                if (snap.val()) {

                  database
                    .ref(`Servidores/${interaction.guild.id}/Influencer`).remove();

                  let EmbedExemplo = new MessageEmbed()
                    .setAuthor({
                      name: 'Influencer - ' + interaction.guild.name,
                      iconURL: interaction.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setDescription(`Os **Influencers** foi resetada por ${interaction.user} (\`${interaction.user.id}\`)`)
                    .setColor(config.COLOR)

                  interaction.reply({ embeds: [EmbedExemplo] });

                  /// LOGS ///
                  database
                    .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                    .once("value")
                    .then(async function (logs) {

                      if (!logs.val()) return;

                      /// EMBED ADICIONAR 
                      const reset1 = new MessageEmbed()
                        .setAuthor({
                          name: 'Influencer - ' + interaction.guild.name,
                          iconURL: interaction.guild.iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(` **Influencers** resetada por ${interaction.user} (\`${interaction.user.id}\`)`)
                        .setColor('FFFFFF')

                      interaction.guild.channels.cache.get(logs.val().canal_logs5).send({ embeds: [reset1] }).catch(() => { });
                    });
                  /// LOGS ///
                  return;
                }
              });
          }

          if (customId === 'listperm') {
            var arr = [];
            var counter = 0;

            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist`)
              .once("value", snapshot => {

                if (!snapshot.val()) {
                  interaction.reply({ content: `> Não há ninguém com permissão na Blacklist.`, ephemeral: true })
                  return;
                }

                snapshot.forEach(v => {
                  arr.push({
                    ID: v.key,
                    STAFF: v.val().colocou
                  });

                  counter++;

                  if (counter === snapshot.numChildren()) {
                    arr.sort(function (a, b) {
                      return b - a;
                    });

                    var lista = arr.slice(0);
                    var msgArr = [];
                    var count = 0;

                    lista.forEach(u => {
                      msgArr.push(
                        `> <@${u.ID}> (\`${u.ID}\`) Setado por: <@${u.STAFF}>\n`
                      );

                      count++;
                      if (count == lista.length) {
                        var msg2 = msgArr.join(``);

                        let Teste = new MessageEmbed()
                          .setAuthor({
                            name: 'LISTA DE PERMISSÕES - ' + interaction.guild.name,
                            iconURL: imgur.Lista,
                            url: null
                          })
                          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                          .setDescription(msg2)
                          .setColor(config.COLOR)

                        interaction.reply({ embeds: [Teste], ephemeral: true })
                      }
                    });
                  }
                });
              });
          }

          if (customId === 'canalgeral') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal da limpeza no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canalgeral: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Limpeza de Imagens/Figurinhas:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'canalgerallogs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de segurança no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs8: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Segurança):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'twittercanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal do twitter no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canaltwitter: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Twitter:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'instamensagens') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o total de mensagens para influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var numero = collected.first().content;

              if (!isNaN(numero)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  instamensagens: numero
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Número de Mensagens (Influencer):**\n**+** ${numero}`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }


          if (customId === 'instacanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal do instagram no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canalinstagram: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Instagram:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'instainfluencer') {
            let textinput = new TextInputComponent()
              .setCustomId('instacanal2-input')
              .setLabel("ID DO CANAL")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(20)
              .setRequired(true)

            let textinput2 = new TextInputComponent()
              .setCustomId('instacargo2-input')
              .setLabel("ID DO CARGO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(20)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('instageralmodal-modal')
              .setTitle(`Instagram - ${interaction.guild.name}`)
              .addComponents([textinput, textinput2])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            })
          }

          if (customId === 'tellocanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal do tellonym no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  tellocanal: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Tellonym:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'tellologs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs do tellonym no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  tellologs: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Tellonym):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'logs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs da blacklist no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Blacklist):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'add') {
            let textinput = new TextInputComponent()
              .setCustomId('add-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(20)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('add-modal')
              .setTitle(`BlackList - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'rem') {
            let textinput = new TextInputComponent()
              .setCustomId('rem-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(20)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('rem-modal')
              .setTitle(`BlackList - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'logsmo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de influencer no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs2: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Moedas):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'cargomo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de economia no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargo_moeda: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Economia (Moedas):**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'remblack') {
            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist/${interaction.user.id}`)
              .once("value", snap2 => {

                if (!snap2.val() && interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "452225239032791062"
                  && interaction.member.id !== "1015229792276201542"
                  && interaction.member.id !== "452225239032791062") {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }
                let textinput = new TextInputComponent()
                  .setCustomId('idblack2-input')
                  .setLabel("ID DO USUARIO")
                  .setStyle('SHORT')
                  .setMinLength(17)
                  .setMaxLength(20)
                  .setRequired(true)

                const modal = new Modal()
                  .setCustomId('blacklist2-modal')
                  .setTitle(`BlackList - ${interaction.guild.name}`)
                  .addComponents([textinput])

                showModal(modal, {
                  client: this.client,
                  interaction: interaction,
                });
              });
          }

          if (customId === 'addblack') {
            database
              .ref(`Servidores/${interaction.guild.id}/Permissoes/Blacklist/${interaction.user.id}`)
              .once("value", snap2 => {

                if (!snap2.val() && interaction.member.id !== interaction.guild.ownerId && interaction.member.id !== "452225239032791062"
                  && interaction.member.id !== "1015229792276201542"
                  && interaction.member.id !== "452225239032791062") {
                  interaction.reply({ embeds: [Error], ephemeral: true })
                  return;
                }

                let textinput = new TextInputComponent()
                  .setCustomId('idblack-input')
                  .setLabel("ID DO USUARIO")
                  .setStyle('SHORT')
                  .setMinLength(17)
                  .setMaxLength(20)
                  .setRequired(true)

                let textinput2 = new TextInputComponent()
                  .setCustomId('motivoblack-input')
                  .setLabel("MOTIVO")
                  .setStyle('LONG')
                  .setMinLength(5)
                  .setMaxLength(200)
                  .setRequired(true)

                const modal = new Modal()
                  .setCustomId('blacklist-modal')
                  .setTitle(`BlackList - ${interaction.guild.name}`)
                  .addComponents([textinput, textinput2])

                showModal(modal, {
                  client: this.client,
                  interaction: interaction,
                });
              });
          }

          if (customId === 'enviar') {

            let textinput = new TextInputComponent()
              .setCustomId('idmo-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(20)
              .setRequired(true)

            let textinput2 = new TextInputComponent()
              .setCustomId('quantmo-input')
              .setLabel("QUANTIDADE")
              .setStyle('SHORT')
              .setMinLength(1)
              .setMaxLength(3)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('enviarmo-modal')
              .setTitle(`Economia - ${interaction.guild.name}`)
              .addComponents([textinput, textinput2])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'remM') {
            let textinput = new TextInputComponent()
              .setCustomId('remm-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('remm-modal')
              .setTitle(`Migração - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'addM') {
            let textinput = new TextInputComponent()
              .setCustomId('addm-input')
              .setLabel("ID DO USUARIO")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('addm-modal')
              .setTitle(`Migração - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'migracanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal da migração no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                      canalmigracao: vCanal
                    });

                    if (snap2.val()) {
                      if (snap2.val().migracao) {
                        var banner = snap2.val().migracao;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Migração:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true })

                    const Migracao = new MessageEmbed()
                      .setAuthor({
                        name: 'Migração e Recrutamento - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`Que tal fazer parte da maior família do Discord? veja como efetuar seu recrutamento/migração abaixo.`)
                      .addFields({
                        name: `Como funciona?`,
                        value: `\`1\` Selecione uma das opções abaixo e siga as etapas seguintes;\n\`2\` Sua ficha será encaminhada para a nossa equipe.`
                      })
                      .setColor(config.COLOR)
                      .setImage(banner)

                    const row = new MessageActionRow().addComponents(
                      new MessageSelectMenu()
                        .setCustomId('painelmigra')
                        .setPlaceholder('Selecione uma opção')
                        .addOptions(
                          {
                            label: `Migração`,
                            emoji: `${emojis.etiq}`,
                            description: `Criar ficha para Migração.`,
                            value: `MigrarP`
                          },
                          {
                            label: `Recrutamento`,
                            emoji: `${emojis.team1}`,
                            description: `Criar ficha para Recrutamento.`,
                            value: `RecrutarP`
                          },
                          {
                            label: `Áreas`,
                            emoji: `${emojis.listwrite}`,
                            description: `Listar áreas disponíveis para recrutamento.`,
                            value: `AreasP`
                          },
                        )
                    );

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [Migracao], components: [row] })
                  });
              }
            });
          }

          if (customId === 'migralogs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de migração no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs6: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Migração):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'recrulogs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de recrutamento no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs7: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Recrutamento):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'migrafichas') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de fichas no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canalfichas: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Fichas:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'suportecanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de suporte no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                      canalsuporte: vCanal
                    });

                    if (snap2.val()) {
                      if (snap2.val().suporte) {
                        var banner = snap2.val().suporte;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Suporte:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                    const SejaMembro = new MessageEmbed()
                      .setAuthor({
                        name: 'Suporte - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`Nosso sistema de suporte foi feito para auxiliar a todos sobre quaisquer dúvida que surgir sobre nossos sistemas.`)
                      .addFields({
                        name: `Como funciona?`,
                        value: `\`1\` Para iniciar o suporte basta clicar no botão abaixo;\n\`2\` Aguarde um dos membros de nossa equipe lhe atender.`
                      })
                      .setColor(config.COLOR)
                      .setImage(banner)

                    const row = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('suporteiniciar')
                        .setLabel('Iniciar Suporte')
                        .setEmoji(`${emojis.right}`)
                    )

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [SejaMembro], components: [row] })
                  });
              }
            });
          }

          if (customId === 'suportecategoria') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a categoria de suporte no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  suportecategoria: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Categoria de Suporte:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'suportecargo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de suporte no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  suportecargo: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Suporte:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'suportelogs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs do suporte no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs4: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Suporte):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'verificarlogs') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de logs de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  canal_logs3: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal de Logs (Verificação):**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'verificarcargoadm') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo da equipe de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargoverificaradm: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo da Equipe de Verificação:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'verificarcargo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargoverificar: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Verificação:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'verificarcanal') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                      canalverificar: vCanal
                    });

                    if (snap2.val()) {
                      if (snap2.val().verificacao) {
                        var banner = snap2.val().verificacao;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Verificação:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                    const SejaMembro = new MessageEmbed()
                      .setAuthor({
                        name: 'Verificação - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(`Nosso sistema de verificação foi feito com o intuito de evitar pessoas que utilizam fotos fakes.`)
                      .addFields({
                        name: `Como funciona?`,
                        value: `\`1\` Para iniciar a verificação clique no botão abaixo;\n\`2\` Siga todos os pedidos dos verificadores.`
                      })
                      .setColor(config.COLOR)
                      .setImage(banner)

                    const row = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('verificariniciar')
                        .setLabel('Iniciar Verificação')
                        .setEmoji(`${emojis.right}`)
                    )

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [SejaMembro], components: [row] })
                  });
              }
            });
          }

          if (customId === 'sejamembrocargo') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o cargo de seja membro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCargo = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.roles.cache.get(vCargo)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  cargomembro: vCargo
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Cargo de Seja Membro:**\n**+** <@&${vCargo}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'canalsejamembro') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de seja membro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {

                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    database
                      .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
                      .once("value", snapshot => {

                        if (snap2.val()) {
                          if (snap2.val().sejamembro) {
                            var banner = snap2.val().sejamembro;
                          } else {
                            var banner = null;
                          }
                        } else {
                          var banner = null;
                        }

                        if (snapshot.val()) {
                          if (snapshot.val().url) {
                            var url = snapshot.val().url;
                          } else {
                            var url = 'newbots';
                          }
                        } else {
                          var url = 'newbots';
                        }

                        database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                          sejamembrocanal: vCanal
                        });

                        let EmbedExemplo = new MessageEmbed()
                          .setAuthor({
                            name: 'Alteração nas Configurações',
                            iconURL: imgur.Sucesso,
                            url: null
                          })
                          .setDescription(`**Canal de Seja Membro:**\n**+** <#${vCanal}>`)
                          .setColor(config.COLOR)

                        interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                        const SejaMembro = new MessageEmbed()
                          .setAuthor({
                            name: 'Seja Membro - ' + interaction.guild.name,
                            iconURL: interaction.guild.iconURL({ dynamic: true }),
                            url: null
                          })
                          .setDescription(`Se interessou pela nossa família e quer fazer parte? Coloque nossa **URL** em sua bio e receba vantagens especiais.`)
                          .addFields({
                            name: `URL's:`,
                            value: `・ https://discord.gg/${url}\n・ discord.gg/${url}\n・ .gg/${url}\n・ /${url}`
                          })
                          .setColor(config.COLOR)
                          .setImage(banner)

                        const row = new MessageActionRow().addComponents(
                          new MessageButton()
                            .setStyle('SECONDARY')
                            .setCustomId('sejamembroverificar')
                            .setLabel('Verificar')
                            .setEmoji(`${emojis.right}`)
                        )

                        interaction.guild.channels.cache.get(vCanal).send({ embeds: [SejaMembro], components: [row] })
                      });
                  });
              }
            });
          }

          if (customId === 'adicionarbot') {
            let textinput = new TextInputComponent()
              .setCustomId('addbot-input')
              .setLabel("ID DO BOT")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('addbot-modal')
              .setTitle(`Prefixos - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'removerbot') {
            let textinput = new TextInputComponent()
              .setCustomId('rembot-input')
              .setLabel("ID DO BOT")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('rembot-modal')
              .setTitle(`Prefixos - ${interaction.guild.name}`)
              .addComponents([textinput])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'canalprefixos') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de prefixos no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  prefixos: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Canal dos Prefixos:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });

                database
                  .ref(`Servidores/${interaction.guild.id}/Prefixos`)
                  .once("value", snapshot => {

                    var arr = [];
                    var counter = 0;

                    snapshot.forEach(v => {
                      arr.push({
                        ID: v.key
                      });

                      counter++;

                      if (counter === snapshot.numChildren()) {
                        arr.sort(function (a, b) {
                          return b - a;
                        });

                        var lista = arr.slice(0);
                        var msgArr = [];
                        var msgArr2 = [];
                        var count = 0;

                        lista.forEach(u => {
                          if (interaction.guild.members.cache.get(u.ID).voice.channel == null) {
                            msgArr.push(`<@${u.ID}>`)
                          } else {
                            msgArr2.push(`<@${u.ID}>`)
                          }

                          count++;

                          if (count == lista.length) {
                            var msg2 = msgArr.join(`\n`) || "Não há nenhum bot disponível";
                            var msg3 = msgArr2.join(`\n`) || "Não há nenhum bot indisponível";

                            const Tempo = new Date();

                            const Prefixos = new MessageEmbed()
                              .setAuthor({
                                name: 'Prefixos - ' + interaction.guild.name,
                                iconURL: interaction.guild.iconURL({ dynamic: true }),
                                url: null
                              })
                              .setDescription(`Para uma melhor experiência em nosso servidor, aqui esta a lista de bots de música disponíveis para uso:`)
                              .addFields({ name: `Disponíveis:`, value: msg2, inline: true },
                                { name: `Indisponíveis:`, value: msg3, inline: true })
                              .setColor(config.COLOR)
                              .setFooter({ text: `Atualizado em ` + Tempo.toLocaleString(`pt-br`) })

                            interaction.guild.channels.cache.get(vCanal).send({ embeds: [Prefixos] })
                          }
                        });
                      }
                    });
                  });
              }
            });
          }

          if (customId === 'cargosregistro') {
            let homem = new TextInputComponent()
              .setCustomId('homem-input')
              .setLabel("ID DO CARGO HOMEM")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            let mulher = new TextInputComponent()
              .setCustomId('mulher-input')
              .setLabel("ID DO CARGO MULHER")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            let maior = new TextInputComponent()
              .setCustomId('maior-input')
              .setLabel("ID DO CARGO +18")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            let menor = new TextInputComponent()
              .setCustomId('menor-input')
              .setLabel("ID DO CARGO -18")
              .setStyle('SHORT')
              .setMinLength(17)
              .setMaxLength(23)
              .setRequired(true)

            const modal = new Modal()
              .setCustomId('cargosregistro-modal')
              .setTitle(`Registro - ${interaction.guild.name}`)
              .addComponents([homem, mulher, maior, menor])

            showModal(modal, {
              client: this.client,
              interaction: interaction,
            });
          }

          if (customId === 'canalregistro') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie o canal de registro no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database
                  .ref(`Servidores/${interaction.guild.id}/Banners`)
                  .once("value", snap2 => {

                    if (snap2.val()) {
                      if (snap2.val().registro) {
                        var banner = snap2.val().registro;
                      } else {
                        var banner = null;
                      }
                    } else {
                      var banner = null;
                    }

                    database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                      registro: vCanal
                    });

                    let EmbedExemplo = new MessageEmbed()
                      .setAuthor({
                        name: 'Alteração nas Configurações',
                        iconURL: imgur.Sucesso,
                        url: null
                      })
                      .setDescription(`**Canal de Registro:**\n**+** <#${vCanal}>`)
                      .setColor(config.COLOR)

                    interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true });

                    let PainelRegistro = new MessageEmbed()
                      .setAuthor({
                        name: 'Registro - ' + interaction.guild.name,
                        iconURL: interaction.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setImage(banner)
                      .setDescription(`Possuimos um Sistema de Registro automático, você apenas terá que responder algumas perguntas necessárias.\n\n> ・ Qual seu gênero?\n> ・ Qual sua idade?`)
                      .setColor(config.COLOR)

                    const row = new MessageActionRow().addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('registrof')
                        .setLabel('Iniciar Registro')
                        .setEmoji(`${emojis.right}`)
                    )

                    interaction.guild.channels.cache.get(vCanal).send({ embeds: [PainelRegistro], components: [row] });
                  });
              }
            });
          }

          if (customId === 'verificarcategoria') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a categoria de verificação no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  categoriaverificar: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Categoria de Verificação:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }

          if (customId === 'categoria') {
            const Embed = new MessageEmbed()
              .setDescription(`Envie a categoria ou canal do contador no chat\nDigite \`cancelar\` para cancelar esta ação`)
              .setColor(config.COLOR)

            interaction.reply({ embeds: [Embed] });

            const filter = m => m.author.id === interaction.user.id
            await interaction.channel.awaitMessages({
              filter,
              max: 1
            }).then(async collected => {
              setTimeout(async () => {
                await interaction.channel.messages.delete(collected.first().id).catch(err => { });
                await interaction.deleteReply().catch(err => { });
              }, 150);

              if (collected.first().content.includes('cancelar')) {
                return;
              }

              var vCanal = collected.first().content.replace(/\D/g, '');

              if (interaction.guild.channels.cache.get(vCanal)) {
                database.ref(`Servidores/${interaction.guild.id}/Configuracoes`).update({
                  contador: vCanal
                });

                let EmbedExemplo = new MessageEmbed()
                  .setAuthor({
                    name: 'Alteração nas Configurações',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**Categoria do Contador:**\n**+** <#${vCanal}>`)
                  .setColor(config.COLOR)

                interaction.followUp({ embeds: [EmbedExemplo], ephemeral: true }).catch(err => { });
              }
            });
          }
        });
    }
  };
};
