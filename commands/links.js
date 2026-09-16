const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.resolve('./security_settings.json');

const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

function getSettings() {
    if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify({ linksProtection: false, stickerProtection: false }, null, 2), 'utf8');
    }
    try {
        const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        return { linksProtection: Boolean(data.linksProtection), stickerProtection: Boolean(data.stickerProtection) };
    } catch {
        return { linksProtection: false, stickerProtection: false };
    }
}

function saveSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
}

function containsLinkOrSpam(text) {
    if (!text || typeof text !== 'string') return false;
    const linkRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9][-a-zA-Z0-9]*\.(com|net|org|edu|gov|mil|int|info|biz|me|io|co|pk|tk|ml|ga|cf)\b)|(chat\.whatsapp\.com\/[^\s]+)/i;
    return linkRegex.test(text);
}

async function handleAntiLink(sock, msg) {
    try {
        if (!msg.key || !msg.key.remoteJid || !msg.key.remoteJid.endsWith('@g.us')) return;
        if (msg.key.fromMe) return;
        const settings = getSettings();
        if (!settings.linksProtection) return;

        const metadata = await sock.groupMetadata(msg.key.remoteJid).catch(() => null);
        let isAdmin = false;
        let senderJid = msg.key.participant || msg.key.remoteJid;
        let senderClean = senderJid.replace(/:[0-9]+/, '');
        if (metadata) {
            const participants = metadata.participants || [];
            const senderParticipant = participants.find(p => p.id === senderJid || p.id?.replace(/:[0-9]+/, '') === senderClean);
            isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
        }
        if (isAdmin) return;

        const messageText = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption || '';
        if (containsLinkOrSpam(messageText)) {
            await sock.sendMessage(msg.key.remoteJid, { delete: { remoteJid: msg.key.remoteJid, fromMe: false, id: msg.key.id, participant: senderJid } }).catch(() => { });
            if (!global.warningsTrack) global.warningsTrack = new Map();
            const count = (global.warningsTrack.get(senderClean + '_link') || 0) + 1;
            global.warningsTrack.set(senderClean + '_link', count);
            if (count >= 5) {
                await sock.sendMessage(msg.key.remoteJid, {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🤖 *Link Protection*        \n` +
                        `════════════════════════════════\n\n\n` +
                        `🚫 @${senderClean.split('@')[0]} kicked for sending links (5/5 warnings reached)!\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Action Taken\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    mentions: [senderJid]
                });
                await sock.groupParticipantsUpdate(msg.key.remoteJid, [senderJid], 'remove').catch(() => { });
                global.warningsTrack.delete(senderClean + '_link');
            } else {
                await sock.sendMessage(msg.key.remoteJid, {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🤖 *Link Protection*        \n` +
                        `════════════════════════════════\n\n\n` +
                        `⚠️ @${senderClean.split('@')[0]}, Warning ${count}/5: Links are prohibited!\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Pending\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    mentions: [senderJid]
                });
            }
        }
    } catch (e) {
        console.error('ANTI-LINK ERR:', e);
    }
}

module.exports = {
    name: 'links',
    description: 'Toggle link protection on/off',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, isGroup } = context;
        if (!isGroup) return await safeSendMessage(msg.key.remoteJid, {
            text:
                `════════════════════════════════\n` +
                ` 👑 *${BOT_NAME}* 👑     \n` +
                ` 🤖 *Link Protection*        \n` +
                `════════════════════════════════\n\n\n` +
                `❌ Yeh command sirf group mein use ho sakti hai!\n\n\n` +
                `════════════════════════════════\n` +
                `⚡ *Status:* Restricted\n` +
                `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                `════════════════════════════════`,
        }, { quoted: msg });
        const metadata = await sock.groupMetadata(msg.key.remoteJid).catch(() => null);
        let isAdmin = false;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        if (metadata) {
            const participants = metadata.participants || [];
            const senderParticipant = participants.find(p => p.id === senderJid || p.id?.replace(/:[0-9]+/, '') === senderJid.replace(/:[0-9]+/, ''));
            isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
        }
        if (!isOwner && !isAdmin) {
            return await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Link Protection*        \n` +
                    `════════════════════════════════\n\n` +
                    `❌ Sirf Group Admin ya Bot Owner yeh command use kar sakta hai!\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Restricted\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        }
        const action = (args[0] || '').toLowerCase();
        const settings = getSettings();
        if (action === 'on') {
            settings.linksProtection = true;
            saveSettings(settings);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Link Protection*        \n` +
                    `════════════════════════════════\n\n` +
                    `🔗 *Anti-Link Protection:* ✅ ENABLED\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Active\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        } else if (action === 'off') {
            settings.linksProtection = false;
            saveSettings(settings);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Link Protection*        \n` +
                    `════════════════════════════════\n\n` +
                    `🔗 *Anti-Link Protection:* ❌ DISABLED\n\n\n` +
                    `═══════════════════════════════\n` +
                    `⚡ *Status:* Inactive\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        } else {
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Link Protection*        \n` +
                    `════════════════════════════════\n\n` +
                    `⚠️ Use: \`links on\` ya \`links off\`\n\n\n` +
                    `═══════════════════════════════\n` +
                    `⚡ *Status:* Pending\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    },
    handleAntiLink
};