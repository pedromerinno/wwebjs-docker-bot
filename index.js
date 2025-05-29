const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');

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

client.on('message', async (message) => {
    // Envia somente mensagens de grupos (que contêm "-")
    if (!message.from.includes('-')) return;

    try {
        await axios.post('https://n8n-n8n-start.bnjgif.easypanel.host/webhook-test/111dcbfa-b218-4c49-a3c7-e3ac32bf83bf', {
            from: message.from,
            body: message.body,
            timestamp: message.timestamp
        });
        console.log(`📤 Mensagem enviada do grupo ${message.from}`);
    } catch (err) {
        console.error('Erro ao enviar para o n8n:', err.message);
    }
});

client.initialize();
