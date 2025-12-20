import WebSocket from 'ws';
import http from 'http';
import fs from 'fs';

// 0. Load IP from deck.config
const getConfig = () => {
  try {
    const config = fs.readFileSync('deck.config', 'utf8');
    const match = config.match(/DECK_IP=(.+)/);
    if (match) return { deck_ip: match[1].trim() };
  } catch (e) {
    console.error("❌ Error: deck.config not found.");
    process.exit(1);
  }
};

const config = getConfig();
const DECK_IP = config.deck_ip;
const PORT = 8081;

const getDebugUrl = () => {
  return new Promise((resolve, reject) => {
    http.get(`http://${DECK_IP}:${PORT}/json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const targets = JSON.parse(data);
          const target = targets.find(t => t.title === 'SharedJSContext') || 
                         targets.find(t => t.url.includes('steamloopback.host'));
          if (target && target.webSocketDebuggerUrl) resolve(target.webSocketDebuggerUrl);
          else reject('Could not find SharedJSContext target.');
        } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
};

const tailLogs = async () => {
  try {
    const wsUrl = await getDebugUrl();
    console.log(`🔌 Connecting to ${wsUrl}...`);
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('✅ Connected! Listening for logs...');
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      const time = new Date().toLocaleTimeString();
      if (msg.method === 'Runtime.consoleAPICalled') {
        const args = msg.params.args.map(a => a.value || a.description || '').join(' ');
        if (!args.includes('[React DevTools]')) {
             console.log(`[${time}] [${msg.params.type.toUpperCase()}] ${args}`);
        }
      }
    });

    ws.on('close', () => console.log('❌ Disconnected.'));
  } catch (err) { console.error('❌ Failed:', err); }
};

tailLogs();