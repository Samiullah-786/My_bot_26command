const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'resetwarn',
    description: 'Reset warnings for user or all users',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup, isOwner } = context;

        if (!isGroup) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *GROUP ONLY*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ \`!resetwarn\` sirf group mein use ho sakti hai!\n\n\n` +
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
                            `       ❌ *ACCESS DENIED*     \n` +
                            `════════════════════════════════\n\n\n` +
                            `❌ Sirf Group Admin ya Bot Owner \`!resetwarn\` use kar sakta hai!\n\n\n` +
                            `════════════════════════════════\n\n\n` +
                            `⚡ *Status:* Restricted\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const subArg = (args[0] || '').toLowerCase();
            if (!global.warningsTrack) global.warningsTrack = new Map();

            // Agar user '!resetwarn all' likhe toh sabhi ki warnings khatam ho jayein
            if (subArg === 'all') {
                global.warningsTrack.clear();
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `    🛡️ *ALL WARNINGS RESET*   \n` +
                            `════════════════════════════════\n\n\n` +
                            `✅ Group ke tamam members ki tamam warnings reset kar di gayi hain [cite: 8].\n\n\n` +
                            `════════════════════════════════\n\n\n` +
                            `⚡ *Status:* Success\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
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
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `       ⚠️ *NO USER SPECIFIED*   \n` +
                            `════════════════════════════════\n\n\n` +
                            `⚠️ Kisi user ko tag karein ya \`!resetwarn all\` use karein [cite: 8].\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Restricted\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    },
                    { quoted: msg }
                );
            }

            const cleanTarget = target.replace(/:[0-9]+/, '');
            const rawNumber = cleanTarget.split('@')[0];

            // Delete matching keys flexibly (handles both JID and raw number/LID variants in map)
            for (const key of global.warningsTrack.keys()) {
                if (key.includes(rawNumber)) {
                    global.warningsTrack.delete(key);
                }
            }

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `    🛡️ *WARNINGS RESET*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `✅ @${rawNumber} ki tamam warnings (Manual, Links, Spam, Sticker) reset kar di gayi hain [cite: 9].\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Success\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    mentions: [target]
                },
                { quoted: msg }
            );
        } catch (error) {
            console.error(
                '❌ RESET WARN ERROR:',
                error?.stack || error?.message || error
            );
        }
    }
};