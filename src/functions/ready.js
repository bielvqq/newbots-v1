const firebase = require('firebase');
const ms = require('milliseconds');
const Canvas = require('canvas');
const moment = require('moment');
moment.locale('pt-BR');

const { MessageActionRow, MessageButton, MessageEmbed, MessageAttachment } = require('discord.js');

const emojis = require('../../emojis.json');
const imgur = require('../../imgur.json');
const config = require('../../configuracoes.json');

const cooldowns = new Map();

var minutos = 30;

module.exports = class {
  constructor(client) {
    this.client = client;
  }

  async run() {
    console.clear();
    const database = firebase.database();

    var cliente = this.client;

    database
      .ref(`Servidores/${config.Guild}/Configuracoes`)
      .once("value", async snapshot => {

        if (snapshot.val()) {
          var prefix = snapshot.val().prefix;
        } else {
          var prefix = ";";
        }

        cliente.user.setActivity(`PDK no Topo`, {
          type: "STREAMING",
          url: "https://twitch.tv/bielsete_"
        });

        setInterval(() => {
          cliente.user.setActivity(`Nifetinha do Anonny`, {
            type: "STREAMING",
            url: "https://twitch.tv/bielsete_"
          });
        }, 500e3);
      });

    setInterval(async () => {
      database
        .ref(`Servidores/${interaction.guild.id}/Configuracoes`)
        .once("value", async snapshot => {

          if (!snapshot.val()) return;

          const agora = new Date();
          const diffTime = snapshot.val().expirar - agora;
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays === 28) {
            console.log('[EXPIRAÇÃO] BOT EXPIRANDO.');
          }
          if (diffDays < 0) {
            cliente.users.cache.get('492846129382293537').send('BOT Expirou: ' + this.client.user.username + ' - Servidor: ' + config.Guild)
            process.exit();
          }
        });
    }, 86400000);

    console.log(`🤖 \x1b[36m[BOT ONLINE]\x1b[0m`, `Logado como: \x1b[35m${this.client.user.username}\x1b[37m, iniciado com sucesso.`);

    await this.client.application.commands.set(this.client.commands);

    setInterval(async () => {
      ///// CONTADOR CALL /////
      database
        .ref(`Servidores/${config.Guild}/Configuracoes`)
        .once("value", async snap => {

          if (!snap.val()) return;

          if (!snap.val().contador) return;
          if (!snap.val().msgcontador) return;

          var contador2 = snap.val().msgcontador;

          let guild = this.client.guilds.cache.get(config.Guild);

          if (!guild.channels.cache.get(snap.val().contador)) return;

          const voiceChannels = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE');

          let userCount = voiceChannels.reduce((a, c) => {
            if (!c.isVoice()) return;
            return a + c.members.size
          }, 0
          )

          const Atualizando = new Date()

          let Atualizando2 =
            + Atualizando.getHours() + ":"
            + Atualizando.getMinutes() + ":"
            + Atualizando.getSeconds()

          await guild.channels.cache.get(snap.val().contador).setName(`${contador2.replace(/{contador}/g, userCount)}`)
          console.log(`${Atualizando2} \x1b[36m[CONTADOR]\x1b[0m`, `Categoria de Membros em Call atualizada com sucesso.`)
        });
    }, 300e3);

    setInterval(async () => {
      ///// PREFIXOS /////

      database
        .ref(`Servidores/${config.Guild}/Configuracoes`)
        .once("value", async snap => {
          if (!snap.val()) return;

          if (!snap.val().prefixos) return;

          database
            .ref(`Servidores/${config.Guild}/Prefixos`)
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
                    if (this.client.guilds.cache.get(config.Guild).members.cache.get(u.ID).voice.channel == null) {
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
                          name: 'Prefixos - ' + this.client.guilds.cache.get(config.Guild).name,
                          iconURL: this.client.guilds.cache.get(config.Guild).iconURL({ dynamic: true }),
                          url: null
                        })
                        .setDescription(`Para melhorar sua experiência em nosso servidor, aqui esta a lista de bots de música disponíveis para uso:`)
                        .addFields({ name: `Disponíveis:`, value: msg2, inline: true },
                          { name: `Indisponíveis:`, value: msg3, inline: true })
                        .setColor(config.COLOR)
                        .setFooter({ text: `› Atualizado em ` + moment(new Date()).format('LLL') })

                      cliente.guilds.cache.get(config.Guild).channels.cache.get(snap.val().prefixos).messages.fetch({ limit: 1 }).then(messages => {
                        let lastMessage = messages.first();
                        lastMessage.edit({ embeds: [Prefixos] }).catch(err => { });
                      });

                      const Atualizando = new Date()

                      let Atualizando2 =
                        + Atualizando.getHours() + ":"
                        + Atualizando.getMinutes() + ":"
                        + Atualizando.getSeconds()

                      console.log(`${Atualizando2} \x1b[36m[PREFIXOS]\x1b[0m`, `Mensagem de prefixos atualizada com sucesso.`)
                    }
                  });
                }
              });
            });
        });
    }, 100e3);

    async function influencerman() {
      var influencer = [];

      database
        .ref(`Servidores/${config.Guild}/Configuracoes/`)
        .once("value", async snap1 => {

          if (!snap1.val().instamensagens) return;
          if (!snap1.val().canalinfluencer) return;
          if (!snap1.val().cargoinfluencer) return;

          const insta = await cliente.guilds.cache.get(config.Guild).channels.fetch(snap1.val().canalinstagram)
          const messages = await insta.messages.fetch({ limit: snap1.val().instamensagens })

          if (messages) {
            messages.forEach(msg => {
              if (!msg.components[0]) return;
              if (msg.components[0]) {
                influencer.push({ mensagemid: msg.id, numero: msg.components[0].components[0].label, imagem: msg.attachments.first().url })
              }
            })
          }

          var comparacao = influencer.sort(function (a, b) { return b.numero - a.numero; })[0]
          if (!comparacao) return;

          database
            .ref(`Servidores/${config.Guild}/Instagram/${comparacao.mensagemid}`)
            .once("value", async snapshot => {

              database
                .ref(`Servidores/${config.Guild}/Instagram/`)
                .once("value", async cargo => {

                  if (!snapshot.val().postou) return;

                  let user = cliente.users.cache.get(snapshot.val().postou)
                  let guild = cliente.guilds.cache.get(config.Guild)
                  let canal = guild.channels.cache.get(snap1.val().canalinfluencer)
                  let usuariocargo = guild.members.cache.get(user.id)

                  canal.bulkDelete(50).catch(err => { });

                  if (snapshot.val().m) {
                    var comentarios = { number: snapshot.val().m.mensagens.length }

                  } else {
                    var comentarios = { number: "0" }
                  }

                  const Embed = new MessageEmbed()
                    .setAuthor({ name: `Destaque do Instagram - ${guild.name}`, iconURL: guild.iconURL({ dynamic: true }) })
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setColor(config.COLOR)
                    .addFields(
                      { name: ` Novo(a) Destaque:`, value: `${user}` },
                      { name: ` Curtidas:`, value: `**${comparacao.numero}**`, inline: true },
                      { name: ` Comentarios:`, value: `**${comentarios.number}**`, inline: true },
                    )
                    .setFooter({ text: `› Atualizado em ` + moment(new Date()).format('LLL') })

                  const row = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('LINK')
                        .setLabel(`Ir para a publicação`)
                        .setURL(`https://discord.com/channels/${config.Guild}/${snap1.val().canalinstagram}/${comparacao.mensagemid}`)
                    )

                  if (cargo.val().influencer) {
                    const antigo = guild.members.cache.get(cargo.val().influencer)

                    await usuariocargo.roles.add(snap1.val().cargoinfluencer);

                    if (cargo.val().influencer !== user.id) {
                      await usuariocargo.roles.add(snap1.val().cargoinfluencer);
                      await antigo.roles.remove(snap1.val().cargoinfluencer)
                    }

                    setTimeout(async () => {
                      await database.ref(`Servidores/${config.Guild}/Instagram`).update({ influencer: user.id });
                    }, 500);

                  } else {
                    await database.ref(`Servidores/${config.Guild}/Instagram`).update({ influencer: user.id });

                    await usuariocargo.roles.add(snap1.val().cargoinfluencer);
                  }

                  const Atualizando = new Date()

                  var Atualizando2 =
                    + Atualizando.getHours() + ":"
                    + Atualizando.getMinutes() + ":"
                    + Atualizando.getSeconds()

                  console.log(`${Atualizando2} \x1b[36m[DESTAQUE]\x1b[0m`, `Destaque atual atualizado com sucesso.`)

                  setTimeout(async () => {
                    canal.send({ embeds: [Embed], components: [row] });
                    canal.send({ files: [comparacao.imagem] });
                  }, 1000);
                });
            });
        });
    }

    setInterval(influencerman, 60 * 60 * 1000)

    ///////////////////////////////// REGISTRO DE AUDITORIA /////////////////////////////////
    cliente.on('guildMemberUpdate', async (oldMember, newMember) => {
      const guild = newMember.guild;

      database
        .ref(`Servidores/${newMember.guild.id}/Configuracoes`)
        .once("value").then(async config => {

          if (!config.val()) return;

          guild.fetchAuditLogs({ type: 25, limit: 1 }).then(async audit => {

            if (!config.val().cargopd) return;

            /// ADICIONAR CARGO
            if (audit.entries.first().changes.map(r => r.key).find(m => m) === '$add') {
              if (config.val().cargopd == audit.entries.first().changes.map(m => m.new[0]['id'])) {
                if (audit.entries.first().executor.id == this.client.user.id) return;

                await newMember.roles.remove(config.val().cargopd).catch(err => { });
              }
            }

            /// REMOVER CARGO
            if (audit.entries.first().changes.map(r => r.key).find(m => m) === '$remove') {

              database
                .ref(`Servidores/${guild.id}/PD/Damas/${audit.entries.first().target.id}`)
                .once("value").then(async usuario => {

                  database
                    .ref(`Servidores/${newMember.guild.id}/PD/Cargos`)
                    .once("value").then(async cargo => {

                      if (!usuario.val()) return;

                      cargo.forEach(function (u) {
                        if (u.key === audit.entries.first().changes.map(r => r.new[0]['id']).find(m => m)) {

                          database.ref(`Servidores/${guild.id}/PD/Damas/${audit.entries.first().target.id}/`).remove();

                          const Embed = new MessageEmbed()
                            .setAuthor({
                              name: 'Primeira Dama - ' + guild.name,
                              iconURL: 'https://cdn.discordapp.com/emojis/976632820728487997.png',
                              url: null
                            })
                            .setThumbnail(guild.iconURL({ dynamic: true }))
                            .setColor('ec86f0')
                            .setDescription(`Todas suas **Primeiras Damas** no servidor \`${guild.name}\` foram removidas.\n\n**MOTIVO:** Seu cargo foi removido.`)

                          newMember.user.send({ embeds: [Embed] }).then(async m => {
                            setTimeout(() => {
                              m.delete().catch(err => { })
                            }, 500e3);
                          }).catch(err => { });

                          usuario.forEach(function (v) {
                            if (guild.members.cache.get(v.key)) {
                              guild.members.cache.get(v.key).roles.remove(config.val().cargopd).catch(err => { });
                            }
                          });
                        }
                      });
                    });
                });
            }
          }).catch(err => { });
        });
    });
    ///////////////////////////////// REGISTRO DE AUDITORIA /////////////////////////////////

    // BLACKLIST DB
    this.client.on("guildMemberAdd", async (member) => {
      database
        .ref(`Servidores/${member.guild.id}/Configuracoes`)
        .once("value")
        .then(async function (cargoentra) {

          if (!cargoentra.val()) return;

          if (cargoentra.val().cargovisitante) {
            if (!member.roles.cache.has(cargoentra.val().cargovisitante)) return member.roles.add(cargoentra.val().cargovisitante).catch(err => { });
          }

          database
            .ref(`Servidores/${member.guild.id}/Blacklist/${member.id}`)
            .once("value").then(async function (snap) {

              if (snap.val()) {
                const Embed = new MessageEmbed()
                  .setAuthor({
                    name: 'Você foi banido(a) - ' + member.guild.name,
                    iconURL: member.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .addFields([{ name: `${emojis.bol} Informações:`, value: `Banido por: \`Sistema de Blacklist\`\nDuração: \`Permanente\`\nMotivo: \`${snap.val().motivo}\`\n\nCaso ache a blacklist injusta procure algum membro da Administração.` }])
                  .setThumbnail(member.guild.iconURL({ dynamic: true }))
                  .setColor(config.COLOR)

                member.send({ embeds: [Embed] }).catch(err => { });

                setTimeout(async () => {
                  await member.ban({ reason: `Banido pelo sistema de BLACKLIST. (${snap.val().motivo})`, deleteMessageSeconds: 3 * 24 * 60 * 60 }).catch(err => { });
                }, 500);

                /// LOGS ///
                if (!cargoentra.val().canal_logs) return;

                /// EMBED ADICIONAR 
                const ban = new MessageEmbed()
                  .setAuthor({
                    name: 'Blacklist - ' + member.guild.name,
                    iconURL: member.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(` **BANIDO(A)**\n\n **Membro:** ${member} - \`${member.id}\``)
                  .setColor('FFFFFF')

                member.guild.channels.cache.get(cargoentra.val().canal_logs).send({ embeds: [ban] }).catch(err => { });
                /// LOGS ///
              }
            });
        });
    });

    this.client.on('modalSubmit', async (modal) => {

      if (modal.customId === 'tellopublicar-modal') {
        const id = modal.getTextInputValue('tellopublicar-input');
        const msg = modal.getTextInputValue('tellopublicar2-input');

        database
          .ref(`Servidores/${modal.guild.id}/Configuracoes`)
          .once("value")
          .then(async function (snapshot) {

            if (!snapshot.val().tellofiltro) return;

            const Embed1 = new MessageEmbed()
              .setColor(config.COLOR)
              .setDescription(`Você não pode enviar este tipo de mensagem anônima.`)

            if (msg.includes("preto") || msg.includes("http://") || msg.includes("https://")
              || msg.includes("preta") || msg.includes("fdp") || msg.includes("lixo")
              || msg.includes("escrava") || msg.includes("escravo") || msg.includes("lixa")
              || msg.includes("puta") || msg.includes("piranha") || msg.includes("cadela")
              || msg.includes("arrombada") || msg.includes("arrombado") || msg.includes("discord.gg")
              || msg.includes(".gg")
            ) return modal.reply({ embeds: [Embed1], ephemeral: true });

            const marcado = modal.guild.members.cache.get(id);

            if (id) {
              const Embed4 = new MessageEmbed()
                .setColor(config.COLOR)
                .setDescription(`O ID inserido não foi encontrado no servidor.`)

              if (!marcado) return modal.reply({ embeds: [Embed4], ephemeral: true });
            }

            const Embed2 = new MessageEmbed()
              .setColor(config.COLOR)
              .setDescription(`Sua mensagem anônima foi enviada para análise.`)

            modal.reply({ embeds: [Embed2], ephemeral: true });

            let fundo = "https://i.imgur.com/YhvI78F.png";

            const canvas = Canvas.createCanvas(752, 285)
            const ctx = canvas.getContext('2d')

            const background = await Canvas.loadImage(fundo)
            ctx.drawImage(background, 0, 0)

            ctx.font = 'bold 17px arial',
              ctx.fillStyle = '#f9fafb';

            function BreakLines(text, length) {
              const temp = [];
              for (let i = 0; i < text.length; i += length) {
                temp.push(text.slice(i, i + length));
              }
              return temp.map(x => x.trim());
            }

            ctx.font = '17px arial'
            ctx.fillText(BreakLines(msg, 80).join('\n'), 47, 80);

            const attachment = new MessageAttachment(canvas.toBuffer())

            const row = new MessageActionRow()
              .addComponents(
                new MessageButton()
                  .setStyle('SUCCESS')
                  .setCustomId('tellosim')
                  .setLabel('Aceitar')
              )
              .addComponents(
                new MessageButton()
                  .setStyle('DANGER')
                  .setCustomId('tellonao')
                  .setLabel('Recusar')
              )

            if (id) {
              modal.guild.channels.cache.get(snapshot.val().tellofiltro).send({ content: `**Menção:** ${marcado}`, files: [attachment], components: [row] });
            } else {
              modal.guild.channels.cache.get(snapshot.val().tellofiltro).send({ files: [attachment], components: [row] });
            }
          });
      }

      if (modal.customId === 'cargoM-modal') {
        const id = modal.getTextInputValue('cargoM-input');

        if (!modal.guild.members.cache.get(id)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        var chn = modal.guild.channels.cache.get(modal.channelId)
        const membro = modal.guild.members.cache.get(id)

        database
          .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Membro/${membro.user.id}`)
          .once("value")
          .then(async function (snap2) {

            if (!snap2.val() && membro.user.id !== chn.topic) return modal.reply({ content: `> **»** Este membro não está adicionado a migração.`, ephemeral: true })

            database
              .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Cargos/cargos`)
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
                    name: 'Migração - ' + modal.guild.name,
                    iconURL: modal.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(`**Usuário:** ${membro.user} (\`${membro.user.id}\`)\n**Responsável:** ${modal.user}\n\n**CARGOS:**\n${msgArr}`)
                  .setFooter({ text: `Os cargos só serão adicionados após concluir a migração.` })

                const row = new MessageActionRow().addComponents(
                  new MessageButton()
                    .setStyle('DANGER')
                    .setCustomId('cargoremoverMIG')
                    .setLabel('Remover Cargos')
                )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SECONDARY')
                      .setCustomId('definircargoMIG')
                      .setLabel('Definir Cargo')
                  )
                  .addComponents(
                    new MessageButton()
                      .setStyle('SUCCESS')
                      .setCustomId('cargoconcluirMIG')
                      .setLabel('Concluir')
                  )

                modal.reply({ embeds: [Embed], components: [row] });
              });
          });
      }

      if (modal.customId === "comentarT-modal") {
        const msg = modal.getTextInputValue('comentarT-input');

        const Embed1 = new MessageEmbed()
          .setColor(config.COLOR)
          .setDescription(`Você não pode enviar este tipo de comentário.`)

        if (msg.includes("preto") || msg.includes("http://") || msg.includes("https://")
          || msg.includes("preta") || msg.includes("fdp") || msg.includes("lixo")
          || msg.includes("escrava") || msg.includes("escravo") || msg.includes("luxa")
          || msg.includes("puta") || msg.includes("piranha") || msg.includes("cadela")
          || msg.includes("arrombada") || msg.includes("arrombado")
        ) return modal.reply({ embeds: [Embed1], ephemeral: true });

        var counter = 0;
        var counter2 = 0;

        database
          .ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}`)
          .once("value", async snap1 => {

            database
              .ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}/RT`)
              .once("value", async snap2 => {

                snap2.forEach(v => {
                  counter2++;
                });

                database
                  .ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}/Curtiu`)
                  .once("value", async snapshot => {

                    snapshot.forEach(v => {
                      counter++;
                    });

                    database
                      .ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}/m`)
                      .once("value", async snap3 => {

                        if (snap3.val()) {
                          var count = snap3.val().mensagens.length
                        } else {
                          var count = 0;
                        }

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
                        ctx.fillText(Number(counter), 65, 260);

                        ctx.fillText(Number(counter2), 140, 260);

                        ctx.fillText(Number(count) + 1, 218, 260);

                        ctx.font = '20px arial'
                        ctx.fillText(snap1.val().data, 520, 260);

                        const pfp = await Canvas.loadImage(modal.guild.members.cache.get(snap1.val().id).user.avatarURL({ format: 'png', size: 64 }));

                        ctx.arc(60, 50, 32, 0, Math.PI * 2, true);
                        ctx.lineWidth = 6;
                        ctx.closePath();
                        ctx.clip();

                        ctx.drawImage(pfp, 28, 18, pfp.height, pfp.width);

                        const attachment = new MessageAttachment(canvas.toBuffer())

                        if (!snap3.val()) {
                          await database.ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}/m`).set({ mensagens: [{ mensagem: msg, author: modal.member.id }] })

                          let Embed3 = new MessageEmbed()
                            .setColor(config.COLOR)
                            .setDescription(`Seu comentário foi enviado com sucesso.`)

                          modal.message.components[0].components[2].label = Number(count) + 1;
                          let buttons = modal.message.components[0];
                          await modal.update({ files: [attachment], components: [buttons] }).catch(err => { });

                          await modal.followUp({ embeds: [Embed3], ephemeral: true });
                        } else {

                          await database.ref(`Servidores/${modal.guild.id}/Twitter/${modal.message.id}/m/mensagens`).update({ [`${Object.keys(snap3.val().mensagens).length}`]: { mensagem: msg, author: modal.member.id } })

                          let Embed3 = new MessageEmbed()
                            .setColor(config.COLOR)
                            .setDescription(`Seu comentário foi enviado com sucesso.`)

                          modal.message.components[0].components[2].label = Object.keys(snap3.val().mensagens).length + 1;
                          let buttons = modal.message.components[0];
                          await modal.update({ files: [attachment], components: [buttons] }).catch(err => { });

                          await modal.followUp({ embeds: [Embed3], ephemeral: true });

                        }
                      });
                  });
              });
          });
      }

      if (modal.customId === "comentar-modal") {
        const msg = modal.getTextInputValue('comentar-input');

        const Embed1 = new MessageEmbed()
          .setColor(config.COLOR)
          .setDescription(`Você não pode enviar este tipo de comentário.`)

        if (msg.includes("preto") || msg.includes("http://") || msg.includes("https://")
          || msg.includes("preta") || msg.includes("fdp") || msg.includes("lixo")
          || msg.includes("escrava") || msg.includes("escravo") || msg.includes("luxa")
          || msg.includes("puta") || msg.includes("piranha") || msg.includes("cadela")
          || msg.includes("arrombada") || msg.includes("arrombado")
        ) return modal.reply({ embeds: [Embed1], ephemeral: true });

        database.ref(`Servidores/${modal.guild.id}/Instagram/${modal.message.id}/m`)
          .once("value", async snapshot2 => {

            if (snapshot2.val()) {
              var count = snapshot2.val().mensagens.length
            } else {
              var count = 0;
            }

            if (!snapshot2.val()) {
              await database.ref(`Servidores/${modal.guild.id}/Instagram/${modal.message.id}/m`).set({ mensagens: [{ mensagem: msg, author: modal.member.id }] })

              let Embed3 = new MessageEmbed()
                .setColor(config.COLOR)
                .setDescription(`Seu comentário foi enviado com sucesso.`)

              modal.message.components[0].components[1].label = Number(count) + 1;
              let buttons = modal.message.components[0];
              await modal.update({ components: [buttons] }).catch(err => { });

              await modal.followUp({ embeds: [Embed3], ephemeral: true });

            } else {

              await database.ref(`Servidores/${modal.guild.id}/Instagram/${modal.message.id}/m/mensagens`).update({ [`${Object.keys(snapshot2.val().mensagens).length}`]: { mensagem: msg, author: modal.member.id } })

              let Embed3 = new MessageEmbed()
                .setColor(config.COLOR)
                .setDescription(`Seu comentário foi enviado com sucesso.`)

              modal.message.components[0].components[1].label = Object.keys(snapshot2.val().mensagens).length + 1;
              let buttons = modal.message.components[0];
              await modal.update({ components: [buttons] }).catch(err => { });

              await modal.followUp({ embeds: [Embed3], ephemeral: true });
            }
          });
      }

      if (modal.customId === 'instageralmodal-modal') {
        const canal = modal.getTextInputValue('instacanal2-input');
        const cargo = modal.getTextInputValue('instacargo2-input');

        if (!modal.guild.channels.cache.get(canal)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })
        if (!modal.guild.roles.cache.get(cargo)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        const channel = modal.guild.channels.cache.get(canal);
        const role = modal.guild.roles.cache.get(cargo);

        database.ref(`Servidores/${modal.guild.id}/Configuracoes`).update({
          canalinfluencer: canal,
          cargoinfluencer: cargo
        });

        let EmbedExemplo = new MessageEmbed()
          .setAuthor({
            name: 'Alteração nas Configurações',
            iconURL: imgur.Sucesso,
            url: null
          })
          .setDescription(`**Configurações de Influencer:**\n**+** ${channel}\n**+** ${role}`)
          .setColor(config.COLOR)

        modal.reply({ embeds: [EmbedExemplo], ephemeral: true });
      }

      if (modal.customId === 'recrutarp-modal') {
        const areas = modal.getTextInputValue('recrutarp-input');

        database
          .ref(`Servidores/${modal.guild.id}/Recrutamento/${modal.user.id}`)
          .once("value").then(async function (snap1) {

            if (snap1.val()) {
              const JaAbriu = new MessageEmbed()
                .setColor(config.COLOR)
                .setDescription(`Você já abriu um recrutamento, aguarde o processo ser finalizado.`);

              const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('LINK')
                  .setLabel('Clique para ir até seu recrutamento')
                  .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${snap1.val().canal}`)
              )

              modal.reply({ embeds: [JaAbriu], components: [row], ephemeral: true });
              return;
            }

            database
              .ref(`Servidores/${modal.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snap) {

                if (!snap.val().migracargo) return;
                if (!snap.val().migracategoria) return;

                modal.guild.channels.create(`📋-${modal.user.tag}`, {
                  topic: modal.user.id,
                  permissionOverwrites: [
                    {
                      type: 'member',
                      id: modal.user.id,
                      allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'],
                    },
                    {
                      id: modal.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                    {
                      id: modal.guild.roles.cache.get(snap.val().migracargo),
                      allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                  ],
                  type: 'text',
                  parent: snap.val().migracategoria
                }).then(async channel => {

                  channel.send(`<@&${snap.val().migracargo}>`).then(m => m.delete());

                  await database.ref(`Servidores/${modal.guild.id}/Recrutamento/${modal.user.id}`).update({ canal: channel.id, area: areas })

                  const AbriuAgora = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`Você iniciou um recrutamento, para ir até o canal clique no botão abaixo.`);

                  const row2 = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Clique para ir até seu canal de recrutamento')
                      .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${channel.id}`)
                  )

                  modal.reply({ embeds: [AbriuAgora], components: [row2], ephemeral: true });

                  ///////////////

                  const Ficha = new MessageEmbed()
                    .setAuthor({
                      name: 'Recrutamento - ' + modal.guild.name,
                      iconURL: modal.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setDescription(`**Membro:** ${modal.user} (\`${modal.user.id}\`)\n**Responsável:** \`Nenhum responsável assumiu esta ficha\`\n\n**»** Área: **${areas}**`)
                    .setColor(config.COLOR)
                    .setThumbnail(modal.guild.iconURL({ dynamic: true }))

                  const row4 = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('excluirREC')
                        .setLabel('Cancelar')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('assumirfichaREC')
                        .setLabel('Assumir Ficha')
                        .setEmoji(`${emojis.right}`)
                    )

                  channel.send({ embeds: [Ficha], components: [row4] });

                  const ircanal = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Ir até o canal')
                      .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${channel.id}`)
                  )

                  modal.guild.channels.cache.get(snap.val().canalfichas).send({ embeds: [Ficha], components: [ircanal] }).then(async m => {
                    await database.ref(`Servidores/${modal.guild.id}/Recrutamento/${modal.user.id}`).update({ ficha: m.id })
                  })
                });
              });
          });
      }

      /////////////////////////////////// MIGRAÇÃO

      if (modal.customId === 'migrariniciar-modal') {
        const pessoas = modal.getTextInputValue('migrarpessoas-input');
        const url = modal.getTextInputValue('migrarurl-input');

        database
          .ref(`Servidores/${modal.guild.id}/Migracao/${modal.user.id}`)
          .once("value")
          .then(async function (snap1) {

            if (snap1.val()) {
              const JaAbriu = new MessageEmbed()
                .setColor(config.COLOR)
                .setDescription(`Você já abriu uma migração, aguarde o processo ser finalizado.`);

              const row = new MessageActionRow().addComponents(
                new MessageButton()
                  .setStyle('LINK')
                  .setLabel('Clique para ir até sua migração')
                  .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${snap1.val().canal}`)
              )

              modal.reply({ embeds: [JaAbriu], components: [row], ephemeral: true });
              return;
            }

            database
              .ref(`Servidores/${modal.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (snap) {

                if (!snap.val().migracargo) return;
                if (!snap.val().migracategoria) return;

                modal.guild.channels.create(`👑-${modal.user.tag}`, {
                  topic: modal.user.id,
                  permissionOverwrites: [
                    {
                      type: 'member',
                      id: modal.user.id,
                      allow: ['SEND_MESSAGES', 'VIEW_CHANNEL', 'EMBED_LINKS', 'ATTACH_FILES'],
                    },
                    {
                      id: modal.guild.roles.everyone,
                      deny: ['VIEW_CHANNEL'],
                    },
                    {
                      id: modal.guild.roles.cache.get(snap.val().migracargo),
                      allow: ['MANAGE_CHANNELS', 'MOVE_MEMBERS', 'STREAM', 'CONNECT', 'SPEAK', 'VIEW_CHANNEL'],
                    },
                  ],
                  type: 'text',
                  parent: snap.val().migracategoria
                }).then(async channel => {

                  channel.send(`<@&${snap.val().migracargo}>`).then(m => m.delete());

                  await database.ref(`Servidores/${modal.guild.id}/Migracao/${modal.user.id}`).update({ canal: channel.id, quantidade: pessoas, servidor: url })

                  const AbriuAgora = new MessageEmbed()
                    .setColor(config.COLOR)
                    .setDescription(`Você iniciou uma migração, para ir até o canal clique no botão abaixo.`);

                  const row2 = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Clique para ir até seu canal de migração')
                      .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${channel.id}`)
                  )

                  modal.reply({ embeds: [AbriuAgora], components: [row2], ephemeral: true });

                  ///////////////

                  const Ficha = new MessageEmbed()
                    .setAuthor({
                      name: 'Migração - ' + modal.guild.name,
                      iconURL: modal.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setDescription(`**Membro:** ${modal.user} (\`${modal.user.id}\`)\n**Responsável:** \`Nenhum responsável assumiu esta ficha\`\n\n**»** Pessoas que vão vir: **${pessoas}**\n**»** URL do Servidor: **${url}**`)
                    .setColor(config.COLOR)
                    .setThumbnail(modal.guild.iconURL({ dynamic: true }))

                  const row4 = new MessageActionRow()
                    .addComponents(
                      new MessageButton()
                        .setStyle('DANGER')
                        .setCustomId('excluirM')
                        .setLabel('Cancelar')
                    )
                    .addComponents(
                      new MessageButton()
                        .setStyle('SECONDARY')
                        .setCustomId('assumirficha')
                        .setLabel('Assumir Ficha')
                        .setEmoji(`${emojis.right}`)
                    )

                  channel.send({ embeds: [Ficha], components: [row4] });

                  const ircanal = new MessageActionRow().addComponents(
                    new MessageButton()
                      .setStyle('LINK')
                      .setLabel('Ir até o canal')
                      .setURL(`https://ptb.discord.com/channels/${modal.guild.id}/${channel.id}`)
                  )

                  modal.guild.channels.cache.get(snap.val().canalfichas).send({ embeds: [Ficha], components: [ircanal] }).then(async m => {
                    await database.ref(`Servidores/${modal.guild.id}/Migracao/${modal.user.id}`).update({ ficha: m.id })
                  })
                });
              });
          });
      }

      if (modal.customId === 'remm-modal') {
        const id = modal.getTextInputValue('remm-input');

        if (!modal.guild.members.cache.get(id)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        var chn = modal.guild.channels.cache.get(modal.channelId)

        database
          .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}`)
          .once("value")
          .then(async function (snap) {

            database
              .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Membro/${id}`)
              .once("value")
              .then(async function (snap2) {

                const canaltexto = modal.guild.channels.cache.get(snap.val().canal)
                const canalvoz = modal.guild.channels.cache.get(snap.val().canalvoz)
                const membro = modal.guild.members.cache.get(id)

                if (!snap2.val()) return modal.reply({ content: `> ${modal.user} esse usuário não está nesta migração.`, ephemeral: true })

                if (canalvoz) {
                  canalvoz.permissionOverwrites.edit(membro, {
                    STREAM: false,
                    CONNECT: false,
                    SPEAK: false,
                    VIEW_CHANNEL: false
                  });
                }

                if (canaltexto) {
                  canaltexto.permissionOverwrites.edit(membro, {
                    SEND_MESSAGES: false,
                    VIEW_CHANNEL: false,
                    EMBED_LINKS: false,
                    ATTACH_FILES: false
                  });
                }

                const Removido = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`**»** ${membro} (\`${membro.user.id}\`) foi removido do canal de migração por ${modal.user}.`)

                modal.reply({ embeds: [Removido] });

                await database.ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Membro/${id}`).remove();

              });
          });
      }

      if (modal.customId === 'addm-modal') {
        const id = modal.getTextInputValue('addm-input');

        if (!modal.guild.members.cache.get(id)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        var chn = modal.guild.channels.cache.get(modal.channelId)

        database
          .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}`)
          .once("value")
          .then(async function (snap) {

            database
              .ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Membro/${id}`)
              .once("value")
              .then(async function (snap2) {

                const canaltexto = modal.guild.channels.cache.get(snap.val().canal)
                const canalvoz = modal.guild.channels.cache.get(snap.val().canalvoz)
                const membro = modal.guild.members.cache.get(id)

                if (snap2.val()) return modal.reply({ content: `> ${modal.user} esse usuário já foi adicionado.`, ephemeral: true })

                if (canalvoz) {
                  canalvoz.permissionOverwrites.edit(membro, {
                    STREAM: true,
                    CONNECT: true,
                    SPEAK: true,
                    VIEW_CHANNEL: true
                  });
                }

                if (canaltexto) {
                  canaltexto.permissionOverwrites.edit(membro, {
                    SEND_MESSAGES: true,
                    VIEW_CHANNEL: true,
                    EMBED_LINKS: true,
                    ATTACH_FILES: true
                  });
                }

                const Adicionado = new MessageEmbed()
                  .setColor(config.COLOR)
                  .setDescription(`**»** ${membro} (\`${membro.user.id}\`) foi adicionado ao canal de migração por ${modal.user}.`)

                modal.reply({ embeds: [Adicionado] });

                await database.ref(`Servidores/${modal.guild.id}/Migracao/${chn.topic}/Membro/${id}`).set({ por: modal.user.id })
              });
          });
      }
      /////////////////////////////////// MIGRAÇÃO

      if (modal.customId === 'addbot-modal') {
        const id = modal.getTextInputValue('addbot-input');

        if (!this.client.users.cache.get(id).bot) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        database.ref(`Servidores/${modal.guild.id}/Prefixos/${id}`).update({
          colocou: modal.user.id
        });

        let EmbedExemplo = new MessageEmbed()
          .setAuthor({
            name: 'Alteração nas Configurações',
            iconURL: imgur.Sucesso,
            url: null
          })
          .setDescription(`**Novo BOT adicionado:**\n**+** <@${id}>`)
          .setColor(config.COLOR)

        modal.reply({ embeds: [EmbedExemplo], ephemeral: true })
      }

      if (modal.customId === 'rembot-modal') {
        const id = modal.getTextInputValue('rembot-input');

        if (!this.client.users.cache.get(id).bot) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        database.ref(`Servidores/${modal.guild.id}/Prefixos/${id}`).remove();

        let EmbedExemplo = new MessageEmbed()
          .setAuthor({
            name: 'Alteração nas Configurações',
            iconURL: imgur.Sucesso,
            url: null
          })
          .setDescription(`**BOT Removido:**\n**-** <@${id}>`)
          .setColor(config.COLOR)

        modal.reply({ embeds: [EmbedExemplo], ephemeral: true })
      }

      ////

      if (modal.customId === 'cargosregistro-modal') {
        const mulher = modal.getTextInputValue('mulher-input');
        const homem = modal.getTextInputValue('homem-input');
        const maior = modal.getTextInputValue('maior-input');
        const menor = modal.getTextInputValue('menor-input');

        if (!modal.guild.roles.cache.has(mulher)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })
        if (!modal.guild.roles.cache.has(homem)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })
        if (!modal.guild.roles.cache.has(maior)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })
        if (!modal.guild.roles.cache.has(menor)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        database.ref(`Servidores/${modal.guild.id}/Configuracoes`).update({
          mulher: mulher,
          homem: homem,
          maior: maior,
          menor: menor
        });

        let EmbedExemplo = new MessageEmbed()
          .setAuthor({
            name: 'Alteração nas Configurações',
            iconURL: imgur.Sucesso,
            url: null
          })
          .setDescription(`**Cargos de Registro:**\n**+** <@&${mulher}>\n**+** <@&${homem}>\n**+** <@&${maior}>\n**+** <@&${menor}>`)
          .setColor(config.COLOR)

        modal.reply({ embeds: [EmbedExemplo], ephemeral: true });
      }

      if (modal.customId === 'blacklist2-modal') {
        const id = modal.getTextInputValue('idblack2-input');

        const user = await this.client.users.fetch(id);

        if (!user) return modal.reply({ content: `> <@${id}> não foi encontrado na database.`, ephemeral: true })

        database
          .ref(`Servidores/${modal.guild.id}/Blacklist/${id}`)
          .once("value")
          .then(async function (snap) {

            if (!snap.val()) {
              modal.reply({ content: `> <@${id}> não foi encontrado na database.`, ephemeral: true })
              return;
            }

            if (snap.val()) {
              database
                .ref(`Servidores/${modal.guild.id}/Blacklist/${id}`).remove();

              /// EMBED
              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Blacklist - ' + modal.guild.name,
                  iconURL: imgur.Log,
                  url: null
                })
                .setDescription(`**Removido:**\n**-** ${user}`)
                .setColor(config.COLOR)

              modal.reply({ embeds: [EmbedExemplo], ephemeral: true });

              /// LOGS ///
              database
                .ref(`Servidores/${modal.guild.id}/Configuracoes`)
                .once("value")
                .then(async function (logs) {

                  if (!logs.val().canal_logs) return;

                  /// EMBED ADICIONAR 
                  const remover = new MessageEmbed()
                    .setAuthor({
                      name: 'Blacklist - ' + modal.guild.name,
                      iconURL: modal.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setDescription(` **BLACKLIST REMOVIDA**\n\n **Membro:** ${user} (\`${id}\`)\n **Responsável:** ${modal.user}`)
                    .setColor('FFFFFF')

                  modal.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [remover] }).catch(err => { });
                });
              /// LOGS ///

              const listaban = modal.guild.bans.fetch(id).catch(err => { });

              if (listaban) {
                modal.guild.members.unban(id, `Blacklist removida por: ${modal.user.tag}`).catch(err => { });
                return;
              }
            }
            return;
          });
      }

      if (modal.customId === 'blacklist-modal') {
        const id = modal.getTextInputValue('idblack-input');
        const reason = modal.getTextInputValue('motivoblack-input');

        const user = await this.client.users.fetch(id);

        if (!user) return modal.reply({ content: `> Você precisa inserir um ID válido.`, ephemeral: true })


        if (modal.guild.members.cache.get(id)) {
          const blacklistado = modal.guild.members.cache.get(id).roles.highest.rawPosition
          const admin = modal.guild.members.cache.get(modal.user.id).roles.highest.rawPosition

          if (blacklistado > admin) return modal.reply({ content: `> **»** Você não pode adicionar alguém com um cargo maior que o seu.`, ephemeral: true })
        }

        database
          .ref(`Servidores/${modal.guild.id}/Blacklist/${id}`)
          .once("value")
          .then(async function (snap) {

            if (snap.val() == null) {
              database.ref(`Servidores/${modal.guild.id}/Blacklist/${id}`).set({
                staff: modal.user.id,
                motivo: reason,
                usuario: user.username + '#' + user.discriminator
              });
            }

            if (snap.val()) {
              modal.reply({ content: `> ${user} já foi adicionado por <@${snap.val().staff}>.`, ephemeral: true })
              return;
            }

            /// EMBED
            let EmbedExemplo = new MessageEmbed()
              .setAuthor({
                name: 'Blacklist - ' + modal.guild.name,
                iconURL: imgur.Log,
                url: null
              })
              .setDescription(`**Adicionado:**\n**+** ${user}`)
              .setColor(config.COLOR)

            modal.reply({ embeds: [EmbedExemplo], ephemeral: true });

            const Embed2 = new MessageEmbed()
              .setAuthor({
                name: 'Você foi banido(a) - ' + modal.guild.name,
                iconURL: modal.guild.iconURL({ dynamic: true }),
                url: null
              })
              .addFields([{ name: `${emojis.bol} Informações:`, value: `Banido por: \`Sistema de Blacklist\`\nDuração: \`Permanente\`\nMotivo: \`${reason}\`\n\nCaso ache a blacklist injusta procure algum membro da Administração.` }])
              .setThumbnail(modal.guild.iconURL({ dynamic: true }))
              .setColor(config.COLOR)

            user.send({ embeds: [Embed2] }).catch(err => { });

            if (modal.guild.members.cache.get(user.id)) {
              setTimeout(async () => {
                await modal.guild.members.cache.get(user.id).ban({ reason: `Banido pelo sistema de BLACKLIST. (${reason})`, deleteMessageSeconds: 3 * 24 * 60 * 60 }).catch(`Não foi possível banir o usuário ${user.tag}`);
              }, 500)
            }

            /// LOGS ///
            database
              .ref(`Servidores/${modal.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (logs) {

                if (!logs.val().canal_logs) return;

                /// EMBED ADICIONAR 
                const add = new MessageEmbed()
                  .setAuthor({
                    name: 'Blacklist - ' + modal.guild.name,
                    iconURL: modal.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(` **BLACKLIST ADICIONADA**\n\n **Membro:** ${user} (\`${id}\`)\n **Responsável:** ${modal.user}\n\n**Motivo:** \`${reason}\``)
                  .setColor('ffffff')

                modal.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [add] }).catch(err => { });
              });
            /// LOGS ///

          });
        return;
      }

      if (modal.customId === 'enviarmo-modal') {
        const id = modal.getTextInputValue('idmo-input');
        const quantidade = modal.getTextInputValue('quantmo-input');

        if (!this.client.users.cache.get(id)) return modal.reply({ content: `> Você precisa inserir um ID válido.`, ephemeral: true })

        var din = Number(quantidade);

        if (isNaN(din) || din <= 0 || din !== Math.trunc(din))
          return modal.reply({ content: `> Você precisa inserir uma quantidade valida.`, ephemeral: true });

        if (id === modal.user.id)
          return modal.reply({ content: '> Você não pode transferir para si mesmo.', ephemeral: true });

        if (this.client.users.cache.get(id).bot)
          return modal.reply({ content: '> Você não pode transferir para um bot.', ephemeral: true });

        database
          .ref(`Cash/Carteira/${id}`)
          .once("value")
          .then(async function (enviado) {

            if (!enviado.val()) return modal.reply({ content: `> <@${id}> não possui uma carteira de moedas.`, ephemeral: true })

            database
              .ref(`Cash/Carteira/${modal.user.id}`)
              .once("value")
              .then(async function (moedas) {

                var moedinhas = Number(moedas.val().carteira);
                var moedinhas2 = Number(enviado.val().carteira);

                if (din > 500) return modal.reply({ content: '> Valor máximo para transferência é **500 moedas**.', ephemeral: true })

                if (moedinhas < din) return modal.reply({ content: '> Você não tem dinheiro o suficiente para transferir.', ephemeral: true })

                const cooldown = cooldowns.get(modal.user.id);

                if (cooldown) {
                  return modal.reply({ content: `> Você precisa aguardar \`10 segundo(s)\` para efetuar uma transferência novamente.`, ephemeral: true });
                }

                cooldowns.set(modal.user.id, Date.now() + 10000);
                setTimeout(() => cooldowns.delete(modal.user.id), 10000);

                let transferido = moedinhas - din;
                let recebido = moedinhas2 + din;

                database
                  .ref("Cash/Carteira/" + modal.user.id)
                  .update({
                    carteira: transferido
                  });

                database
                  .ref("Cash/Carteira/" + id)
                  .update({
                    carteira: recebido
                  });

                let transfer = new MessageEmbed()
                  .setAuthor({
                    name: 'Transferência efetuada',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**»** Sua transferência para <@${id}> (\`${id}\`) de **${din} moeda(s)** foi efetuada com sucesso!`)
                  .setColor(config.COLOR)

                let receb = new MessageEmbed()
                  .setAuthor({
                    name: 'Transferência recebida',
                    iconURL: imgur.Sucesso,
                    url: null
                  })
                  .setDescription(`**»** Você recebeu uma transferência de ${modal.user} (\`${modal.user.id}\`) no total de **${din} moeda(s)**.`)
                  .setColor(config.COLOR)

                modal.reply({ embeds: [transfer], ephemeral: true });
                modal.guild.members.cache.get(id).send({ embeds: [receb] }).catch(err => { });

                /// LOGS ///
                database
                  .ref(`Servidores/${modal.guild.id}/Configuracoes`)
                  .once("value")
                  .then(async function (logs) {

                    if (!logs.val().canal_logs2) return;

                    /// EMBED ADICIONAR 
                    const ban = new MessageEmbed()
                      .setAuthor({
                        name: 'Economia - ' + modal.guild.name,
                        iconURL: modal.guild.iconURL({ dynamic: true }),
                        url: null
                      })
                      .setDescription(` **ECONOMIA TRANSFERENCIA**\n\n **Destinatário:** <@${id}> (\`${id}\`)\n **Remetente:** ${modal.user}\n\n**Quantidade:** \`${din} moeda(s)\``)
                      .setColor('FFFFFF')

                    modal.guild.channels.cache.get(logs.val().canal_logs2).send({ embeds: [ban] }).catch(err => { });
                  });
                /// LOGS ///
              });
          });
      }

      ///////////////////
      if (modal.customId === 'add-modal') {
        const id = modal.getTextInputValue('add-input');

        if (!this.client.users.cache.get(id)) return modal.reply({ content: `> Você precisa inserir um ID válido.`, ephemeral: true })

        database
          .ref(`Servidores/${modal.guild.id}/Permissoes/Blacklist/${id}`)
          .once("value")
          .then(async function (snap) {

            if (snap.val()) {
              modal.reply({ content: `> **[PERMISSÕES]** <@${id}> já foi adicionado por <@${snap.val().colocou}>.`, ephemeral: true })
              return;
            }

            if (snap.val() == null) {
              database.ref(`Servidores/${modal.guild.id}/Permissoes/Blacklist/${id}`).set({
                colocou: modal.user.id,
              });
            }

            // EMBED
            let EmbedExemplo = new MessageEmbed()
              .setAuthor({
                name: 'Blacklist - ' + modal.guild.name,
                iconURL: modal.guild.iconURL({ dynamic: true }),
                url: null
              })
              .setDescription(`**Adicionado:**\n**+** <@${id}>`)
              .setColor(config.COLOR)

            modal.reply({ embeds: [EmbedExemplo], ephemeral: true });

            /// LOGS ///
            database
              .ref(`Servidores/${modal.guild.id}/Configuracoes`)
              .once("value")
              .then(async function (logs) {

                if (!logs.val().canal_logs) return;

                /// EMBED ADICIONAR 
                const ban = new MessageEmbed()
                  .setAuthor({
                    name: 'Blacklist - ' + modal.guild.name,
                    iconURL: modal.guild.iconURL({ dynamic: true }),
                    url: null
                  })
                  .setDescription(` **PERMISSÕES ADICIONADAS**\n\n **Membro:**\n**+** <@${id}> - \`${id}\`\n **Responsável:** ${modal.user}`)
                  .setColor('ffffff')

                modal.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [ban] }).catch(err => { });
              });
            /// LOGS ///
          });
      }

      if (modal.customId === 'rem-modal') {
        const id = modal.getTextInputValue('rem-input');

        if (!this.client.users.cache.get(id)) return modal.reply({ content: `> ${modal.user} insira um ID válido.`, ephemeral: true })

        database
          .ref(`Servidores/${modal.guild.id}/Permissoes/Blacklist/${id}`)
          .once("value")
          .then(async function (snap) {

            if (snap.val()) {
              database
                .ref(`Servidores/${modal.guild.id}/Permissoes/Blacklist/${id}`).remove();

              /// EMBED
              let EmbedExemplo = new MessageEmbed()
                .setAuthor({
                  name: 'Blacklist - ' + modal.guild.name,
                  iconURL: modal.guild.iconURL({ dynamic: true }),
                  url: null
                })
                .setDescription(`**Removido:**\n**-** <@${id}>`)
                .setColor(config.COLOR)

              modal.reply({ embeds: [EmbedExemplo], ephemeral: true });

              /// LOGS ///
              database
                .ref(`Servidores/${modal.guild.id}/Configuracoes`)
                .once("value")
                .then(async function (logs) {

                  if (!logs.val().canal_logs) return;

                  /// EMBED ADICIONAR 
                  const ban = new MessageEmbed()
                    .setAuthor({
                      name: 'Blacklist - ' + modal.guild.name,
                      iconURL: modal.guild.iconURL({ dynamic: true }),
                      url: null
                    })
                    .setDescription(` **PERMISSÕES REMOVIDAS**\n\n **Membro:**\n**+** <@${id}> - \`${id}\`\n **Responsável:** ${modal.user}`)
                    .setColor('ffffff')

                  modal.guild.channels.cache.get(logs.val().canal_logs).send({ embeds: [ban] }).catch(err => { });
                });
              /// LOGS ///

            }
            return;
          });
      }
    });

    /// ***************** SISTEMA NOVO ***************** ///
    this.client.on("voiceStateUpdate", async (oldMember, newMember) => {
      let usuario = newMember.guild.members.cache.get(newMember.id)

      if (usuario.user.bot == true) return;

      database
        .ref(`Servidores/${newMember.guild.id}/Configuracoes`)
        .once("value", async snapshot => {

          if (!snapshot.val()) return;

          if (!snapshot.val().cargo_moeda) return;

          if (!usuario.roles.cache.has(snapshot.val().cargo_moeda)) return;

          let oldVoice = oldMember.channel;
          let newVoice = newMember.channel;

          database
            .ref(`Servidores/${newMember.guild.id}/Cash/Contando/${newMember.id}`)
            .once("value")
            .then(async function (cash) {

              if (!oldVoice) {

                await database.ref(`Servidores/${newMember.guild.id}/Cash/Contando/${newMember.id}`).set({
                  contando: true,
                  tempo: new Date().getTime()
                });

              } else if (!newVoice) {

                if (await cash.val() == null) return;

                if (await cash.val().contando === true) {

                  var tempo = await cash.val().tempo
                  const start = new Date().getTime();
                  const diff = Math.abs(tempo - start);
                  var tempo2 = Math.ceil(diff / 1000)

                  if (tempo2) {
                    tempo = tempo2.toString().replace("-", "")
                  }

                  if (tempo === 0 || tempo === null) {
                    tempo = "Você não possui nenhum tempo salvo!"
                  } else {

                    let totalSeconds = (ms.seconds(tempo) / 1000);
                    let hours = Math.floor(totalSeconds / 3600);
                    totalSeconds %= 86400;
                    totalSeconds %= 3600;
                    let minutes = Math.floor(totalSeconds / 60);
                    let seconds = Math.floor(totalSeconds % 60);

                    tempo = hours + ' hora(s), ' + minutes + ' minuto(s) e ' + seconds + ' segundos.';

                    if (minutes >= minutos) {
                      var user = await newMember.guild.members.cache.get(newMember.id)

                      const RecebeuCoins = new MessageEmbed()
                        .setAuthor({
                          name: 'Recompensa - ' + newMember.guild.name,
                          iconURL: imgur.Trofeu,
                          url: null
                        })
                        .setDescription(`**»** Parabéns, você ficou **30 minuto(s)** ativo em um canal de voz e recebeu **30 moeda(s)**.\n\n> Para resgatar sua recompensa aperte no botão abaixo.`)
                        .setColor(config.COLOR)

                      const row = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('receber')
                          .setLabel('Resgatar Recompensa')
                          .setEmoji(`${emojis.arrow}`)
                      )

                      await user.send({ embeds: [RecebeuCoins], components: [row] }).catch(err => { });
                    }
                  }
                }
              } else {

                if (await cash.val() == null) return;

                if (await cash.val().contando === true) {

                  var tempo = await cash.val().tempo
                  const start = new Date().getTime();
                  const diff = Math.abs(tempo - start);
                  var tempo2 = Math.ceil(diff / 1000)

                  if (tempo2) {
                    tempo = tempo2.toString().replace("-", "")
                  }

                  if (tempo === 0 || tempo === null) {

                    tempo = "Você não possui nenhum tempo salvo!"

                  } else {

                    let totalSeconds = (ms.seconds(tempo) / 1000);
                    let hours = Math.floor(totalSeconds / 3600);
                    totalSeconds %= 86400;
                    totalSeconds %= 3600;
                    let minutes = Math.floor(totalSeconds / 60);
                    let seconds = Math.floor(totalSeconds % 60);

                    tempo = hours + ' hora(s), ' + minutes + ' minuto(s) e ' + seconds + ' segundos.';

                    if (minutes >= minutos) {
                      var user = await newMember.guild.members.cache.get(newMember.id)

                      const RecebeuCoins = new MessageEmbed()
                        .setAuthor({
                          name: 'Recompensa - ' + newMember.guild.name,
                          iconURL: imgur.Trofeu,
                          url: null
                        })
                        .setDescription(`**»** Parabéns, você ficou **30 minuto(s)** ativo em um canal de voz e recebeu **30 moeda(s)**.\n\n> Para resgatar sua recompensa aperte no botão abaixo.`)
                        .setColor(config.COLOR)

                      const row = new MessageActionRow().addComponents(
                        new MessageButton()
                          .setStyle('SECONDARY')
                          .setCustomId('receber')
                          .setLabel('Resgatar Recompensa')
                          .setEmoji(`${emojis.arrow}`)
                      )

                      await user.send({ embeds: [RecebeuCoins], components: [row] }).catch(err => { });
                    }
                  }

                  await database.ref(`Servidores/${newMember.guild.id}/Cash/Contando/${newMember.id}`).update({
                    tempo: tempo2,
                    contando: false
                  });
                }


                if (newMember.selfMute === true) {
                  if (usuario.voice.channel) {
                    if (await cash.val() == null) return;

                    if (await cash.val().contando === true) {

                      var tempo = await cash.val().tempo
                      const start = new Date().getTime();
                      const diff = Math.abs(tempo - start);
                      var tempo2 = Math.ceil(diff / 1000)

                      if (tempo2) {
                        tempo = tempo2.toString().replace("-", "")
                      }

                      if (tempo === 0 || tempo === null) {
                        tempo = "Você não possui nenhum tempo salvo!"
                      } else {

                        let totalSeconds = (ms.seconds(tempo) / 1000);
                        let hours = Math.floor(totalSeconds / 3600);
                        totalSeconds %= 86400;
                        totalSeconds %= 3600;
                        let minutes = Math.floor(totalSeconds / 60);
                        let seconds = Math.floor(totalSeconds % 60);

                        tempo = hours + ' hora(s), ' + minutes + ' minuto(s) e ' + seconds + ' segundos.';

                        if (minutes >= minutos) {
                          var user = await newMember.guild.members.cache.get(newMember.id)

                          const RecebeuCoins = new MessageEmbed()
                            .setAuthor({
                              name: 'Recompensa - ' + newMember.guild.name,
                              iconURL: imgur.Trofeu,
                              url: null
                            })
                            .setDescription(`**»** Parabéns, você ficou **30 minuto(s)** ativo em um canal de voz e recebeu **30 moeda(s)**.\n\n> Para resgatar sua recompensa aperte no botão abaixo.`)
                            .setColor(config.COLOR)

                          const row = new MessageActionRow().addComponents(
                            new MessageButton()
                              .setStyle('SECONDARY')
                              .setCustomId('receber')
                              .setLabel('Resgatar Recompensa')
                              .setEmoji(`${emojis.arrow}`)
                          )

                          await user.send({ embeds: [RecebeuCoins], components: [row] }).catch(err => { });
                        }
                      }

                      await database.ref(`Servidores/${newMember.guild.id}/Cash/Contando/${newMember.id}`).update({
                        tempo: tempo2,
                        contando: false
                      });
                      return;
                    }
                  }
                } else {
                  if (usuario.voice.channel) {
                    await database.ref(`Servidores/${newMember.guild.id}/Cash/Contando/${newMember.id}`).update({
                      tempo: new Date().getTime(),
                      contando: true
                    });
                  }
                }
                return;
              }
            });
        });
    });
  }
};