# 🛡️ VIP MASTER BOT - LINKS & STICKER PROTECTION MODULES (`!links` & `!sticker`)

These modules allow the bot owner to grant special access to trusted users so they can manage and toggle group security features (`!links` and `!sticker`) on or off as needed.

---

## 📋 COMMANDS & USAGE GUIDE

### 1️⃣ Access Management Commands (Owner Only)
Only the bot owner can grant, revoke, or view the authorized user list for these commands.

* **Grant Access:**
  > `!links add @User` or `!links add 923xxxxxxxxx`  
  > `!sticker add @User` or `!sticker add 923xxxxxxxxx`  

* **Revoke Single Access:**
  > `!links remove @User` or `!links remove 923xxxxxxxxx`  
  > `!sticker remove @User` or `!sticker remove 923xxxxxxxxx`  

* **Revoke All Access:**
  > `!links remove all`  
  > `!sticker remove all`  
  > *Clears access for all authorized users instantly.*

* **View Access List:**
  > `!links list`  
  > `!sticker list`  
  > *Shows the list of users who have permission to control these protections.*

---

### 2️⃣ Protection Control Commands (Owner or Authorized Users)
Once a user is authorized via the `add` command, they (along with the owner) can toggle the protections on or off.

* **Links Protection Control:**
  > `!links on` — Enables automatic link deletion and warning/kick system.  
  > `!links off` — Disables link protection.

* **Sticker Protection Control:**
  > `!sticker on` — Enables sticker spam limitation (max 10 stickers, then 2-minute cooldown).  
  > `!sticker off` — Disables sticker protection.

---

## 🔒 HOW IT WORKS (WORKFLOW)

1. **Owner Control:** The owner adds a trusted user using `!links add @User` or `!sticker add @User`.
2. **Authorized Actions:** The approved user can now turn the respective protection `on` or `off` in any group without needing owner intervention for every change.
3. **Security:** Regular members cannot modify these settings; unauthorized attempts will be completely ignored by the bot.