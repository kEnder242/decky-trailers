# Decky Trailers

Decky Trailers integrates official cinematic game trailers directly into the Steam Deck library interface. 

## Features

* **Cinematic Background Previews**: Automatically plays muted, blurred trailers behind the game artwork to create an immersive browsing experience.
* **Native Action Bar Integration**: Injects a "Watch Trailer" button directly into the game overview page, styled to match the official Steam Deck system UI.
* **Full Controller Support**: Optimized for the Steam Deck's joystick navigation and physical button layout.
* **Integrated Media Player**: Features a dedicated full-screen player that allows you to return to the library view instantly using the B button.
* **Smart Media Sourcing**: Dynamically fetches high-quality movie assets from Steam servers with automatic fallback between WebM and MP4 formats for maximum compatibility.

## Installation

1. Install [Decky Loader](https://github.com/SteamDeckHomebrew/decky-loader) on your Steam Deck.
2. Download the latest `DeckyTrailers.zip` from the releases page.
3. Extract the archive and move the `DeckyTrailers` folder to `~/homebrew/plugins/`.
4. Restart the Steam Deck or the Decky service.

## Usage

Once installed, simply navigate to any game in your library. If an official trailer is available on the Steam Store, the background artwork will begin playing a preview, and the "Watch Trailer" button will appear in the action row next to the Play button.

## Credits and License

* Developer: Jason Allred
* Inspired by: ProtonDB Badges and MoonDeck.
* License: [BSD 3-Clause](LICENSE)

---

Development documentation and technical implementation details are located in the developer/ directory.
