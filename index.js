const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('✅ Escaneie o QR Code com o WhatsApp Web!');
});

client.on('ready', () => {
    console.log('✅ Bot conectado ao WhatsApp!');
});

client.on('message', message => {
    console.log(`[${message.from}] ${message.body}`);
});

client.initialize();
