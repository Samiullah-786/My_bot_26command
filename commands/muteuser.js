const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

// Global storage to keep track of user individual mute timers
if (!global.userMuteTimers) global.userMuteTimers = new Map();

module.exports = {
    name: 'muteuser',
    description: 'Mute specific user messages individually with a custom timer',
    async execute(sock, msg, args, context) {
        const { safeSendMessage, isOwner, mutedUsers } = context;
        const isGroup = msg.key.remoteJid.endsWith('@g.us');

        if (!isGroup) {
            if (!isOwner) return await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ❌ *ACCESS DENIED*     \n` +
                    `════════════════════════════════\n\n\n` +
                    `❌ Access Denied.\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Restricted\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
            return;
        }

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

        const muteContext = msg.message.extendedTextMessage?.contextInfo;
        let targetJid = muteContext?.participant || muteContext?.mentionedJid?.[0] || null;

        // Check if minutes are provided in arguments (e.g., !muteuser @tag 5 or !muteuser 923xx 10)
        let durationMinutes = 5; // Default 5 minutes

        if (!targetJid && args[0]) {
            const cleanNum = args[0].replace(/[^0-9]/g, '');
            if (cleanNum) targetJid = cleanNum + '@s.whatsapp.net';
        }

        // Find time argument if user is tagged or replied
        const timeArg = args.find(arg => !isNaN(arg) && arg !== args[0]);
        if (timeArg) {
            durationMinutes = parseInt(timeArg);
        } else if (!targetJid && args[1] && !isNaN(args[1])) {
            durationMinutes = parseInt(args[1]);
        } else if (targetJid && args[0] && !isNaN(args[0]) && !args[0].includes('@')) {
            // If first arg is a number other than phone number length
            if (args[0].length <= 3) durationMinutes = parseInt(args[0]);
        }

        if (targetJid) {
            const cleanJid = targetJid.replace(/:[0-9]+/, '');
            const numberOnly = cleanJid.split('@')[0];
            const chatJid = msg.key.remoteJid;
            const timerKey = `${chatJid}_${cleanJid}`;

            // Agar pehle se timer chal raha hai toh usay clear kar dein
            if (global.userMuteTimers.has(timerKey)) {
                clearTimeout(global.userMuteTimers.get(timerKey));
                global.userMuteTimers.delete(timerKey);
            }

            // Add user to individual mute list[cite: 13]
            mutedUsers.add(cleanJid);
            mutedUsers.add(numberOnly);
            if (targetJid.includes('@lid')) mutedUsers.add(targetJid);

            await safeSendMessage(chatJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       🔇 *USER MUTED*        \n` +
                    `════════════════════════════════\n\n\n` +
                    `🔇 @${cleanJid.split('@')[0]} ko ${durationMinutes} minute(s) ke liye mute kar diya gaya hai. Ab unke messages automatic delete hote rahenge[cite: 13].\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Success\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`,
                mentions: [targetJid]
            }, { quoted: msg });

            // Timer to automatically unmute user after specified minutes[cite: 13]
            const muteTimer = setTimeout(async () => {
                try {
                    global.userMuteTimers.delete(timerKey);
                    mutedUsers.delete(cleanJid);
                    mutedUsers.delete(numberOnly);
                    mutedUsers.delete(targetJid);

                    await safeSendMessage(chatJid, {
                        text: `🔊 @${cleanJid.split('@')[0]} ka ${durationMinutes} minute ka mute waqt poora ho gaya hai aur unhein automatically unmute kar diya gaya hai[cite: 13].`,
                        mentions: [targetJid]
                    });
                } catch (err) {
                    console.error('Auto-unmute user error:', err);
                }
            }, durationMinutes * 60 * 1000);

            global.userMuteTimers.set(timerKey, muteTimer);

        } else {
            await safeSendMessage(msg.key.remoteJid, {
                text:
                    `════════════════════════════════\n` +
                    `     👑 *${BOT_NAME}* 👑     \n` +
                    `       ⚠️ *INVALID SYNTAX*     \n` +
                    `════════════════════════════════\n\n\n` +
                    `⚠️ Reply/Tag user with minutes: \`!muteuser @tag 5\`\n\n\n` +
                    `════════════════════════════════\n` +
                    `⚡ *Status:* Failed\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `════════════════════════════════`
            }, { quoted: msg });
        }
    }
};