const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'warn',
    description: 'Warn user',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup, isOwner } = context;

        if (!isGroup) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `    👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *GROUP ONLY*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ \`!warn\` sirf group mein use ho sakti hai!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Restricted\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );
        }

        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = groupMetadata.participants || [];

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
                            `    👑 *${BOT_NAME}* 👑     \n` +
                            `        ❌ *RESTRICTED*       \n` +
                            `════════════════════════════════\n\n\n` +
                            `❌ Sirf Group Admin ya Bot Owner \`!warn\` use kar sakta hai!\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Restricted\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `🤖 *Bot Name:* ${BOT_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const target =
                msg.message.extendedTextMessage?.contextInfo?.participant ||
                msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
                (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

            if (!target) {
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `    👑 *${BOT_NAME}* 👑     \n` +
                            `      ⚠️ *INVALID SYNTAX*     \n` +
                            `════════════════════════════════\n\n\n` +
                            `⚠️ Kisi user ko reply karke ya tag karke \`!warn\` use karein.\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Failed\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `🤖 *Bot Name:* ${BOT_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const cleanTarget = target.replace(/:[0-9]+/, '');

            if (!global.warningsTrack) global.warningsTrack = new Map();

            const warningKey = cleanTarget + '_manual';
            const warnCount = (global.warningsTrack.get(warningKey) || 0) + 1;

            global.warningsTrack.set(warningKey, warnCount);

            if (warnCount >= 5) {
                await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `    👑 *${BOT_NAME}* 👑     \n` +
                            `      ⚠️ *WARNING LIMIT*     \n` +
                            `════════════════════════════════\n\n\n` +
                            `🚫 @${cleanTarget.split('@')[0]} ko 5/5 manual warnings mil gayi hain!\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Limit Reached\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `🤖 *Bot Name:* ${BOT_NAME}\n` +
                            `════════════════════════════════`,
                        mentions: [target]
                    },
                    { quoted: msg }
                );

                try {
                    await sock.groupParticipantsUpdate(
                        msg.key.remoteJid,
                        [target],
                        'remove'
                    );
                } catch (kickError) {
                    console.error(
                        '❌ WARN KICK ERROR:',
                        kickError?.message || kickError
                    );
                }

                global.warningsTrack.delete(warningKey);
            } else {
                await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `     ⚠️ *MANUAL WARNING*      \n` +
                            `════════════════════════════════\n\n\n` +
                            `⚠️ @${cleanTarget.split('@')[0]} ko *Manual Warning ${warnCount}/5* mili hai!\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Alerted\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `🤖 *Bot Name:* ${BOT_NAME}\n` +
                            `════════════════════════════════`,
                        mentions: [target]
                    },
                    { quoted: msg }
                );
            }
        } catch (error) {
            console.error(
                '❌ WARN ERROR:',
                error?.stack || error?.message || error
            );
        }
    }
};