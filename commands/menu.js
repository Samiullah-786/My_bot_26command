const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'menu',
    description: 'Show all bot commands',
    async execute(sock, msg, args, context) {
        const { safeSendMessage } = context;
        const menuText =
            `═══════════════════════════════\n` +
            ` 👑 *${BOT_NAME}* 👑     \n` +
            ` 🤖 *MAIN MENU*        \n` +
            `═══════════════════════════════\n\n` +
            `👤 *GENERAL COMMANDS*\n\n` +
            `═══════════════════════════════\n` +
            `│ ▫️ menu\n` +
            `│ ▫️ help \n` +
            `│ ▫️ rules\n` +
            `│ ▫️ ping\n` +
            `│ ▫️ uptime\n` +
            `│ ▫️ groupinfo \n` +
            `│ ▫️ song <name>\n` +
            `═══════════════════════════════\n\n` +
            `🛡️ *ADMIN COMMANDS*\n\n` +
            `═══════════════════════════════\n` +
            `│ ▫️ tagall\n` +
            `│ ▫️ everyone <message>\n` +
            `│ ▫️ admins\n` +
            `│ ▫️ add <number>\n` +
            `│ ▫️ remove <tag>\n` +
            `│ ▫️ setprefix <new_prefix>\n` +
            `│ ▫️ antilink <on/off>\n` +
            `│ ▫️ antisticker <on/off>\n` +
            `│ ▫️ mutegroup\n` +
            `│ ▫️ unmutegroup\n` +
            `│ ▫️ muteuser <tag>\n` +
            `│ ▫️ unmutegroup\n` +
            `│ ▫️ warn <tag>\n` +
            `│ ▫️ warnings\`\n` +
            `│ ▫️ resetwarn\n` +
            `═══════════════════════════════\n\n` +
            `👑 *OWNER COMMANDS*\n\n` +
            `═══════════════════════════════\n` +
            `│ ▫️ bot <start/stop>\n` +
            `│ ▫️ autoreact <on/off>\n` +
            `═══════════════════════════════\n\n` +
            `ℹ️ *QUICK HELP*\n\n` +
            `═══════════════════════════════\n` +
            `│ ▫️ Owner/Admin ➜ Security & Control\n` +
            `│ ▫️ Member ➜ Media & General\n` +
            `═══════════════════════════════\n\n` +
            `*Bot is designed to enhance group management and provide entertainment. Use commands wisely and follow group rules.*\n\n` +
            `═══════════════════════════════\n` +
            `⚡ *Status:* Fast • Secure • Powerful\n` +
            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
            `🤖 *Bot Name:* ${BOT_NAME}\n` +
            `═══════════════════════════════`;
        await safeSendMessage(msg.key.remoteJid, { text: menuText }, { quoted: msg });
    }
};