const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'autoreact',
    description: 'Toggle auto reaction for everyone',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, setAutoReactActive } = context;
        if (!isOwner) return;

        if (args[0] === 'on') {
            setAutoReactActive(true);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        🟢 *AUTO REACT ON*    \n` +
                    `════════════════════════════════\n\n\n` +
                    `✅ Auto React ON for everyone.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Active\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        } else if (args[0] === 'off') {
            setAutoReactActive(false);
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        🔴 *AUTO REACT OFF*   \n` +
                    `════════════════════════════════\n\n\n` +
                    `❌ Auto React OFF for everyone.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Inactive\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    }
};