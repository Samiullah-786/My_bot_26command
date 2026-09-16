const ytSearch = require('yt-search');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const BOT_NAME = 'VIP MASTER BOT';
const DEVELOPER_NAME = 'Sami Khan';

module.exports = {
    name: 'song',
    description: 'Download YouTube song as MP3',
    async execute(sock, msg, args, context) {
        const { safeSendMessage } = context;
        const songName = args.join(' ');

        if (!songName) {
            return await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🎵 *SONG DOWNLOADER*        \n` +
                        `════════════════════════════════\n\n\n` +
                        '❌ Song name laazmi hai!\n' +
                        `Example:\n!song tum hi ho\n\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Pending\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                },
                { quoted: msg }
            );
        }

        try {
            await safeSendMessage(
                msg.key.remoteJid,
                { text: `🔎 Searching: ${songName}...` },
                { quoted: msg }
            );

            const searchResults = await ytSearch(songName);
            const video = searchResults.videos?.[0];

            if (!video) {
                return await safeSendMessage(
                    msg.key.remoteJid,
                    {
                        text:
                            `════════════════════════════════\n` +
                            ` 👑 *${BOT_NAME}* 👑     \n` +
                            ` 🎵 *SONG DOWNLOADER*        \n` +
                            `════════════════════════════════\n\n\n` +
                            '❌ Song nahi mila!\n' +
                            `\n\nEnsure song name is correct and try again.\n\n\n` +
                            `════════════════════════════════\n` +
                            `⚡ *Status:* Pending\n` +
                            `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                            `════════════════════════════════`,
                    },
                    { quoted: msg }
                );
            }

            const title = video.title || 'Unknown Song';
            const channel = video.author?.name || 'Unknown Channel';
            const views = Number(video.views || 0).toLocaleString();
            const duration = video.timestamp || 'Unknown';
            const uploaded = video.ago || 'Unknown';
            const videoUrl = video.url;
            const thumbnailUrl = video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
            const channelUrl = video.author?.url || 'https://www.youtube.com';

            const infoCaption =
                `🎵 *VIP SONG DOWNLOADER* 🎵\n\n` +
                `📌 *Title:* ${title}\n` +
                `👤 *Channel:* ${channel}\n` +
                `👁️ *Views:* ${views}\n` +
                `⏱️ *Duration:* ${duration}\n` +
                `📅 *Uploaded:* ${uploaded}\n\n` +
                `🔗 *Channel:* ${channelUrl}\n` +
                `🎬 *YouTube:* ${videoUrl}\n\n` +
                `⬇️ *Audio download ho raha hai...*\n` +
                `⏳ Please wait...`;

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    image: { url: thumbnailUrl },
                    caption: infoCaption
                },
                { quoted: msg }
            );

            const downloadDir = path.join(__dirname, '..', 'song_downloads');
            if (!fs.existsSync(downloadDir)) {
                fs.mkdirSync(downloadDir, { recursive: true });
            }

            const isWin = os.platform() === 'win32';
            const possiblePaths = [
                path.join(__dirname, '..', isWin ? 'yt-dlp.exe' : 'yt-dlp'),
                path.join(process.cwd(), isWin ? 'yt-dlp.exe' : 'yt-dlp'),
                isWin ? 'yt-dlp.exe' : 'yt-dlp'
            ];

            let ytDlpPath = null;
            for (const p of possiblePaths) {
                if (p === 'yt-dlp.exe' || p === 'yt-dlp') {
                    ytDlpPath = p;
                    break;
                }
                if (fs.existsSync(p)) {
                    ytDlpPath = p;
                    break;
                }
            }

            if (!ytDlpPath) {
                ytDlpPath = isWin ? 'yt-dlp.exe' : 'yt-dlp';
            }

            const fileId = `song_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
            const outputTemplate = path.join(downloadDir, `${fileId}.%(ext)s`);
            const outputFile = path.join(downloadDir, `${fileId}.mp3`);

            await new Promise((resolve, reject) => {
                const ytDlpArgs = [
                    videoUrl,
                    '--no-playlist',
                    '-f', 'bestaudio/best',
                    '-x',
                    '--audio-format', 'mp3',
                    '--audio-quality', '128K',
                    '--impersonate', 'chrome',
                    '-o', outputTemplate,
                    '--retries', '5',
                    '--fragment-retries', '5',
                    '--retry-sleep', '2',
                    '--socket-timeout', '60',
                    '--force-ipv4',
                    '--no-warnings'
                ];

                const downloader = spawn(ytDlpPath, ytDlpArgs, {
                    windowsHide: true,
                    shell: true
                });

                let stderr = '';
                downloader.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                downloader.on('error', (error) => {
                    reject(error);
                });

                downloader.on('close', (code) => {
                    if (code === 0) {
                        resolve();
                    } else {
                        reject(new Error(`yt-dlp exited with code ${code}\n\n${stderr}`));
                    }
                });
            });

            if (!fs.existsSync(outputFile)) {
                const files = fs.readdirSync(downloadDir);
                const generatedMp3 = files.find(
                    file => file.startsWith(fileId) && file.toLowerCase().endsWith('.mp3')
                );

                if (generatedMp3) {
                    fs.renameSync(path.join(downloadDir, generatedMp3), outputFile);
                }
            }

            if (!fs.existsSync(outputFile)) {
                throw new Error('MP3 file generate nahi hui. yt-dlp ya ffmpeg path verify karein.');
            }

            const audioBuffer = fs.readFileSync(outputFile);
            if (!audioBuffer || audioBuffer.length < 10000) {
                throw new Error('Downloaded MP3 empty ya invalid hai.');
            }

            const safeFileName =
                title.replace(/[\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().substring(0, 100) || 'song';

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    audio: audioBuffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${safeFileName}.mp3`,
                    ptt: false
                },
                { quoted: msg }
            );

            setTimeout(() => {
                try {
                    if (fs.existsSync(outputFile)) {
                        fs.unlinkSync(outputFile);
                    }
                } catch (cleanupError) { }
            }, 30000);

        } catch (error) {
            console.error('❌ SONG DOWNLOAD ERROR:', error);

            const cleanError = String(error?.message || 'Unknown download error')
                .replace(/\x1b\[[0-9;]*m/g, '')
                .substring(0, 1200);

            await safeSendMessage(
                msg.key.remoteJid,
                {
                    text:
                        `════════════════════════════════\n` +
                        ` 👑 *${BOT_NAME}* 👑     \n` +
                        ` 🎵 *SONG DOWNLOADER*        \n` +
                        `════════════════════════════════\n\n\n` +
                        `❌ *SONG DOWNLOAD ERROR*\n\n` +
                        `⚠️ ${cleanError}\n\n` +
                        `💡 Ensure yt-dlp and ffmpeg are installed and accessible in system PATH.\n\n` +
                        `════════════════════════════════\n` +
                        `⚡ *Status:* Error\n` +
                        `👨‍💻 *Developer:* ${DEVELOPER_NAME}\n` +
                        `════════════════════════════════`,
                },
                { quoted: msg }
            );
        }
    }
};