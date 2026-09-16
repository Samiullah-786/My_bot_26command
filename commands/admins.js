const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'admins',
    description: 'Tag all group admins',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup } = context;

        if (!isGroup) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *GROUP ONLY*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ \`!admins\` sirf group mein use ho sakti hai!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Restricted\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );
        }

        try {
            const groupMetadata = await sock.groupMetadata(
                msg.key.remoteJid
            );

            const participants =
                groupMetadata.participants || [];

            const admins =
                participants.filter(
                    p =>
                        p.admin === 'admin' ||
                        p.admin === 'superadmin'
                );

            if (!admins.length) {
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `        ❌ *NOT FOUND*        \n` +
                            `════════════════════════════════\n\n\n` +
                            `❌ Group admins nahi mile!\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Error\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const mentions =
                admins
                    .map(p => p.id)
                    .filter(Boolean);

            const adminText =
                admins
                    .map(
                        p =>
                            `│ ▫️ @${p.id
                                .split('@')[0]
                                .split(':')[0]}`
                    )
                    .join('\n');

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `       👑 *GROUP ADMINs*      \n` +
                        `════════════════════════════════\n\n\n` +
                        `👑 *GROUP ADMINS*:\n\n\n` +
                        `${adminText}\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Success\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    mentions
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error(
                '❌ ADMINS ERROR:',
                error?.stack ||
                error?.message ||
                error
            );

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *FETCH FAILED*     \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Admin list fetch nahi ho saki.\n\n\n` +
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