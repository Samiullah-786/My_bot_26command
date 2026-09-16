const fs = require('fs');
const path = require('path');
const SETTINGS_FILE = path.resolve('./security_settings.json');

const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

function getSettings() {
    const defaultSettings = { linksProtection: false, stickerProtection: false };
    if (!fs.existsSync(SETTINGS_FILE)) {
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2), 'utf8');
        return defaultSettings;
    }
    try {
        const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
        return {
            linksProtection: Boolean(data.linksProtection),
            stickerProtection: data.stickerProtection === true ? true : false
        };
    } catch {
        return defaultSettings;
    }
}

function saveSettings(settings) {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
}

async function handleAntiSticker(sock, msg) {
    try {
        if (!msg.key || !msg.key.remoteJid || !msg.key.remoteJid.endsWith('@g.us')) return;
        if (msg.key.fromMe) return;
        const settings = getSettings();
        if (!settings.stickerProtection) return;

        const isSticker = !!(msg.message?.stickerMessage || msg.message?.ephemeralMessage?.message?.stickerMessage || msg.message?.viewOnceMessage?.message?.stickerMessage);
        if (!isSticker) return;

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

        await sock.sendMessage(msg.key.remoteJid, { delete: { remoteJid: msg.key.remoteJid, fromMe: false, id: msg.key.id, participant: senderJid } }).catch(() => { });
        if (!global.warningsTrack) global.warningsTrack = new Map();
        const count = (global.warningsTrack.get(senderClean + '_sticker') || 0) + 1;
        global.warningsTrack.set(senderClean + '_sticker', count);
        if (count >= 5) {
            await sock.sendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Warning Status*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `🚫 @${senderClean.split('@')[0]} kicked for sending stickers (5/5 warnings reached)!\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Action Taken\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                mentions: [senderJid]
            });
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [senderJid], 'remove').catch(() => { });
            global.warningsTrack.delete(senderClean + '_sticker');
        } else {
            await sock.sendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Warning Status*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `⚠️ @${senderClean.split('@')[0]}, Warning ${count}/5: Stickers are prohibited!\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Pending\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                mentions: [senderJid]
            });
        }
    } catch (e) {
        console.error('ANTI-STICKER ERR:', e);
    }
}

module.exports = {
    name: 'sticker',
    description: 'Toggle sticker protection on/off',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, isGroup } = context;
        if (!isGroup) return await safeSendMessage(msg.key.remoteJid, {
            text:
                `════════════════════════════════\n` +
                ` 👑 *${BOT_NAME}* 👑     \n` +
                ` 🤖 *Sticker Protection*        \n` +
                `════════════════════════════════\n\n\n` +
                `❌ Yeh command sirf group mein use ho sakti hai!\n\n\n` +
                `════════════════════════════════\n` +
                `⚡ *Status:* Pending\n` +
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
                    ` 🤖 *Sticker Protection*        \n` +
                    `════════════════════════════════\n\n` +
                    `❌ Sirf Group Admin ya Bot Owner yeh command use kar sakta hai!\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Pending\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        }
        const action = (args[0] || '').toLowerCase();
        const settings = getSettings();
        if (action === 'on') {
            settings.stickerProtection = true;
            saveSettings(settings);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Sticker Protection*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `🎭 *Sticker Protection:* ✅ ENABLED\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Active\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        } else if (action === 'off') {
            settings.stickerProtection = false;
            saveSettings(settings);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Sticker Protection*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `🎭 *Sticker Protection:* ❌ DISABLED\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Inactive\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        } else {
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    ` 👑 *${BOT_NAME}* 👑     \n` +
                    ` 🤖 *Sticker Protection*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `⚠️ Use: \`sticker on\` ya \`sticker off\`\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Pending\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            }, { quoted: msg });
        }
    },
    handleAntiSticker
};