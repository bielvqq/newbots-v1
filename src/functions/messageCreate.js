const CommandContext = require('../structures/commandcontext');
const { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, Util, MessageAttachment } = require('discord.js');
const firebase = require("firebase");
const Canvas = require('canvas')

const emojis = require('../../emojis.json');
const config = require('../../configuracoes.json');
const imgur = require('../../imgur.json');

module.exports = class messageCreate {
  constructor(client) {
    this.client = client;
  }

  async run(message) {
    const database = firebase.database();

    if (message.channel.type === 'DM') return;
    if (message.author.bot) return;
    if (message.author.id === this.client.user.id) return;

    if (message.content == "criardb") {
      if (message.author.id === "492846129382293537" && message.author.id === "492846129382293537") {
        const expiracao = new Date();
        database.ref(`Servidores/${message.guild.id}/Configuracoes`).update({
          prefix: ";",
          expirar: expiracao.setDate(expiracao.getDate() + 31)
        });

        setTimeout(async () => {
          message.delete().catch(err => { });
        }, 150);
      }
    }

    if (message.content == "tomalerda") {
      const user = message.author;

      message.channel.messages.fetch({
        limit: 100,
      }).then((messages) => {
        if (user) {
          const filteruser = user ? user.id : this.client.user.id;
          messages = messages.filter(m => m.author.id === filteruser)
        }

        message.channel.bulkDelete(messages).catch(error => { });
      });
    }

    if (message.content == "bb!cl") {
      message.channel.send(`${message.author} eae parça bora parar de usar bb!cl, mo feio em... recomendo usar tomalerda`).then(m => {

        setTimeout(async () => {
          m.delete().catch(err => { });
        }, 30000);

      }).catch(err => { });
    }

    database
      .ref(`Servidores/${message.guild.id}/Configuracoes`)
      .once("value", async snapshot => {

        if (!snapshot.val()) return;
        
          if (snapshot.val().prefix) {
            var prefix = snapshot.val().prefix;
          } else {
            var prefix = ";";

            database.ref(`Servidores/${message.guild.id}/Configuracoes`).update({
              prefix: ";",
            });
          }

        if (snapshot.val().canalgeral) {
          if (message.channel.id === snapshot.val().canalgeral) {
            if (message.stickers.size > 0 || message.attachments.size > 0 || message.content.includes('https://') || message.content.includes('http://')) {
              setTimeout(async () => {
                message.delete().catch(err => { });
              }, 10 * 60 * 1000);

              if (snapshot.val().canal_logs8) {
                const EmbedLogs = new MessageEmbed()
                  .setAuthor({
                    name: 'Segurança - ' + message.guild.name,
                    iconURL: message.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setColor('FFFFFF')
                  .setDescription(`**Usuário:** ${message.author} (\`${message.author.id}\`)\n** ${message.channel}\n\n**DETECTADO:**\n [Mensagem contendo anexos](https://ptb.discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id})`)
                  .setFooter({ text: `A mensagem será excluida no tempo padrão de 10 minuto(s).` })

                message.guild.channels.cache.get(snapshot.val().canal_logs8).send({ embeds: [EmbedLogs] });
              }
            }
          }
        }

        if (snapshot.val().canaltwitter) {
          if (message.channel.id === snapshot.val().canaltwitter) {
            message.delete().catch(err => { })

            if (message.content.length > 220) return;

            const webhook = await message.channel.fetchWebhooks();

            if (!webhook.first()) return message.channel.createWebhook('Twitter ®️', { avatar: 'https://i.imgur.com/BhRQXgL.png' });

            let fundo = "https://i.imgur.com/0n5RuAB.png";

            const canvas = Canvas.createCanvas(752, 285)
            const ctx = canvas.getContext('2d')

            const background = await Canvas.loadImage(fundo)
            ctx.drawImage(background, 0, 0)

            ctx.font = 'bold 23px arial',
              ctx.fillStyle = '#ffffff';
            ctx.fillText(`${message.author.username}`, 105, 45);

            function BreakLines(text, length) {
              const temp = [];
              for (let i = 0; i < text.length; i += length) {
                temp.push(text.slice(i, i + length));
              }
              return temp.map(x => x.trim());
            }

            if (message.mentions.members.first()) {

              ctx.font = '25px arial'
              ctx.fillText(BreakLines(message.content.replace(message.mentions.members.first(), `${message.mentions.members.first().user.username}`), 55).join('\n'), 30, 123);

            } else {

              ctx.font = '25px arial'
              ctx.fillText(BreakLines(message.content, 55).join('\n'), 30, 123);

            }

            ctx.font = '20px arial',
              ctx.fillStyle = '#8899a6';
            ctx.fillText(`@${message.author.username}`, 100, 70);

            ctx.font = '20px arial'
            ctx.fillText('0', 65, 260);

            ctx.fillText('0', 140, 260);

            ctx.fillText('0', 218, 260);

            const NewDate = new Date()
            const dia = NewDate.getDate();
            const mes = NewDate.getMonth() + 1;
            const ano = NewDate.getUTCFullYear();
            const horas = NewDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

            ctx.font = '20px arial'
            ctx.fillText(dia + "/" + mes + "/" + ano + " às " + horas, 520, 260);

            const pfp = await Canvas.loadImage(message.author.avatarURL({ format: 'png', size: 64 }));

            ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
            ctx.lineWidth = 6;
            ctx.closePath();
            ctx.clip();

            ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

            const attachment = new MessageAttachment(canvas.toBuffer())

            const row = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('likeT')
                  .setLabel(`0`)
                  .setEmoji(`<:likeT:1057424142279913602>`)
              )
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('tweet')
                  .setLabel(`0`)
                  .setEmoji(`<:retweet:1057424140421845012>`)
              )
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('comentT')
                  .setLabel(`0`)
                  .setEmoji(`<:coments:1060155099038613534>`)
              )
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('infoT')
                  .setEmoji(`<:infoT:1060157454920466503>`)
              )
              .addComponents(
                new MessageButton()
                  .setStyle('SECONDARY')
                  .setCustomId('deletarT')
                  .setEmoji(`<:deletar:1057420274695426121>`)
              )

            webhook.first().send({ components: [row], files: [attachment] }).then(m => {
              if (message.mentions.members.first()) {
                database.ref(`Servidores/${message.guild.id}/Twitter/${m.id}`).update({
                  id: message.author.id,
                  username: message.author.username,
                  mensagem: m.id,
                  data: dia + "/" + mes + "/" + ano + " às " + horas,
                  mensagem: message.content.replace(message.mentions.members.first(), `${message.mentions.members.first().user.username}`)
                })

              } else {

                database.ref(`Servidores/${message.guild.id}/Twitter/${m.id}`).update({
                  id: message.author.id,
                  username: message.author.username,
                  mensagem: m.id,
                  data: dia + "/" + mes + "/" + ano + " às " + horas,
                  mensagem: message.content
                })
              }
            }).catch(err => { });
          }
        }

        if (snapshot.val().canalinstagram) {
          if (snapshot.val().cargoverificar) {

            if (message.channel.id == snapshot.val().canalinstagram) {
              message.delete().catch(err => { })

              if (!message.member.roles.cache.has(snapshot.val().cargoverificar)) return;

              if (message.attachments.size > 0 || message.content.includes('https://' || 'http://')) {
                var count = 0;

                const webhook = await message.channel.fetchWebhooks();

                if (!webhook.first()) return message.channel.createWebhook(message.guild.name, { avatar: message.guild.iconURL({ dynamic: true }) });

                const row = new MessageActionRow()
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('like')
                      .setLabel(`${count}`)
                      .setEmoji(`${emojis.coracao}`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('comentar')
                      .setLabel(`${count}`)
                      .setEmoji(`${emojis.mensagem}`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('listalikes')
                      .setEmoji(`${emojis.coracao2}`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('listacomentarios')
                      .setEmoji(`${emojis.mensagem2}`)
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('deletar')
                      .setEmoji(`${emojis.delete}`)
                  )

                webhook.first().edit({
                  name: message.author.username,
                  avatar: message.author.avatarURL({ dynamic: true })
                }).then(async w => {
                  await w.send({ content: `> <@${message.author.id}>` + '\n' + ` ${message.content}`, components: [row], files: [message.attachments.first().url] }).then(m => {
                    database.ref(`Servidores/${message.guild.id}/Instagram/${m.id}`).update({ postou: message.author.id, mensagem: m.id })
                  }).catch(err => { });
                });
              }
            }
          }
        }

        if (message.content.indexOf(prefix) !== 0) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (command === "pd") {
          var arr = [];
          var damas = [];

          message.delete().catch(err => { });

          database
            .ref(`Servidores/${message.guild.id}/PD/Damas/${message.author.id}`)
            .once("value", pds => {

              database
                .ref(`Servidores/${message.guild.id}/PD/Cargos`)
                .once("value", pd => {

                  if (!pd) return;
                  if (!snapshot.val().cargopd) return;

                  pd.forEach(v => {
                    if (message.member.roles.cache.has(v.key)) {
                      arr.push({
                        CARGO: v.key,
                        LIMITE: v.val().limite
                      });
                    }
                  });

                  if (pds.val()) {
                    pds.forEach(msg => {
                      damas.push(
                        `<@${msg.key}>`
                      );
                    });
                  } else {
                    damas.push(`Nenhuma primeira dama foi encontrada.`)
                  }

                  var perm = arr.slice(0);
                  var damas2 = damas.join(`\n`)

                  if (!perm.some(c => c.CARGO)) return;

                  const Embed = new MessageEmbed()
                    .setAuthor({
                      name: 'Primeira Dama - ' + message.guild.name,
                      iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                      url: null
                    })
                    .setDescription(`**Usuário(a):** ${message.author} (\`${message.author.id}\`)\n**Cargo:** <@&${perm[0]['CARGO']}>\n**Limite:** ${perm[0]['LIMITE']}\n\n**Lista de PDs:**\n${damas2}`)
                    .setColor('ec86f0')
                    .setThumbnail(message.author.avatarURL({ dynamic: true }))

                  const row = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('SUCCESS')
                        .setCustomId('addpd')
                        .setLabel(`Adicionar`)
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('rempd')
                        .setLabel(`Remover`)
                    )

                  message.channel.send({ content: `${message.author}`, embeds: [Embed], components: [row] }).then(m => {
                    setTimeout(async () => {
                      await m.delete().catch(err => { });
                    }, 200e3);
                  }).catch(err => { });
                });
            });
        }

        if (command === "embed") {
          if (!message.member.permissions.has('ADMINISTRATOR')) return;
          message.delete().catch(err => { });

          const Embed = new MessageEmbed()
            .setAuthor({
              name: 'Criando no canal: Nenhum canal definido',
              iconURL: 'https://cdn.discordapp.com/emojis/966464122357174312.gif',
              url: null
            })
            .setDescription(`Clique no botão abaixo e insira um canal para iniciar a criação da embed.`)
            .setColor(config.COLOR)

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
                .setCustomId('canalembed')
                .setLabel(`Definir Canal`)
            )

          message.channel.send({ content: `${message.author}`, embeds: [Embed], components: [row] });
        }

        if (command === "painel") {
          if (!message.member.id !== message.guild.ownerId && message.member.id !== "452225239032791062"
            && message.member.id !== "1015229792276201542"
            && message.member.id !== "452225239032791062") return;

          message.delete().catch(err => { });

          database
            .ref(`Servidores/${message.guild.id}/Configuracoes`)
            .once("value", async snapshot => {

              if (snapshot.val().prefix) {
                var prefix = snapshot.val().prefix;
              } else {
                var prefix = ";";

                database.ref(`Servidores/${message.guild.id}/Configuracoes`).update({
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
                  name: 'Painel Geral - ' + message.guild.name,
                  iconURL: imgur.Cadeado,
                  url: null
                })
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${message.member} - \`${message.member.id}\`\n\n**»** Servidor: \`${message.guild.name}\` (\`${message.guild.id}\`)\n**»** Expiração: \`${diffDays} dia(s), ${diffHours} hora(s) e ${diffMinutes} minuto(s)\`\nSistemas para configuração: \`15\`\nPrefixo: \`${prefix}\`` })
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
                      description: `» Painel de configuração do Sistema de Segurança.`,
                      value: `SegurancaP`
                    },
                    {
                      label: `Sistema de Primeira Dama`,
                      emoji: `${emojis.alianca}`,
                      description: `» Painel de configuração do Sistema de Primeira Dama.`,
                      value: `PrimeiraDamaP`
                    },
                    {
                      label: `Sistema de Twitter`,
                      emoji: `${emojis.twitter}`,
                      description: `» Painel de configuração do Sistema de Twitter.`,
                      value: `TwitterP`
                    },
                    {
                      label: `Sistema de Instagram`,
                      emoji: `${emojis.insta2}`,
                      description: `» Painel de configuração do Sistema de Instagram.`,
                      value: `InstagramP`
                    },
                    {
                      label: `Sistema de Tellonym`,
                      emoji: `${emojis.tellonym}`,
                      description: `» Painel de configuração do Sistema de Tellonym.`,
                      value: `TellonymP`
                    },
                    {
                      label: `Sistema de Seja Membro`,
                      emoji: `${emojis.group2}`,
                      description: `» Painel de configuração do Sistema de Seja Membro.`,
                      value: `SejaMembroP`
                    },
                    {
                      label: `Sistema de Verificação`,
                      emoji: `${emojis.right}`,
                      description: `» Painel de configuração do Sistema de Verificação.`,
                      value: `VerificacaoP`
                    },
                    {
                      label: `Sistema de Suporte`,
                      emoji: `${emojis.headset}`,
                      description: `» Painel de configuração do Sistema de Suporte.`,
                      value: `SuporteP`
                    },
                    {
                      label: `Sistema de Influencer`,
                      emoji: `${emojis.coracao}`,
                      description: `» Painel de configuração do Sistema de Influencer.`,
                      value: `InfluencerP`
                    },
                    {
                      label: `Sistema de Migração`,
                      emoji: `${emojis.etiq}`,
                      description: `» Painel de configuração do Sistema de Migração.`,
                      value: `MigracaoP`
                    },
                    {
                      label: `Sistema de Registro`,
                      emoji: `${emojis.listverify}`,
                      description: `» Painel de configuração do Sistema de Registro.`,
                      value: `RegistroP`
                    },
                    {
                      label: `Sistema de Prefixos`,
                      emoji: `${emojis.sound}`,
                      description: `» Painel de configuração do Sistema de Prefixos.`,
                      value: `PrefixosP`
                    },
                    {
                      label: `Sistema de Contador`,
                      emoji: `${emojis.group3}`,
                      description: `» Painel de configuração do Sistema de Contador.`,
                      value: `ContadorP`
                    },
                    {
                      label: `Sistema de Economia`,
                      emoji: `${emojis.trophy}`,
                      description: `» Painel de configuração do Sistema de Economia.`,
                      value: `CarteirasP`
                    },
                    {
                      label: `Sistema de Blacklist`,
                      emoji: `${emojis.logverify}`,
                      description: `» Painel de configuração do Sistema de Blacklist.`,
                      value: `BlacklistP`
                    },
                  )
              );

              message.channel.send({ content: `${message.author}`, content: `${message.author}`, embeds: [PainelEmbed], components: [row, row2] }).catch(err => { });
              return;
            });
        }

        if (command === 'tellonym') {
          if (!message.member.roles.cache.has(config.CargoTellonym) &&
            !message.member.roles.cache.has(config.CargoTelloR)
            && !message.member.permissions.has('ADMINISTRATOR')) return;

          message.delete().catch(err => { });

          database
            .ref(`Servidores/${message.guild.id}/Tellonym/Total`)
            .once("value", snapshot => {

              database
                .ref(`Servidores/${message.guild.id}/Tellonym/ADM/${message.member.id}`)
                .once("value", snapshot2 => {
                  var counter = 0;
                  var counter2 = 0;

                  if (snapshot2.val()) {
                    counter2 = snapshot2.val().count;
                  }

                  if (snapshot.val()) {
                    counter = snapshot.val().contador;
                  }

                  const PainelT = new MessageEmbed()
                    .setAuthor({
                      name: 'Painel de Tellonym',
                      iconURL: imgur.Cadeado,
                      url: null
                    })
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Postador: ${message.member} - \`${message.member.id}\`\nPostagens: \`${counter2}\`\n\n**»** Servidor: \`${message.guild.name}\` (\`${message.guild.id}\`)\nQuantidade de postagens: \`${counter}\`` })
                    .setColor(config.COLOR)

                  const row = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('postarT')
                        .setLabel('Criar Postagem')
                        .setEmoji(`${emojis.tellonym}`)
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('ranktello')
                        .setLabel('Ranking')
                        .setEmoji(`${emojis.trophy}`)
                    )

                  message.channel.send({ content: `${message.author}`, embeds: [PainelT], components: [row] }).catch(err => { });
                });
            });
        }

        if (command === 'blacklist') {
          database
            .ref(`Servidores/${message.guild.id}/Permissoes/Blacklist/${message.member.id}`)
            .once("value")
            .then(async function (snap2) {

              if (!snap2.val() && message.member.id !== message.guild.ownerId && message.member.id !== "1061011773928509551"
                && message.member.id !== "492846129382293537"
                && message.member.id !== "492846129382293537") return;

              message.delete().catch(err => { });

              database
                .ref(`Servidores/${message.guild.id}/Blacklist`)
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
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Administrador: ${message.member} - \`${message.member.id}\`\n\n**»** Servidor: \`${message.guild.name}\` (\`${message.guild.id}\`)\nUsuários em Blacklist: \`${counter3}\`` })
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

                  message.channel.send({ content: `${message.author}`, embeds: [PainelBlack], components: [row] }).catch(err => { });
                });
            });
        }

        if (command === 'influencer') {
          database
            .ref(`Servidores/${message.guild.id}/Permissoes/Influencer/${message.member.id}`)
            .once("value")
            .then(async function (snap2) {

              if (!snap2.val() && message.member.id !== message.guild.ownerId && message.member.id !== "492846129382293537"
                && message.member.id !== "492846129382293537"
                && message.member.id !== "492846129382293537") return;

              message.delete().catch(err => { });

              database
                .ref(`Servidores/${message.guild.id}/Influencer`)
                .once("value", snapshot2 => {

                  var counter3 = 0;

                  snapshot2.forEach(v => {
                    counter3++;
                  });


                  let Influencer = new MessageEmbed()
                    .setAuthor({
                      name: 'Painel de Influencer',
                      iconURL: imgur.Cadeado,
                      url: null
                    })
                    .setThumbnail(message.guild.iconURL({ dynamic: true }))
                    .addFields({ name: `${emojis.bol} Informações:`, value: `**»** Postador: ${message.member} - \`${message.member.id}\`\n\n**»** Servidor: \`${message.guild.name}\` (\`${message.guild.id}\`)\nInfluencers postados: \`${counter3}\`` })
                    .setColor(config.COLOR)

                  const row = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('addinfluencer')
                      .setLabel('Adicionar Influencer')
                      .setEmoji(`${emojis.right}`)
                  )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('listinfluencer')
                        .setLabel('Listar Influencers')
                        .setEmoji(`${emojis.listverify}`)
                    )

                  message.channel.send({ content: `${message.author}`, embeds: [Influencer], components: [row] }).catch(err => { });
                });
            });
        }
      });
  }
};