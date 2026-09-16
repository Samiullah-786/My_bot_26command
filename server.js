const { makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use(express.static(__dirname));

const commands = new Map();
const commandsDir = path.resolve('./commands');
let antiLinkHandler = null;
let antiStickerHandler = null;

if (fs.existsSync(commandsDir)) {
    const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const cmd = require(path.join(commandsDir, file));
            if (cmd.name) commands.set(cmd.name, cmd);
            if (file === 'links.js' && cmd.handleAntiLink) antiLinkHandler = cmd.handleAntiLink;
            if (file === 'sticker.js' && cmd.handleAntiSticker) antiStickerHandler = cmd.handleAntiSticker;
        } catch (e) {
            console.error(`Command load err (${file}):`, e.message);
        }
    }
}

const activeSockets = new Map();
global.warningsTrack = global.warningsTrack || new Map();

async function startSession(sessionId) {
    const sessionDir = path.resolve(`./sessions/${sessionId}`);
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        browser: ['Ubuntu', 'Chrome', '20.0.0.0']
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`Session [${sessionId}] closed. Status: ${statusCode}, Reconnect: ${shouldReconnect}`);

            if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403 || statusCode === 515) {
                if (fs.existsSync(sessionDir)) {
                    fs.rmSync(sessionDir, { recursive: true, force: true });
                    console.log(`Cleaned up dead session folder: ${sessionId}`);
                }
            }
            activeSockets.delete(sessionId);
            if (shouldReconnect && statusCode !== 401 && statusCode !== 403) {
                setTimeout(() => startSession(sessionId), 5000);
            }
        } else if (connection === 'open') {
            console.log(`Session [${sessionId}] connected live & active with full bot engine!`);
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        if (antiLinkHandler) await antiLinkHandler(sock, msg);
        if (antiStickerHandler) await antiStickerHandler(sock, msg);

        const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
        const prefixes = ['.', '!'];
        const usedPrefix = prefixes.find(p => text.startsWith(p));
        if (!usedPrefix) return;

        const args = text.slice(usedPrefix.length).trim().split(/\s+/);
        const cmdName = args.shift().toLowerCase();
        const cmd = commands.get(cmdName);
        if (!cmd) return;

        const isGroup = msg.key.remoteJid.endsWith('@g.us');
        const safeSendMessage = (jid, content, options) => sock.sendMessage(jid, content, options);

        try {
            await cmd.execute(sock, msg, args, { safeSendMessage, isOwner: true, isGroup });
        } catch (err) {
            console.error(`Cmd execution error (${cmdName}):`, err);
        }
    });

    activeSockets.set(sessionId, sock);
    return sock;
}

async function loadSavedSessions() {
    const sessionsDir = path.resolve('./sessions');
    if (fs.existsSync(sessionsDir)) {
        const dirs = fs.readdirSync(sessionsDir);
        for (const dir of dirs) {
            if (fs.statSync(path.join(sessionsDir, dir)).isDirectory()) {
                console.log(`Restoring session: ${dir}`);
                startSession(dir).catch(() => { });
            }
        }
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/pair', async (req, res) => {
    const { phone, server } = req.body;
    const phoneNumber = phone?.replace(/[^0-9]/g, '');
    if (!phoneNumber) return res.status(400).json({ error: 'Invalid phone number' });

    const sessionId = `${server || 'server1'}_${phoneNumber}`;
    let sock = activeSockets.get(sessionId);

    if (sock && sock.user) {
        return res.json({ msg: 'Number already registered & active!' });
    }

    if (!sock) {
        sock = await startSession(sessionId);
    }

    let attempts = 0;
    const waitForReady = setInterval(async () => {
        attempts++;
        if ((sock.ws && sock.ws.isOpen) || attempts > 15) {
            clearInterval(waitForReady);
            try {
                if (!sock.authState.creds.registered) {
                    const code = await sock.requestPairingCode(phoneNumber);
                    if (!res.headersSent) return res.json({ code });
                } else {
                    if (!res.headersSent) return res.json({ msg: 'Number already registered & active!' });
                }
            } catch (err) {
                console.error('Pairing error:', err);
                if (!res.headersSent) return res.status(550).json({ error: `Failed: ${err.message}` });
            }
        }
    }, 500);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Unified Bot + Web Panel live on port ${PORT}`);
    await loadSavedSessions();
});