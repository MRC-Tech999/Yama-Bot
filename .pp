bot.on('message', async (message) => {
    if (message.body === '.pp' && message.hasQuotedMsg) {
        const quotedMsg = await message.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const media = await quotedMsg.downloadMedia();
            await bot.setProfilePicture(media);
            message.reply('Photo de profil changée avec succès!');
        } else {
            message.reply('Veuillez répondre à un message contenant une image pour changer la photo de profil.');
        }
    }
});
