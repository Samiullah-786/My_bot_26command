const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'add',
    description: 'Add user to group',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, isGroup } = context;
        if (!isGroup) return;

        let user = null; // ✅ Try ke bahar declare kiya taaki catch mein access ho sake [cite: 6]

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
                        `════════════════════════════════`
                }, { quoted: msg });
            }

            user = args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null;
            if (!user) return await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ⚠️ *NUMBER REQUIRED*     \n` +
                    `════════════════════════════════\n\n\n` +
                    `⚠️ Kripya ek valid WhatsApp number provide karein!\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Incomplete\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });

            await sock.groupParticipantsUpdate(msg.key.remoteJid, [user], 'add');
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        ✅ *USER ADDED*    \n` +
                    `════════════════════════════════\n\n\n` +
                    `✅ @${user.split('@')[0]} ko group mein add kar diya gaya hai.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Success\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        } catch (error) {
            console.error('❌ ADD USER ERROR:', error?.stack || error?.message || error);
            const displayUser = user ? user.split('@')[0] : 'User';
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ❌ *FAILED TO ADD*     \n` +
                    `════════════════════════════════\n\n\n` +
                    `❌ @${displayUser} ko group mein add nahi kiya ja saka.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Failed\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    }
};