const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'everyone',
    description: 'Tag everyone in group',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup, isOwner } = context;

        if (!isGroup) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *GROUP ONLY COMMAND*\n` +
                        `════════════════════════════════\n\n\n` +
                        '❌ `!everyone` sirf group mein use ho sakti hai!\n\n\n' +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Restricted\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );
        }

        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants || [];

            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderParticipant = participants.find(
                p =>
                    p.id === senderJid ||
                    p.id?.replace(/:[0-9]+/, '') === senderJid?.replace(/:[0-9]+/, '')
            );

            const isAdmin =
                senderParticipant?.admin === 'admin' ||
                senderParticipant?.admin === 'superadmin';

            if (!isOwner && !isAdmin) {
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `        ❌ *ACCESS DENIED*\n` +
                            `════════════════════════════════\n\n\n` +
                            '❌ Sirf Group Admin ya Bot Owner `!everyone` command use kar sakta hai!\n\n\n' +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Restricted\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const mentions = participants.map(p => p.id).filter(Boolean);

            if (!mentions.length) {
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `        ❌ *NO PARTICIPANTS*\n` +
                            `════════════════════════════════\n\n\n` +
                            '❌ Group participants nahi mile!\n\n\n' +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Error\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const customMessage = args.length > 0 ? args.join(' ') : 'Koi khaas baat nahi hai!';

            let tagText = '';
            for (let p of participants) {
                tagText += `@${p.id.split('@')[0].split(':')[0]} `;
            }

            const finalMessage =
                `════════════════════════════════\n` +
                `        📢 *TAGGING EVERYONE*\n` +
                `════════════════════════════════\n\n\n` +
                `📌 *Message:* ${customMessage}\n` +
                `👥 *Total Members:* ${participants.length}\n\n\n` +
                `════════════════════════════════\n\n\n` +
                `${tagText}\n` +
                `════════════════════════════════\n\n` +
                `🤖 *Bot Name:* ${BOT_NAME}\n` +
                `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                `═══════════════════════════════`;

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text: finalMessage,
                    mentions: mentions
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error(
                '❌ EVERYONE ERROR:',
                error?.stack || error?.message || error
            );

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *BROADCAST FAILED*\n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Everyone tag send nahi ho saka.\n\n\n` +
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