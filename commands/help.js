const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'help',
    description: 'Show help message',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, DEVELOPER_NAME } = context;
        await safeSendMessage(
            msg.key.remoteJid,
            {
                text:
                    `════════════════════════════════\n` +
                    `    👑 *${BOT_NAME}* 👑\n` +
                    `       🤖 *HELP DESK* \n` +
                    `════════════════════════════════\n\n\n` +
                    `📋 *QUICK NAVIGATION*\n` +
                    `│ ▫️ \`!menu\` ── Bot commands list\n` +
                    `│ ▫️ \`!rules\` ── Group guidelines\n` +
                    `│ ▫️ \`!song\` ── Download MP3\n` +
                    `│ ▫️ \`!ping\` ── Check bot speed\n\n` +
                    `⚠️ *IMPORTANT NOTICE*\n` +
                    `│ Links or spamming will trigger\n` +
                    `│ automatic warnings & kick action.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Fully Operational\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `🤖 *Bot Name:* ${BOT_NAME}\n` +
                    `════════════════════════════════`
            },
            { quoted: msg }
        );
    }
};