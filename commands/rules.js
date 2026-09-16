const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'rules',
    description: 'Show group rules',
    async execute(sock, msg, args, context) {
        const { safeSendMessage } = context;
        await safeSendMessage(
            msg.key.remoteJid,
            {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        📜 *GROUP RULES*      \n` +
                    `════════════════════════════════\n\n` +
                    `1️⃣ 🚫 *No Links*\n` +
                    `│ ➜ Unauthorized links are strictly prohibited.\n` +
                    `════════════════════════════════\n\n` +
                    `2️⃣ 🚫 *No Spamming*\n` +
                    `│ ➜ Repeated messages will trigger warnings.\n` +
                    `════════════════════════════════\n\n` +
                    `3️⃣ 🤝 *Respect Everyone*\n` +
                    `│ ➜ Maintain decency with members & admins.\n` +
                    `════════════════════════════════\n\n` +
                    `4️⃣ 🎭 *Sticker Limit*\n` +
                    `│ ➜ Use stickers in a reasonable amount.\n` +
                    `════════════════════════════════\n\n` +
                    `⚠️ *WARNING SYSTEM*\n` +
                    `│ ❗ 5 warnings = Automatic Kick action.\n\n` +
                    `════════════════════════════════\n\n` +
                    `🛡️ *Status:* Strictly Enforced\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `🤖 *Bot Name:* ${BOT_NAME}\n` +
                    `════════════════════════════════`
            },
            { quoted: msg }
        );
    }
};