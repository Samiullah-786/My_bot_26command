const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'antidelete',
    description: 'Secret background anti-delete tracker for text, media, and stickers',
    async execute(sock, msg, args, context) {
        const { isOwner, safeSendMessage, OWNER_NUMBER } = context;
        if (!isOwner) return;

        const cleanOwnerNum = OWNER_NUMBER.replace(/[^0-9]/g, '');
        const ownerJid = cleanOwnerNum + '@s.whatsapp.net';

        await safeSendMessage(ownerJid, {
            text: '🛡️ *VIP ANTI-DELETE SYSTEM* is running silently in the background.'
        });
    },

    async handleEvent(sock, updateObject, messageCache, OWNER_NUMBER, safeSendMessage) {
        try {
            if (!updateObject) return;

            function findProtocolMessage(obj, depth = 0) {
                if (!obj || typeof obj !== 'object' || depth > 10) return null;
                if (obj.protocolMessage) return obj.protocolMessage;
                if (obj.message?.protocolMessage) return obj.message.protocolMessage;
                for (const value of Object.values(obj)) {
                    if (value && typeof value === 'object') {
                        const result = findProtocolMessage(value, depth + 1);
                        if (result) return result;
                    }
                }
                return null;
            }

            const protocolMessage = findProtocolMessage(updateObject);
            if (!protocolMessage) return;
            if (Number(protocolMessage.type) !== 0) return; // Type 0 means revocation/deletion

            const deletedKey = protocolMessage.key;
            if (!deletedKey?.id) return;

            let originalMsg = messageCache.get(deletedKey.id);
            if (!originalMsg) {
                for (const [cachedId, cachedMessage] of messageCache.entries()) {
                    if (
                        String(cachedId) === String(deletedKey.id) ||
                        String(cachedMessage?.key?.id) === String(deletedKey.id)
                    ) {
                        originalMsg = cachedMessage;
                        break;
                    }
                }
            }

            const cleanOwnerNum = OWNER_NUMBER.replace(/[^0-9]/g, '');
            const ownerJid = cleanOwnerNum + '@s.whatsapp.net';
            const groupJid = deletedKey.remoteJid || originalMsg?.key?.remoteJid || 'Private Chat';
            const originalSender = originalMsg?.key?.participant || deletedKey.participant || originalMsg?.key?.remoteJid || 'Unknown';
            const senderTag = originalSender.split('@')[0];

            if (!originalMsg) {
                await safeSendMessage(ownerJid, {
                    text:
                        `🤖 *Bot Name:* ${BOT_NAME}\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `🚨 *ANTI-DELETE LOG (CACHE MISS)*\n\n` +
                        `💬 *Chat:* ${groupJid}\n` +
                        `🆔 *Message ID:* ${deletedKey.id}\n` +
                        `⚠️ Note: Original message cache mein nahi mila tha.`
                });
                return;
            }

            const msgContent = originalMsg.message;
            const messageType = Object.keys(msgContent)[0];
            const deletedText =
                msgContent?.conversation ||
                msgContent?.extendedTextMessage?.text ||
                msgContent?.imageMessage?.caption ||
                msgContent?.videoMessage?.caption ||
                msgContent?.documentMessage?.caption ||
                '[Media / Sticker / Attachment]';

            await safeSendMessage(ownerJid, {
                text:
                    `🤖 *Bot Name:* ${BOT_NAME}\n` +
                    `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                    `🚨 *ANTI-DELETE ALERT (SECRET)*\n\n` +
                    `💬 *Group/Chat:* ${groupJid}\n` +
                    `👤 *Sender:* @${senderTag}\n` +
                    `📦 *Type:* ${messageType}\n` +
                    `🆔 *Message ID:* ${deletedKey.id}\n\n` +
                    `📝 *Deleted Content:* \n${deletedText}`,
                mentions: [originalSender]
            });

            try {
                let mediaType = null;
                let mediaMessage = null;

                if (msgContent.imageMessage) {
                    mediaType = 'image';
                    mediaMessage = msgContent.imageMessage;
                } else if (msgContent.videoMessage) {
                    mediaType = 'video';
                    mediaMessage = msgContent.videoMessage;
                } else if (msgContent.audioMessage) {
                    mediaType = 'audio';
                    mediaMessage = msgContent.audioMessage;
                } else if (msgContent.documentMessage) {
                    mediaType = 'document';
                    mediaMessage = msgContent.documentMessage;
                } else if (msgContent.stickerMessage) {
                    mediaType = 'sticker';
                    mediaMessage = msgContent.stickerMessage;
                }

                if (mediaType && mediaMessage) {
                    const stream = await downloadContentFromMessage(mediaMessage, mediaType);
                    const chunks = [];
                    for await (const chunk of stream) {
                        chunks.push(chunk);
                    }
                    const buffer = Buffer.concat(chunks);

                    if (mediaType === 'image') {
                        await safeSendMessage(ownerJid, { image: buffer, caption: `🖼️ *Recovered Image* from @${senderTag} in ${groupJid}`, mentions: [originalSender] });
                    } else if (mediaType === 'video') {
                        await safeSendMessage(ownerJid, { video: buffer, caption: `🎥 *Recovered Video* from @${senderTag} in ${groupJid}`, mentions: [originalSender] });
                    } else if (mediaType === 'audio') {
                        await safeSendMessage(ownerJid, { audio: buffer, mimetype: 'audio/mp4', ptt: mediaMessage.ptt || false });
                    } else if (mediaType === 'document') {
                        await safeSendMessage(ownerJid, { document: buffer, mimetype: mediaMessage.mimetype, fileName: mediaMessage.fileName || 'recovered_file.bin' });
                    } else if (mediaType === 'sticker') {
                        await safeSendMessage(ownerJid, { sticker: buffer, caption: `🎭 *Recovered Sticker* from @${senderTag} in ${groupJid}`, mentions: [originalSender] });
                    }
                } else {
                    await safeSendMessage(ownerJid, { forward: originalMsg });
                }
            } catch (mediaErr) {
                console.error('Media recovery error:', mediaErr);
            }

            messageCache.delete(deletedKey.id);
        } catch (error) {
            console.error('❌ ANTI-DELETE ERROR:', error);
        }
    }
};