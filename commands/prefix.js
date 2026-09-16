const fs = require('fs');
const path = require('path');
const CONFIG_FILE = path.resolve('./config.json');

const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

function getCurrentConfig() {
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
        }
    } catch { }
    return { prefix: '!' };
}

module.exports = {
    name: 'setprefix',
    description: 'Change bot prefix (Owner or Group Admins only)',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, isGroup } = context;

        let isAdmin = false;
        if (isGroup) {
            try {
                const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
                const participants = groupMetadata.participants || [];
                const senderJid = msg.key.participant || msg.key.remoteJid;
                const senderParticipant = participants.find(
                    p => p.id === senderJid || p.id?.replace(/:[0-9]+/, '') === senderJid?.replace(/:[0-9]+/, '')
                );
                isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
            } catch (e) {
                isAdmin = false;
            }
        }

        if (!isOwner && !isAdmin) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🤖 *Prefix Change*        \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Sirf Bot Owner ya Group Admin hi prefix change kar sakta hai!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Pending\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                },
                { quoted: msg }
            );
        }

        const newPrefix = args[0];
        if (!newPrefix) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🤖 *Prefix Change*        \n` +
                        `════════════════════════════════\n\n\n` +
                        `⚠️ Please provide a new prefix, e.g., \`!setprefix .\`\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Pending\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                },
                { quoted: msg }
            );
        }

        const currentConfig = getCurrentConfig();
        const oldPrefix = currentConfig.prefix || '!';

        fs.writeFileSync(CONFIG_FILE, JSON.stringify({ prefix: newPrefix, oldPrefix: oldPrefix }, null, 2), 'utf8');
        await safeSendMessage(
            msg.key.remoteJid,
            {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        🤖 *Prefix Change*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `✅ Bot prefix successfully changed from \`${oldPrefix}\` to: \`${newPrefix}\`\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Success\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
            },
            { quoted: msg }
        );
    }
};