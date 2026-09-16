const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'tagall',
    description: 'Tag all members',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isGroup, isOwner } = context;
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
                        `════════════════════════════════`
                }, { quoted: msg });
            }

            const participantJids = participants.map(v => v.id);
            const taggedNames = participantJids.map(p => `@${p.split('@')[0]}`).join(' ');

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `       📢 *TAGGING ALL*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `📢 *TAGGING ALL MEMBERS*:\n` +
                        `${taggedNames}\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Broadcast Sent\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                    mentions: participantJids
                },
                { quoted: msg }
            );
        } catch (e) {
            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ❌ *OPERATION FAILED*\n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ Failed to tag members.\n\n\n` +
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