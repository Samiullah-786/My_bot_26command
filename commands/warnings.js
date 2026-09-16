const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'warnings',
    description: 'Check warnings count for all or specific user',
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
                        `❌ \`!warnings\` sirf group mein use ho sakti hai!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Restricted\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `════════════════════════════════`
                },
                { quoted: msg }
            );
        }

        const track = global.warningsTrack || new Map();
        const metadata = await sock.groupMetadata(msg.key.remoteJid).catch(() => ({ participants: [] }));
        const participants = metadata.participants || [];

        // Agar user tag ya reply kiya gaya hai, toh sirf us ek user ki detail dikhayein
        const target =
            msg.message.extendedTextMessage?.contextInfo?.participant ||
            msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
            (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        if (target) {
            const cleanTarget = target.replace(/:[0-9]+/, '');
            const cleanDigits = cleanTarget.split('@')[0].split(':')[0];
            const participant = participants.find(p => p.id === target || p.id?.split('@')[0]?.split(':')[0] === cleanDigits || p.lid === cleanTarget);
            const displayName = participant?.notify || participant?.name || `@${cleanDigits}`;

            const manualWarnings = track.get(cleanTarget + '_manual') || 0;
            const linkWarnings = track.get(cleanTarget + '_link') || 0;
            const spamWarnings = track.get(cleanTarget + '_spam') || 0;
            const stickerWarnings = track.get(cleanTarget + '_sticker') || 0;
            const totalWarnings = manualWarnings + linkWarnings + spamWarnings + stickerWarnings;

            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `     📊 *WARNING STATUS*      \n` +
                        `════════════════════════════════\n\n\n` +
                        `👤 *User:* ${displayName}\n\n` +
                        `│ ▫️ Manual: ${manualWarnings}/5\n` +
                        `│ ▫️ Links: ${linkWarnings}/5\n` +
                        `│ ▫️ Spam: ${spamWarnings}/5\n` +
                        `│ ▫️ Sticker: ${stickerWarnings}/5\n` +
                        `│ ▫️ Total Warnings: ${totalWarnings}\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Checked\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `════════════════════════════════`,
                    mentions: [participant?.id || target]
                },
                { quoted: msg }
            );
        }

        const userMap = new Map();
        for (const [key, value] of track.entries()) {
            if (value > 0) {
                const userNumber = key.split('_')[0];
                if (!userMap.has(userNumber)) {
                    userMap.set(userNumber, { manual: 0, link: 0, spam: 0, sticker: 0 });
                }
                if (key.endsWith('_manual')) userMap.get(userNumber).manual = value;
                if (key.endsWith('_link')) userMap.get(userNumber).link = value;
                if (key.endsWith('_spam')) userMap.get(userNumber).spam = value;
                if (key.endsWith('_sticker')) userMap.get(userNumber).sticker = value;
            }
        }

        if (userMap.size === 0) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `     📊 *WARNINGS LIST*       \n` +
                        `════════════════════════════════\n\n\n` +
                        `✅ Is group mein kisi bhi user ko koi warning nahi mili!\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Clean\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `════════════════════════════════`
                }, { quoted: msg }
            );
        }

        let listText = '';
        let mentionsList = [];
        let index = 1;

        for (const [userNum, counts] of userMap.entries()) {
            const total = counts.manual + counts.link + counts.spam + counts.sticker;
            const cleanDigits = userNum.replace(/@lid$/i, '').split('@')[0].split(':')[0];
            const participant = participants.find(p => (p.id && p.id.split('@')[0].split(':')[0] === cleanDigits) || p.lid === userNum || p.id === userNum);
            // Fallback to native whatsapp mention symbol `@number` which resolves pushname natively in app
            const displayName = participant?.notify || participant?.name || `@${cleanDigits}`;
            const validJid = cleanDigits + '@s.whatsapp.net';

            mentionsList.push(participant?.id || validJid);
            listText += `${index++}. ${displayName} (Total: ${total})\n   [M: ${counts.manual}, L: ${counts.link}, S: ${counts.spam}, St: ${counts.sticker}]\n`;
        }

        await safeSendMessage(
            msg.key.remoteJid,
            {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `     📊 *ALL WARNINGS LIST*   \n` +
                    `════════════════════════════════\n\n\n` +
                    listText + `\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Retrieved\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `🤖 *Bot Name:* ${BOT_NAME}\n` +
                    `════════════════════════════════`,
                mentions: mentionsList
            },
            { quoted: msg }
        );
    }
};