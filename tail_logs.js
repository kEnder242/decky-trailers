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
    console.error("❌ Error: deck.config not found. Please create it with DECK_IP=your_ip");
    process.exit(1);
  }
};

const config = getConfig();
const DECK_IP = config.deck_ip;
const PORT = 8081;

// 1. Find the WebSocket URL for SharedJSContext
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
          
          if (target && target.webSocketDebuggerUrl) {
            resolve(target.webSocketDebuggerUrl);
          } else {
            reject('Could not find SharedJSContext target.');
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
};

// 2. Connect and Tail Logs
const tailLogs = async () => {
  try {
    const wsUrl = await getDebugUrl();
    console.log(`🔌 Connecting to ${wsUrl}...`);
    
    const ws = new WebSocket(wsUrl);

    ws.on('open', () => {
      console.log('✅ Connected! Listening for logs...');
      ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
      ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
    });

    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const type = msg.params.type.toUpperCase();
        const args = msg.params.args.map(a => a.value || a.description || '').join(' ');
        let color = '\x1b[37m';
        if (type === 'ERROR') color = '\x1b[31m';
        if (type === 'WARNING') color = '\x1b[33m';
        if (!args.includes('[React DevTools]')) {
             console.log(`${color}[${type}] ${args}\x1b[0m`);
        }
      }
      if (msg.method === 'Runtime.exceptionThrown') {
          const ex = msg.params.exceptionDetails;
          console.log(`\x1b[31m[EXCEPTION] ${ex.text} ${ex.exception ? ex.exception.description : ''}\x1b[0m`);
      }
    });

    ws.on('close', () => console.log('❌ Disconnected.'));
    ws.on('error', (e) => console.error('❌ WebSocket Error:', e));

  } catch (err) {
    console.error('❌ Failed to start log tailer:', err);
  }
};

tailLogs();