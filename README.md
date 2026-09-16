# 🤖 VIP Master WhatsApp Bot

A powerful and feature-rich WhatsApp Bot built with Node.js and `@whiskeysockets/baileys`, featuring anti-delete tracking, music downloading, robust group security, and flexible command controls.

---

## 🛠️ Issues Resolved in This Version

1. **Bot Stop / Offline Logic Fixed:** When executing `!bot stop`, the bot now completely goes offline for all non-owner commands and regular messages, only responding to owner commands (like `!bot start`).
2. **Mute User Message Deletion Fixed:** Muted users' messages are now correctly identified and automatically deleted in groups by the security rule engine.
3. **Song Downloader (`yt-dlp` & `ffmpeg`) Resolved:** Enhanced the downloader with robust path resolution and fallback support so it correctly detects `yt-dlp` and `ffmpeg` without throwing path errors.
4. **Ping Command Refined:** The ping command now responds instantly with a direct message (`🏓 PONG! Bot is online and working perfectly!`) without unnecessary latency calculation spam.
5. **View Once Auto-Trigger Fixed:** Removed unwanted automatic triggers. View Once media unlock now only triggers explicitly via `!view` command or when replying to a View Once message with keyword/command.
6. **Links & Sticker Protection On/Off Controls:** Added dedicated toggle commands (`!links on/off`, `!sticker on/off`, and `!security links/sticker on/off`) so you can enable or disable link spam and sticker spam moderation whenever you want.

---

## 📦 Installation & Setup

1. **Install Prerequisites:**
   - [Node.js](https://nodejs.org/) (v18+ recommended)
   - `yt-dlp` and `ffmpeg` installed on your system / PATH.

2. **Install Dependencies:**
   Open terminal inside the bot folder and run:
   ```bash
   npm install
   ```

3. **Start the Bot:**
   ```bash
   npm start
   ```

4. **Authentication:**
   Scan the QR code displayed in your terminal using WhatsApp > Linked Devices.

---

## 📋 Command List

- `!bot start` / `!bot stop` - Turn bot online or offline
- `!menu` - Display all available commands
- `!ping` - Check bot responsiveness
- `!song <name>` - Download any YouTube song as MP3
- `!muteuser @tag` / `!unmuteuser` - Mute/unmute user messages
- `!mutegroup` / `!unmutegroup` - mute/unmute group chat
- `!links on` / `!links off` - Toggle link spam protection
- `!sticker on` / `!sticker off` - Toggle sticker spam protection
- `!view` - Unlock and forward View Once media to owner
- `!tagall` / `!everyone` - Tag all group members
- `!warn @tag` / `معWarnings` / `!resetwarn` - Manage user warnings
