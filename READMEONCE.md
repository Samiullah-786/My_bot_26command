# 👑 VIP MASTER BOT - VIEW ONCE ACCESS MODULE (!once)

This module allows you and your authorized users to secretly unlock and download WhatsApp View Once media (Images, Videos, Audios)[cite: 43, 46]. Each authorized user is mapped to a specific group where the unlocked media is automatically sent[cite: 46].

---

## 📋 COMMANDS & USAGE GUIDE

### 1️⃣ Access Management Commands (Owner Only)
Only the bot owner can grant or remove user access using these commands[cite: 43, 46].

* **Grant Access:**
  > `!once add @User`  
  > *Or using the direct phone number:*  
  > `!once add 923xxxxxxxxx`  
  > *Note: The group where you run this command will be linked to that user[cite: 46].*

* **Revoke Single Access:**
  > `!once remove @User`  
  > *Or via number:*  
  > `!once remove 923xxxxxxxxx`[cite: 46]

* **Revoke All Access:**
  > `!once remove all`  
  > *This command clears access for all users on the list instantly[cite: 48].*

* **View Access List:**
  > `!once list`  
  > *This checks which users currently have access and which groups are linked to them[cite: 43, 46].*

---

### 2️⃣ View Once Unlock Triggers (Secret Keywords)
Once authorized, an eligible user or the owner can reply to any View Once message with the following trigger words to unlock it[cite: 43, 46]:

* `thanks`[cite: 43, 46]
* `hahaha`[cite: 43, 46]
* `nice`[cite: 43, 46]
* `osm`[cite: 43, 46]
* `good`[cite: 43, 46]

<!-- once command to view pic, video and voice
            'thanks',
            'hahaha',
            'nice',
            'osm',
            'good',
            'great',
            'amazing',
            'wow',
            'cool',
            'so funny',
            'lol',
            'masha allah',
            'mashallah',
            'wah',
            'wah wah' 
-->

---

## 🔒 HOW IT WORKS (WORKFLOW)

1. **Owner Configuration:** The owner runs `!once add @User` inside a group to map that user to that specific group[cite: 46].
2. **Triggering Media:** The authorized user replies to a View Once media anywhere with a keyword (`thanks`, `hahaha`, `nice`, `osm`, or `good`), and the bot downloads it in the background[cite: 43, 46].
3. **Secret Delivery:** 
   * The media is sent **only to the assigned group** where the owner granted access[cite: 43, 46].
   * A copy is also forwarded to the **Owner's personal DM** as a backup[cite: 43, 46].
   * If an unauthorized user attempts this or uses it incorrectly, the bot stays **100% silent** with no errors or chat warnings[cite: 43, 46].