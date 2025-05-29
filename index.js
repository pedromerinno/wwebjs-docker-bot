const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Conectar ao Supabase
const supabase = createClient(
  'https://wockxqovlynbupcxtmgt.supabase.co',      // Substituir pela URL do seu Supabase
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY2t4cW92bHluYnVwY3h0bWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjU2MjEsImV4cCI6MjA2NDEwMTYyMX0.4VfVsoevKfD66Rv4qvosYIdJYWBOEJZ-0Um0JgE8WwA'                       // Substituir pela ANON KEY do seu Supabase
);

// Palavras-chave para alerta imediato
const palavrasChave = ['urgente', 'rápido', 'problema'];
const temPalavraChave = (texto) =>
  palavrasChave.some(p => texto.toLowerCase().includes(p));

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', async (qr) => {
  const qrImage = await qrcode.toString(qr, { type: 'terminal' });
  console.log(qrImage);
  console.log('✅ Escaneie o QR Code com o WhatsApp Web!');
});

client.on('ready', () => {
  console.log('✅ Bot conectado ao WhatsApp!');
});

client.on('message', async (message) => {
  const chat = await message.getChat();
  if (!chat.isGroup) return;

  const { id: group_id, name: group_name } = chat;
  const { body: msg, timestamp, author: sender_id } = message;
  const sender_contact = await message.getContact();
  const sender_name = sender_contact?.pushname || sender_contact?.name || 'Desconhecido';

  const { error } = await supabase.from('group_messages').insert({
    group_id,
    group_name,
    message: msg,
    timestamp: new Date(timestamp * 1000),
    sender_id,
    sender_name
  });

  if (error) {
    console.error('❌ Erro ao salvar no Supabase:', error);
  } else {
    console.log(`[${group_name}] ${sender_name}: ${msg}`);
  }

  // Se detectar palavra-chave, aciona webhook do n8n (ou outro)
  if (temPalavraChave(msg)) {
    try {
      await axios.post('https://n8n-n8n-start.bnjgif.easypanel.host/webhook-test/ALERTA-IMEDIATO', {
        group_id,
        group_name,
        message: msg,
        timestamp: new Date(timestamp * 1000),
        sender_id,
        sender_name
      });
      console.log('⚠️ Palavra-chave detectada e alerta enviado.');
    } catch (err) {
      console.error('Erro ao enviar alerta para n8n:', err.message);
    }
  }
});

client.initialize();
