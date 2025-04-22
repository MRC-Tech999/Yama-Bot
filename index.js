const { Client } = require('baileys');
const fs = require('fs');
const readline = require('readline');
const client = new Client();
const commande = require('./commande'); // Importer le fichier des commandes

// Créer un objet readline pour lire les entrées depuis la console
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Demander le numéro de téléphone pour générer un code de pairage
rl.question('Entrez votre numéro de téléphone (avec l\'indicatif régional, sans le +): ', (phoneNumber) => {
    console.log('Génération du code de pairage pour : ' + phoneNumber);
    
    // Générer un code de pairage aléatoire de 8 caractères (lettres et chiffres)
    const pairingCode = Math.random().toString(36).substr(2, 8).toUpperCase();
    console.log(`Code de pairage généré : ${pairingCode}`);
    
    // Envoi du code de pairage à l'utilisateur
    client.sendMessage(`${phoneNumber}@s.whatsapp.net`, `Votre code de pairage est : ${pairingCode}`);
    
    // Fermer l'interface readline
    rl.close();
});

// Lorsque la connexion est établie avec WhatsApp
client.on('open', () => {
    console.log('YAMA est prêt et connecté!');
    // Lien du canal WhatsApp
    const channelLink = 'https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N';
    console.log(`Rejoignez le canal WhatsApp YAMA ici: ${channelLink}`);
});

// En cas de problème d'authentification
client.on('auth_failure', (err) => {
    console.log('Échec de l\'authentification', err);
});

// Une fois que le bot est prêt et que la session est authentifiée
client.on('ready', () => {
    console.log('YAMA est connecté avec succès!');
    // Si le code de pairage est validé par l'utilisateur, on peut envoyer un message de confirmation
    client.sendMessage('00000000000@s.whatsapp.net', 'Connection successfully! Finished syncing with WhatsApp on Safari or Chrome (YAMA-v1)');
});

// Lorsque le bot reçoit un message, il vérifie les commandes
client.on('message', async (message) => {
    commande(message, client); // Appeler les commandes dans commande.js
});

// Initialisation du client
client.initialize();
