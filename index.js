const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', async (qr) => {
    try {
        const qrImage = await qrcode.toString(qr, { type: 'terminal' });
        console.log(qrImage);
        console.log('✅ Escaneie o QR Code com o WhatsApp Web!');
    } catch (err) {
        console.error('Erro ao gerar QR Code:', err);
    }
});

client.on('ready', () => {
    console.log('✅ Bot conectado ao WhatsApp!');
});

client.on('message', message => {
    console.log(`[${message.from}] ${message.body}`);
});

client.initialize();
