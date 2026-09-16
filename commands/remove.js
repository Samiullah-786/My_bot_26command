const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'kick',
    aliases: ['remove'],
    description: 'Kick user from group via message reply, mention, or number',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, isGroup } = context;
        if (!isGroup) return;

        try {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants || [];
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderParticipant = participants.find(
                p => p.id === senderJid || p.id?.replace(/:[0-9]+/, '') === senderJid?.replace(/:[0-9]+/, '')
            );
            const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

            if (!isOwner && !isAdmin) {
                return await safeSendMessage(msg.key.remoteJid, {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `       ❌ *ACCESS DENIED*     \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Sirf Group Admin ya Bot Owner ye command use kar sakta hai!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Restricted\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    quoted: msg
                });
            }

            // Safe target extraction
            const contextInfo = msg.message?.extendedTextMessage?.contextInfo ||
                msg.message?.imageMessage?.contextInfo ||
                msg.message?.videoMessage?.contextInfo;

            const quotedParticipant = contextInfo?.participant;
            const mentionedJids = contextInfo?.mentionedJid || [];

            let targetUser = null;
            if (quotedParticipant) {
                targetUser = quotedParticipant;
            } else if (mentionedJids.length > 0) {
                targetUser = mentionedJids[0];
            } else if (args[0]) {
                const cleanedNum = args[0].replace(/[^0-9]/g, '');
                if (cleanedNum) {
                    targetUser = cleanedNum + '@s.whatsapp.net';
                }
            }

            const botJidNumber = sock.user?.id ? sock.user.id.split(':')[0].replace(/[^0-9]/g, '') : '';
            const targetNumberCheck = targetUser ? targetUser.split('@')[0].split(':')[0].replace(/[^0-9]/g, '') : '';

            if (!targetUser || targetNumberCheck === botJidNumber) {
                return await safeSendMessage(msg.key.remoteJid, {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ⚠️ *INVALID TARGET*     \n` +
                        `════════════════════════════════\n\n\n` +
                        `⚠️ Sahi user tag karein, message par reply karein, ya khud bot ko kick nahi kiya ja sakta!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Failed\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    quoted: msg
                });
            }

            await sock.groupParticipantsUpdate(msg.key.remoteJid, [targetUser], 'remove');
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ✅ *USER KICKED*      \n` +
                    `════════════════════════════════\n\n\n` +
                    `✅ User ko group se kick kar diya gaya hai.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Success\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                mentions: [targetUser]
            }, { quoted: msg });

        } catch (e) {
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ❌ *FAILED TO KICK*   \n` +
                    `════════════════════════════════\n\n\n` +
                    `❌ User ko kick karne mein error aa gaya.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Failed\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    }
};