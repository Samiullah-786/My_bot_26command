const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'ping',
    description: 'Check bot latency and speed',
    async execute(sock, msg, args, context) {
        const { safeSendMessage } = context;

        const startTimestamp = Date.now();
        const sentMsg = await safeSendMessage(msg.key.remoteJid, {
            text:
                `════════════════════════════════\n` +
                `    👑 *${BOT_NAME}* 👑     \n` +
                `      🏓 *PING TEST*        \n` +
                `════════════════════════════════\n\n` +
                `🏓 Pinging...\n\n` +
                `═══════════════════════════════\n` +
                `⚡ *Status:* Checking Speed\n` +
                `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                `════════════════════════════════`,
        }, { quoted: msg });
        const latency = Date.now() - startTimestamp;

        if (sentMsg) {
            await sock.sendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `    👑 *${BOT_NAME}* 👑     \n` +
                    `      🏓 *PONG!*          \n` +
                    `════════════════════════════════\n\n` +
                    `⚡ Response Speed: *${latency}ms*\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Active & Fast\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                edit: sentMsg.key
            });
        }
    }
};