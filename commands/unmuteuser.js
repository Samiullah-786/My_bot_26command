const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'unmuteuser',
    description: 'Unmute specific user so their messages stop deleting',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, mutedUsers } = context;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');

        if (!isGroup) {
            if (!isOwner) return;
        } else {
            const metadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = metadata.participants || [];
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderParticipant = participants.find(
                p => p.id === senderJid || p.id?.replace(/:[0-9]+/, '') === senderJid?.replace(/:[0-9]+/, '')
            );
            const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

            if (!isOwner && !isAdmin) return;
        }

        const muteContext = msg.message.extendedTextMessage?.contextInfo;
        let targetJid = muteContext?.participant || muteContext?.mentionedJid?.[0] || null;

        if (!targetJid && args[0]) {
            const cleanNum = args[0].replace(/[^0-9]/g, '');
            if (cleanNum) targetJid = cleanNum + '@s.whatsapp.net';
        }

        if (targetJid) {
            const cleanJid = targetJid.replace(/:[0-9]+/, '');
            const numberOnly = cleanJid.split('@')[0];

            // User ko mutedUsers list se mukammal remove karna taake messages delete na hon
            mutedUsers.delete(cleanJid);
            mutedUsers.delete(numberOnly);
            mutedUsers.delete(targetJid);

            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       🔊 *USER UNMUTED*      \n` +
                    `════════════════════════════════\n\n\n` +
                    `🔊 @${cleanJid.split('@')[0]} ko unmute kar diya gaya hai. Ab unke messages delete nahi honge.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Success\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                mentions: [targetJid]
            }, { quoted: msg });
        } else {
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `        ⚠️ *INVALID SYNTAX*     \n` +
                    `════════════════════════════════\n\n\n` +
                    `⚠️ Tag user or reply: \`!unmuteuser @tag\`\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Failed\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    }
};