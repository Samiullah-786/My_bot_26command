const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'groupinfo',
    description: 'Get group information',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup } = context;

        if (!isGroup) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text: 
                    `════════════════════════════════\n` +
                    `        👑 *${BOT_NAME}* 👑\n` +
                    `          ❌ *ACCESS DENIED*     \n` +
                    `════════════════════════════════\n\n\n` +
                    '❌ `!groupinfo` sirf group mein use ho sakti hai!\n\n\n' +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Restricted\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
                },
                { quoted: msg }
            );
        }

        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = groupMetadata.participants || [];

            const admins = participants.filter(
                p => p.admin === 'admin' || p.admin === 'superadmin'
            );

            const owner = groupMetadata.owner || 'Unknown';

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `        👥 *GROUP INFO*\n` +
                        `════════════════════════════════\n\n\n` +
                        `📌 *Name:* ${groupMetadata.subject || 'Unknown'}\n` +
                        `👤 *Members:* ${participants.length}\n` +
                        `👑 *Admins:* ${admins.length}\n` +
                        `🆔 *Group ID:* ${msg.key.remoteJid}\n` +
                        `👑 *Owner:* ${owner}\n\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n`
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error(
                '❌ GROUPINFO ERROR:',
                error?.stack || error?.message || error
            );

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *FETCH FAILED*     \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Group information fetch nahi ho saki.\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Error\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );
        }
    }
};