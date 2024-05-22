const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');

// Inisialisasi client
const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', qr => {
    // Generate QR code untuk login
    qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
    console.log('Client is ready!');
    // Mendapatkan ID grup
    const chats = await client.getChats();
    const groupChats = chats.filter(chat => chat.isGroup);

    groupChats.forEach(group => {
        console.log(`Group: ${group.name}, ID: ${group.id._serialized}`);
    });

    // Mulai interval untuk mengirim pesan setiap 1 jam
    setInterval(sendHourlyMessage, 3600000); // 3600000 ms = 1 jam
});

// Ketika ada member baru yang masuk grup
client.on('group_join', notification => {
    const chatId = notification.chatId;
    const welcomeMessage = `Selamat datang di grup Sayanggggg!`;
    const welcomeImage = 'path/to/welcome/image.jpg'; // Ganti dengan path ke gambar selamat datang

    client.sendMessage(chatId, welcomeMessage);
    client.sendMessage(chatId, new MessageMedia('image/jpeg', fs.readFileSync(welcomeImage, { encoding: 'base64' })));
});

// Ketika ada member yang keluar grup
client.on('group_leave', notification => {
    const chatId = notification.chatId;
    const farewellMessage = `Yahhhh! Mati Aja`;
    const farewellImage = 'path/to/farewell/image.jpg'; // Ganti dengan path ke gambar selamat jalan

    client.sendMessage(chatId, farewellMessage);
    client.sendMessage(chatId, new MessageMedia('image/jpeg', fs.readFileSync(farewellImage, { encoding: 'base64' })));
});

// Menangani pesan masuk
client.on('message', async message => {
    if (message.body.startsWith('/p ')) {
        const responseMessage = message.body.slice(3); // Mengambil teks setelah "/p "
        client.sendMessage(message.from, responseMessage);
    }

    if (message.body === '/all') {
        const chat = await message.getChat();
        if (chat.isGroup) {
            let text = '';
            let mentions = [];

            for (let participant of chat.participants) {
                const contact = await client.getContactById(participant.id._serialized);
                mentions.push(contact);
                text += `@${participant.id.user} `;
            }

            await chat.sendMessage(text, { mentions });
        } else {
            client.sendMessage(message.from, "Command ini hanya bisa digunakan di dalam grup.");
        }
    }
});

// Fungsi untuk mengirim pesan otomatis setiap 1 jam
async function sendHourlyMessage() {
    const chat = await client.getChatById('YOUR_GROUP_CHAT_ID'); // Ganti dengan ID grup yang sesuai
    const message = `Halo! Aku Bot Tercantikkkkkkkk\nNama bot: Yamada Ryo\nPrefix: /\nVersi: 1.0.0\nAuthor: Yusuf Ganteng`;
    chat.sendMessage(message);
}

client.initialize();
