# Decky Trailers 🎬

Inject cinematic game trailers directly into your Steam Deck game details page.

## 🚀 The Triple Crown Milestone (v0.1.34)
We have successfully achieved our core feature set:
1.  **Cinematic Backgrounds:** Trailers play automatically (muted/blurred) behind the game artwork.
2.  **Native UI Integration:** A "Watch Trailer" button sits naturally on the hero art, perfectly navigable via joystick.
3.  **In-Place Player:** A full-screen video player that respects the B-button to return you exactly where you were.

---

## 🎓 The Decky Masterclass: A Development Journal

This project evolved through a series of "invisible" challenges that define modern SteamUI development. Here is the journal of our breakthroughs:

### 1. The Invisible Wall (Layout Clipping)
Early attempts to inject buttons into the `ActionBar` (the row with the Play button) failed because many Steam containers use `overflow: hidden`. Even if a button was "absolute" positioned, it was clipped and invisible.
*   **The Breakthrough:** Targeting `appDetailsClasses.InnerContainer`. This container is large enough to host the entire artwork area, allowing us to place UI elements anywhere on the screen without clipping.

### 2. The Ghost Log (Cache Delays)
We spent hours debugging code that *should* have worked, only to realize the CEF Debugger was serving cached versions of the logs and the JavaScript.
*   **The Breakthrough:** Implementing **Manual Build Timestamps**. Every version now logs its build time (e.g., `[12:15 AM]`), allowing the developer to verify they are looking at "Live" code.

### 3. The Restart Lag (GUI Reloads)
Restarting the `plugin_loader.service` finishes in milliseconds, but the Steam Deck GUI takes several seconds to re-patch the React tree.
*   **The Breakthrough:** Adding a mandatory `sleep 10` to the deployment script. This eliminated "No button" false negatives caused by checking the UI too early.

### 4. The Portal Orphan (React Lifecycle)
Using `createPortal(..., document.body)` initially seemed logical for an overlay, but Steam's aggressive re-renders would often "orphan" the portal, causing the video player to fail.
*   **The Breakthrough:** The **No-Portal Strategy**. Rendering the player directly within our component's local tree ensured it shared the same lifecycle as the button, making it 100% reliable.

### 5. Navigation Priority (Joystick Flow)
When injecting elements, they often landed at the end of the focus chain, requiring the user to navigate through every other button to reach the trailer.
*   **The Breakthrough:** Using `unshift` instead of `push` on the children array. This injects our button at the start of the row, giving it immediate joystick priority.

---

## 🛠 Developer Setup

### Dependencies
*   Node.js v16.14+
*   `pnpm` (v9 recommended)

### Build & Deploy
1.  `pnpm i` - Install dependencies.
2.  `pnpm run build` - Compile the frontend.
3.  `./deploy-nobuild.sh` - Transfer to Steam Deck and restart service.

### Debugging
Run `pnpm run logs` (or `node tail_logs.js`) to stream live console output from the Deck via WebSocket. Look for the `👉 Triple Crown` prefix to verify features.

---

## 📜 Credits & License
*   **Built by:** Jason Allred & Gemini (The AI Masterclass project).
*   **Inspired by:** ProtonDB Badges & MoonDeck.
*   **License:** MIT

---
*Reference example for using decky-frontend-lib (@decky/ui) in a decky-loader plugin.*