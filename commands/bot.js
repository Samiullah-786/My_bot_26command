const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'bot',
    description: 'Start or stop bot system globally',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner } = context;
        if (!isOwner) return;

        const action = (args[0] || '').toLowerCase();

        if (action === 'start') {
            global.isBotActive = true;
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        🟢 *SYSTEM ONLINE*    \n` +
                    `════════════════════════════════\n\n\n` +
                    `✅ Bot system ONLINE. Tamam commands ab active hain.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Fully Operational\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        } else if (action === 'stop') {
            global.isBotActive = false;
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        🔴 *SYSTEM OFFLINE*   \n` +
                    `════════════════════════════════\n\n\n` +
                    `❌ Bot system OFFLINE. Ab koi command ya feature work nahi karega[cite: 14].\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Stopped\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        } else {
            await safeSendMessage(msg.key.remoteJid, {
                text: `⚠️ Use: \`!bot start\` ya \`!bot stop\``
            }, { quoted: msg });
        }
    }
};