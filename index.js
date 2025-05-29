const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');

// Conectar ao Supabase
const supabase = createClient(
  'https://wockxqovlynbupcxtmgt.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2t4cW92bHluYnVwY3h0bWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjU2MjEsImV4cCI6MjA2NDEwMTYyMX0.4VfVsoevKfD66Rv4qvosYIdJYWBOEJZ-0Um0JgE8WwA'
);

// Palavras-chave para alerta imediato
const palavrasChave = ['urgente', 'problema', 'rápido'];

// ID fixo do grupo MNNO | REPORTS
const reportGroupId = '120363418457382566@g.us';

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
  const qrCodeUrl = await qrcode.toString(qr, { type: 'terminal' });
  console.log(qrCodeUrl);
  console.log('✅ Escaneie o QR Code com o WhatsApp Web!');
});

client.on('ready', async () => {
  console.log('✅ Bot conectado ao WhatsApp!');

  const chats = await client.getChats();
  const groups = chats.filter(chat => chat.isGroup);
  console.log('\n📋 Grupos encontrados:');
  groups.forEach(group => {
    console.log(`• ${group.name} => ${group.id._serialized}`);
  });
});

client.on('message', async (message) => {
  try {
    const chat = await message.getChat();
    if (!chat.isGroup) return;

    const groupId = chat.id._serialized;
    const groupName = chat.name;
    const sender = await message.getContact();
    const messageText = message.body || '';

    // Salvar no Supabase
    await supabase.from('group_messages').insert([{
      group_id: groupId,
      group_name: groupName,
      message: messageText,
      timestamp: new Date().toISOString(),
      sender_name: sender.pushname || sender.name || 'Desconhecido',
      sender_id: sender.id._serialized
    }]);

    console.log(`[${groupName}] ${sender.pushname || sender.name}: ${messageText}`);

    // Alerta de palavra-chave
    const textoMinusculo = messageText.toLowerCase();
    const alertaDetectado = palavrasChave.some(palavra => textoMinusculo.includes(palavra));

    if (alertaDetectado) {
      await axios.post('https://n8n-n8n-start.bnjgif.easypanel.host/webhook-test/111dcbfa-b218-4c49-a3c7-e3ac32bf83bf', {
        group_name: groupName,
        sender: sender.pushname || sender.name,
        message: messageText
      });
      console.log('🚨 Alerta enviado ao n8n');
    }
  } catch (error) {
    console.error('❌ Erro ao processar a mensagem:', error.message);
  }
});

// Servidor HTTP para receber relatórios
const app = express();
app.use(bodyParser.json());

app.post('/send-report', async (req, res) => {
  const { message } = req.body;

  try {
    await client.sendMessage(reportGroupId, message);
    console.log('📤 Relatório enviado ao grupo MNNO | REPORTS');
    res.status(200).send('Mensagem enviada com sucesso');
  } catch (error) {
    console.error('❌ Erro ao enviar relatório:', error.message);
    res.status(500).send('Erro ao enviar mensagem');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor HTTP escutando na porta ${PORT}`);
});

client.initialize();
