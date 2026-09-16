const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'uptime',
    description: 'Check bot uptime',
    async execute(sock, msg, args, context) {
        const { safeSendMessage } = context;

        try {
            const totalSeconds = Math.floor(process.uptime());

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            const uptimeText = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ⏱️ *BOT UPTIME*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `🟢 *Online For:* ${uptimeText}\n` +
                        `🤖 *Status:* Fully Operational\n\n\n` +
                        `════════════════════════════════\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error(
                '❌ UPTIME ERROR:',
                error?.stack ||
                error?.message ||
                error
            );

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `╔════════════════════════════╗\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *FETCH FAILED*     \n` +
                        `╚════════════════════════════╝\n\n` +
                        `❌ Uptime fetch nahi ho saka.\n\n` +
                        `────────────────────────────\n` +
                        `⚡ *Status:* Error\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `────────────────────────────`
                },
                { quoted: msg }
            );
        }
    }
};