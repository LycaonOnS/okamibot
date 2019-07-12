const Discord = require('discord.js')
const fs = require('fs')
const { Client, Attachment } = require('discord.js');
const client = new Discord.Client()
let prefix = "*"
client.login(process.env.auth) 

const warns = JSON.parse(fs.readFileSync('./warns.json'))

client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`Servir Lycaon`);
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
        if (count < 1 || count > 100) return message.channel.send("Veuillez indiquer un nombre entre 1 et 100")
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
/*planning*/
    if (args[0].toLowerCase() === prefix + "sorties") {
        let embed = new Discord.RichEmbed()
            .setColor("ORANGE")
            .setTitle('**Planning des sorties :**')
            .addField("__Yama of the Hell__ :", "Le mercredi, une semaine sur deux.", 'false')
            .addField("__Peerless Battle Spirit__ :", "Le vendredi, chaque semaine.", 'true')
        message.channel.send(embed)
}
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
    if (args[0].toLowerCase() === prefix + "meme") {
        let meme = args.slice(2).join(' ')
      if (meme === 'peekaboo'||'coucou') {
        const attachment = new Attachment('https://i.imgur.com/u2lzZ9a.mp4');
        message.channel.send(attachment);
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
        }
//    const m = await message.channel.send("Ping ?");
//    m.edit(`Pong ! La latence est de ${m.createdTimestamp - message.createdTimestamp}ms. La latence de l'API est de ${Math.round(client.ping)}ms`);
      message.channel.send("Pong !")
})
