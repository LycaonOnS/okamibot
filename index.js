const Discord = require('discord.js')
const fs = require('fs')
const { Client, Attachment } = require('discord.js');
const client = new Discord.Client()
let prefix = "*"
client.login(process.env.auth) 

const warns = JSON.parse(fs.readFileSync('./warns.json'))
const birthdays = JSON.parse(fs.readFileSync("./birthdays.json"));

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Servir le grand Lycaon`);
  });

/*Quand quelqu'un rejoint*/
client.on('guildMemberAdd', member => {
    const embed = new Discord.RichEmbed()
        .setDescription(':tada: **' + member.user.username + "** a rejoint le Discord de l'" + member.guild.name)
        .setFooter('Nous sommes désormais ' + member.guild.memberCount)
    member.guild.channels.get(process.env.channel).send(embed)
    member.guild.channels.get(process.env.channel).send('**Bienvenue ' + member.user + "** je t'invite à te rendre dans le règlement, si tu réagis avec l'emote tu accéderas aux autres salons.")
    console.log('+1')
    //member.addRole('ID DU ROLE A AJOUTER AUTOMATIQUEMENT')
})

/*Help*/
client.on('message', function (message) {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
    
    if (args[0].toLowerCase() === prefix + "help") {
        let embed = new Discord.RichEmbed()
            .setColor("#008000")
            .setTitle('**Liste des commandes :**')
            .addField("__*sorties__ :", "Planning des sorties.", 'false')
            .addField("__*avatar__ :", "Affiche sa propre image de profil.", 'false')
            .addField("__*avatar @mention__ :", "Affiche l'image de profil de la personne mentionnée.", 'false')
            .addField("__*ping__ :", "Pong !", 'false')
        message.channel.send(embed)
    }
 
/*Kick*/
    if (args[0].toLowerCase() === prefix + 'kick') {
       if (!message.member.hasPermission('KICK_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande, revenez quand vous serez plus puissant ;(")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send("Veuillez mentionner un utilisateur, je ne suis pas devin :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas kick cet utilisateur :x:")
       if (!member.kickable) return message.channel.send("Je ne peux pas exclure cet utilisateur, il est trop fort pour moi :sunglass:")
       member.kick()
       message.channel.send('**' + member.user.username + '** a été exclu, il ne faut pas énerver un loup :white_check_mark:')
    }

/*Ban*/
    if (args[0].toLocaleLowerCase() === prefix + 'ban') {
       if (!message.member.hasPermission('BAN_MEMBERS')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande, revenez quand vous serez plus puissant ;(")
       let member = message.mentions.members.first()
       if (!member) return message.channel.send("Veuillez mentionner un utilisateur :x:")
       if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.owner.id) return message.channel.send("Vous ne pouvez pas bannir cet utilisateur :x:")
       if (!member.bannable) return message.channel.send("Je ne peux pas bannir cet utilisateur, il est trop fort pour moi :sunglass:")
       message.guild.ban(member, {days: 7})
       message.channel.send('**' + member.user.username + '** a été banni, il ne faut pas énerver un loup :white_check_mark:')
    }

/*Clear*/
    if (args[0].toLowerCase() === prefix + "clear") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let count = parseInt(args[1])
        if (!count) return message.channel.send("Veuillez indiquer un nombre de messages à supprimer")
        if (isNaN(count)) return message.channel.send("Veuillez indiquer un nombre valide")
        if (count < 1 || count > 99) return message.channel.send("Veuillez indiquer un nombre entre 1 et 99")
        message.channel.bulkDelete(count + 1)
    }
 /*Mute*/
    if (args[0].toLowerCase() === prefix + "mute") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Membre introuvable")
        if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas mute ce membre")
        if (member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne peux pas mute ce membre")
        let muterole = message.guild.roles.find(role => role.name === 'Muted')
        if (muterole) {
            member.addRole(muterole)
            message.channel.send(member + ' a été mute :white_check_mark:')
        }
        else {
            message.guild.createRole({name: 'Muted', permissions: 0}).then(function (role) {
                message.guild.channels.filter(channel => channel.type === 'text').forEach(function (channel) {
                    channel.overwritePermissions(role, {
                        SEND_MESSAGES: false
                    })
                })
                member.addRole(role)
                message.channel.send(member + ' a été mute :white_check_mark:')
            })
        }
    }
    if (args[0].toLowerCase() === prefix + "warn") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Veuillez mentionner un membre")
        if (member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas warn ce membre")
        let reason = args.slice(2).join(' ')
        if (!reason) return message.channel.send("Veuillez indiquer une raison")
        if (!warns[member.id]) {
            warns[member.id] = []
        }
        warns[member.id].unshift({
            reason: reason,
            date: Date.now(),
            mod: message.author.id
        })
        fs.writeFileSync('./warns.json', JSON.stringify(warns))
        message.channel.send(member + " a été warn pour " + reason + " :white_check_mark:")
    }
 
    if (args[0].toLowerCase() === prefix + "listewarn") {
        if (!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande")
        let member = message.mentions.members.first()
        if (!member) return message.channel.send("Veuillez mentionner un membre")
        let embed = new Discord.RichEmbed()
            .setAuthor(member.user.username, member.user.displayAvatarURL)
            .addField('10 derniers warns', ((warns[member.id] && warns[member.id].length) ? warns[member.id].slice(0, 10).map(e => e.reason) : "Ce membre n'a aucun warns"))
            .setTimestamp()
        message.channel.send(embed)
    }
/*unmute*/
    if (args[0].toLowerCase() === prefix + "demute") {
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
        let member = message.mentions.members.first()
        if(!member) return message.channel.send("Membre introuvable")
        if(member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas unmute ce membre.")
        if(member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne peux pas unmute ce membre.")
        let muterole = message.guild.roles.find(role => role.name === 'Muted')
        if(muterole && member.roles.has(muterole.id)) member.removeRole(muterole)
        message.channel.send(member + ' a été unmute :white_check_mark:')
    }
 
/*unwarn*/
    if (args[0].toLowerCase() === prefix + "dewarn") {
        let member = message.mentions.members.first()
        if(!message.member.hasPermission('MANAGE_MESSAGES')) return message.channel.send("Vous n'avez pas la permission d'utiliser cette commande.")
        if(!member) return message.channel.send("Membre introuvable")
        if(member.highestRole.calculatedPosition >= message.member.highestRole.calculatedPosition && message.author.id !== message.guild.ownerID) return message.channel.send("Vous ne pouvez pas unwarn ce membre.")
        if(member.highestRole.calculatedPosition >= message.guild.me.highestRole.calculatedPosition || member.id === message.guild.ownerID) return message.channel.send("Je ne peux pasunwarn ce membre.")
        if(!warns[member.id] || !warns[member.id].length) return message.channel.send("Ce membre n'a actuellement aucun warns.")
        warns[member.id].shift()
        fs.writeFileSync('./warns.json', JSON.stringify(warns))
        message.channel.send("Le dernier warn de " + member + " a été retiré :white_check_mark:")
    }
/*Planning*/
    if (args[0].toLowerCase() === prefix + "sorties") {
        let embed = new Discord.RichEmbed()
            .setColor("ORANGE")
            .setTitle('**Planning des sorties :**')
            .addField("__Yama of the Hell__ :", "Le mercredi, une semaine sur deux.", 'false')
            .addField("__Peerless Battle Spirit__ :", "Le vendredi, chaque semaine.", 'true')
        message.channel.send(embed)
}
/*Avatar*/
    if (args[0].toLowerCase() === prefix + "avatar") {
        let member = message.mentions.members.first()
      if (member) {
          let embed = new Discord.RichEmbed()
            .setColor("#4169E1")
            .setTitle('Avatar de ' + member.user.username + ' :')
            .setImage(member.user.avatarURL)
          message.channel.send(embed)
        }
      else {
          let embed = new Discord.RichEmbed()
            .setColor("#4169E1")
            .setTitle('Avatar de ' + message.author.username + ' :')
            .setImage(message.author.avatarURL)
          message.channel.send(embed)}
    }
})
/*Ping*/
client.on("message", async message => {
    if (!message.guild) return
    let args = message.content.trim().split(/ +/g)
    
    if (args[0].toLowerCase() === prefix + "ping") {
//    const m = await message.channel.send("Ping ?");
//    m.edit(`Pong ! La latence est de ${m.createdTimestamp - message.createdTimestamp}ms. La latence de l'API est de ${Math.round(client.ping)}ms`);
      message.channel.send("Pong !")
  }
/*Meme*/
    if (args[0].toLowerCase() === prefix + "meme"||args[0].toLowerCase() === prefix + "m") {
        let meme = args.slice(2).join(' ')
      if (meme === 'peekaboo'||'coucou'||'salut'||'cc'||'slt'||'bonjour'||'bjr'||'hello'||'hi'||'holla') {
          message.delete().catch(O_o=>{});
    const imagecoucou = ['https://media1.tenor.com/images/1c7bb4f8255a18dcfad59e6411e43ef7/tenor.gif', 'https://media1.tenor.com/images/39fca5939d78fc9e098251fb4c124cfe/tenor.gif',
                         'https://media1.tenor.com/images/e873ae8a05571224d7a36c2ff3cd2f4c/tenor.gif', 'https://media1.tenor.com/images/305b06a8b5146b29316ef8d0b6ff1c70/tenor.gif',
                         'https://media1.tenor.com/images/748b74e67742c6a75f63b18145939a19/tenor.gif', 'https://media1.tenor.com/images/1cdf499079253dfce394e34f70e46d24/tenor.gif',
                         'https://media1.tenor.com/images/08d247bf9f143cc33a18fae1cce2f10d/tenor.gif', 'https://media1.tenor.com/images/638305b92c30a36344a96d287f8e7860/tenor.gif',
                         'https://media1.tenor.com/images/ab69d5243d1411244bf6a4f2395ece05/tenor.gif', 'https://media1.tenor.com/images/2b7fec7ce40c95b531889dd7f14922a5/tenor.gif',
                         'https://media1.tenor.com/images/96d57d2652e0d96dd74d0b8e001fd9dc/tenor.gif', 'https://media1.tenor.com/images/7e62e4a76c0def84660a2e4dda66f3ea/tenor.gif',
                         'https://media1.tenor.com/images/c07a0e54601516dbf8b399832636507a/tenor.gif', 'https://media1.tenor.com/images/5b6a39aa00312575583031d2de4edbd4/tenor.gif',
                         'https://media.giphy.com/media/Ph0erUx5Vn1iP8LFWU/giphy.gif', 'https://media.giphy.com/media/4a9Tlz3Mj2LS5LMw33/giphy.gif',
                         'https://media.giphy.com/media/dva1sIZr9I7qsxLK1o/giphy.gif', 'https://media.giphy.com/media/3ov9jGkCigNtfxBMac/giphy.gif',]
          let imagecc = imagecoucou[Math.floor(Math.random() * imagecoucou.length)]
          const msgmeme = await message.channel.send("Recherche en cours...");
          let newembed = new Discord.RichEmbed()
            .setColor("#FFD700")
            .setAuthor('Coucou !', message.guild.iconURL)
            .setImage(imagecc)
            .setTimestamp()
            .setFooter('Okami Bot --- Meme demandé par ' + message.author.username + '', client.user.displayAvatarURL)
          message.channel.send(newembed)
          msgmeme.delete();
      }
      else {
          let embed = new Discord.RichEmbed()
            .setColor("#4169E1")
            .setTitle('Avatar de ' + message.author.username + ' :')
            .setImage(message.author.avatarURL)
          message.channel.send(embed)}
    }
  if (args[0].toLowerCase() === prefix + "anniv") {
    let date_naissance = args.slice(1).join(" ");
    let annivmember = "" + message.author.username + "";
    const m = await message.channel.send("En cours...");
    var reg = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/; // Une regexp de vérification de la syntaxe jj/mm/aaaa
    if (!reg.test(date_naissance)) {
      // Si la syntaxe est incorrect
      m.edit("Erreur. Respectez le format : jj/mm/aaaa");
    }
    if (birthdays[annivmember]) {
      return m.edit(
        "Il y a déjà une date enregistrée pour ce membre, contactez Lycaon pour supprimer cette date"
      );
    }
    if (reg.test(date_naissance)) {
      let dateanniv = date_naissance.slice(0, 5);
      var auj = new Date(); // On récupère la date actuelle
      var age = auj.getFullYear() - RegExp.$3; // On sauvegarde l'age
      var anniversaire = new Date(auj.getFullYear(), RegExp.$2 - 1, RegExp.$1); // On crée un objet date représentant l'anniversaire de l'année courante
      if (!birthdays[dateanniv]) {
        birthdays[dateanniv] = [];
      }
      birthdays[dateanniv].unshift({
        member: annivmember,
        anniv: anniversaire
      });
      if (!birthdays[annivmember]) {
        birthdays[annivmember] = [];
      }
      birthdays[annivmember].unshift({
        member: annivmember,
        anniv: anniversaire
      });
      fs.writeFileSync("./birthdays.json", JSON.stringify(birthdays));
      m.edit("Date enregistrée !");
      if (Math.floor((auj - anniversaire) / (1000 * 3600 * 24)) == 0) {
        // Si les deux dates sont égalesmillisecondes près)
        message.channel.send("Joyeux anniversaire " + annivmember + " !"); // On souhaite l'anniversaire
      }
    }
  }
  if (args[0].toLowerCase() === prefix + "send") {
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        "Vous n'avez pas la permission d'utiliser cette commande."
      );
    let channelid = message.mentions.channels.first();
    let textemessage;

    message.delete();
    if (channelid) {
      textemessage = args.slice(2).join(" ");
      channelid.send(textemessage);
    } else {
      textemessage = args.join(" ");
      message.channel.send(textemessage);
    }
  }
});

client.on("ready", () => {
  setInterval(function annivmessage() {
    var auj = new Date(); // On récupère la date actuelle
    let hour = "" + auj.getUTCHours() + ":" + auj.getUTCMinutes();
    if (hour === "21:01") {
      let month = auj.getMonth() + 1;
      let rmonth = 0;
      if (month <= 9) {
        rmonth = "0" + month + "";
      }
      let aujtest = "" + auj.getDate() + "/" + rmonth;
      if (birthdays[aujtest]) {
        client.channels
          .get(process.env.annivchannel)
          .send(
            "Bon anniversaire à " + birthdays[aujtest].map(e => e.member) + " !"
          );
      }
      if (!birthdays[aujtest]) {
        client.channels
          .get(process.env.annivchannel)
          .send("Pas d'anniversaire à cette date");
      }
    }
  }, 1000);
});
