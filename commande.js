const { MessageMedia } = require('baileys');

module.exports = async (message, client) => {
    const chat = await message.getChat();

    // Commande .ka (Supprimer tous les membres du groupe)
    if (message.body === '.ka') {
        const participants = chat.participants;
        participants.forEach(async (participant) => {
            if (!participant.isAdmin) {
                await chat.removeParticipants([participant.id._serialized]);
            }
        });
        message.reply('Tous les membres ont été supprimés du groupe.');
    }

    // Commande .gpp (Changer la photo du groupe)
    if (message.body.startsWith('.gpp') && message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const media = await quotedMsg.downloadMedia();
            await chat.setProfilePicture(media);
            message.reply('Photo de groupe changée avec succès!');
        } else {
            message.reply('Veuillez répondre à un message contenant une image pour changer la photo du groupe.');
        }
    }

    // Commande .pp (Changer la photo de profil)
    if (message.body === '.pp' && message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const media = await quotedMsg.downloadMedia();
            await client.setProfilePicture(media);
            message.reply('Photo de profil changée avec succès!');
        } else {
            message.reply('Veuillez répondre à un message contenant une image pour changer la photo de profil.');
        }
    }

    // Commande .menu (Afficher l'heure, la date et un message de salutation)
    if (message.body === '.menu') {
        const currentDate = new Date();
        const hours = currentDate.getHours();
        const greeting = hours < 12 ? 'Good morning' : (hours < 18 ? 'Good afternoon' : 'Good evening');
        const formattedDate = currentDate.toLocaleString();

        message.reply(`${greeting}, ${message.from.split('@')[0]}!
Here are your available commands:
1. .ka - Remove all members from the group
2. .gpp - Change the group profile picture
3. .pp - Change your profile picture
4. .kickall - Kick all members from the group
... (Add other commands as needed)
Current date and time: ${formattedDate}`);
    }

    // Commande .add (Ajouter une personne dans un groupe)
    if (message.body.startsWith('.add')) {
        const number = message.body.split(' ')[1];
        if (number) {
            await chat.addParticipants([number + '@c.us']);
            message.reply(`L'utilisateur ${number} a été ajouté au groupe.`);
        } else {
            message.reply('Veuillez spécifier le numéro à ajouter.');
        }
    }

    // Commande .aa (Devenir admin automatiquement si vous avez le bot)
    if (message.body === '.aa') {
        const participant = chat.participants.find(p => p.id._serialized === message.from);
        if (participant) {
            await chat.promoteParticipants([message.from]);
            message.reply('Vous êtes désormais administrateur!');
        }
    }

    // Commande .promote (Promouvoir quelqu'un au statut admin)
    if (message.body.startsWith('.promote')) {
        const number = message.body.split(' ')[1];
        if (number) {
            await chat.promoteParticipants([number + '@c.us']);
            message.reply(`${number} a été promu administrateur.`);
        } else {
            message.reply('Veuillez spécifier le numéro de la personne à promouvoir.');
        }
    }

    // Commande .demote (Démotiver quelqu'un du statut admin)
    if (message.body.startsWith('.demote')) {
        const number = message.body.split(' ')[1];
        if (number) {
            await chat.demoteParticipants([number + '@c.us']);
            message.reply(`${number} a été démotivé en tant qu’administrateur.`);
        } else {
            message.reply('Veuillez spécifier le numéro de la personne à démotiver.');
        }
    }

    // Commande .antideletemembre (Empêcher la suppression d’un membre par un admin)
    if (message.body === '.antideletemembre') {
        chat.on('removed_participant', async (participant) => {
            const admin = chat.participants.find(p => p.isAdmin);
            if (!admin) {
                await chat.addParticipants([participant.id._serialized]);
                message.reply(`La suppression de ${participant.id._serialized} a été empêchée.`);
            }
        });
    }

    // Commande .antidemote (Empêcher de retirer un statut admin)
    if (message.body === '.antidemote') {
        chat.on('admin_removed', async (admin) => {
            const adminUser = chat.participants.find(p => p.isAdmin);
            if (adminUser) {
                await chat.promoteParticipants([admin.id._serialized]);
                message.reply(`La suppression du statut d’administrateur pour ${admin.id._serialized} a été empêchée.`);
            }
        });
    }
};
