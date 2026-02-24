# 🚀 Sprint Plan: GridTrailers UI Alignment

## 1. Current Status & Knowns
*   **The Anchor:** We are currently injecting into `appDetailsClasses.InnerContainer`.
*   **The Conflict:** 
    *   `ActionBar` (where the Play button lives) has `overflow: hidden`, making standard injection invisible.
    *   `InnerContainer` is large and scales/shifts depending on game art and docked state, making our `absolute` coordinates (`325px`, `40px`) drift "randomly."
*   **The Tools:**
    *   `tail_logs.js`: Streams CEF `SharedJSContext` logs (Port 8081).
    *   `deploy-nobuild.sh`: Fast scp/restart loop (skips the ~30s build time).
    *   `pnpm run build`: Required for logic changes.

## 2. The "Shotgun" Mapping Strategy
To solve the scaling issue, we will deploy **4 variants** of the button simultaneously. You will act as the "Observer" and tell me which one lands correctly in different modes (Handheld vs. 1080p Docked).

| Variant | Color | Strategy | Goal |
| :--- | :--- | :--- | :--- |
| **A** | Gray (Current) | `absolute (325, 40)` | Baseline check. |
| **B** | Blue | `relative` (In-flow) | See where "Index 2" actually renders in the layout. |
| **C** | Green | `absolute (bottom: 20px, left: 40px)` | Test if bottom-anchoring survives scaling better. |
| **D** | Red | `fixed (top: 20, right: 20)` | Verify visibility/z-index on the screen edge. |

## 3. The "Deep Trace" Diagnostic
During the first deployment, I will include a "DOM Splatter" log. This will:
1.  Recursively crawl the `InnerContainer` children.
2.  Log every `className` and `displayName`.
3.  Identify the **exact** component name of the "Action Bar" (e.g., `PlayButtonContainer` or similar) so we can try to un-hide its overflow or find its parent.

## 4. Operational Requirements (The "Needs")
To start the live sprint, we must clear these blockers:
1.  **Network IP:** Confirm the Deck's current IP (since `.25` timed out).
2.  **SSH Key:** Ensure `id_rsa_wsl` is active.
3.  **Physical Presence:** You need to be at the Deck to navigate between games (which triggers the `routerHook` patch).

---

### 💡 Re-Grounding on our Process:
1.  **Code & Build:** I write the "Shotgun" logic and run `pnpm run build`.
2.  **Deploy:** I run `./deploy-nobuild.sh`.
3.  **The Wait:** We wait ~10 seconds for `plugin_loader` to restart.
4.  **The Trigger:** You navigate away from and back to a game page.
5.  **The Log:** I run `node tail_logs.js` to see the AppID detection and DOM Trace.
6.  **The Verdict:** You tell me: *"I see Red at the top, but Green is invisible."*
