# Multigames overlay - running locally

1. You need Node.js. Either install it, or drop the portable `node.exe` into this folder.
2. Double-click `start.bat` (or run `node server.mjs`). Leave the window open.
3. Open http://localhost:8080/ , click the cog, set things up, and use the link button.
   The link looks like `http://localhost:8080/?token=...` - paste it into an OBS Browser Source.
4. Install the Beat Saber mod you want (BeatSaberPlus, HttpSiraStatus or DataPuller).

## What replaced the original back end
The original needed PHP + MySQL. `server.mjs` replaces it:
- Settings behind the `?token=` links are stored in `data/tokens.json` (created on first save). Back that file up if you care about your links.
- ScoreSaber / BeatLeader lookups are proxied with a 2-minute cache.
- AudioTrip cover art needs the author's song database, so it is not available.

## Known limitations of this branch
- The websocket addresses are hardcoded to 127.0.0.1, so the "IP" setting (streaming from a second PC) has no effect.
- The overlay opens a websocket for every supported game and retries every 5 seconds. Failed connections in the browser console are normal.
- The fonts and BeatSaver cover images load from the internet, so you need to be online for those.

## Changing the code
`js/**/*.js` is already compiled. After editing a `.ts` file run `npx tsc -p tsconfig.json`.
Source: https://github.com/HyldraZolxy/BeatSaber-Overlay (branch MultiGames, commit 9122fcf). Local changes: new `server.mjs`, `start.bat`, `tsconfig.json`, `js/jquery-shim.d.ts`, the share link in `js/modules/setup.ts`, the BeatSaberPlus websocket address in `js/system/websockets/plugins/beatsaber/bsplus.ts` (upstream pointed at the author's own PC, 192.168.1.153, and its handler never drew the song card - it now forwards to the older working parser), and the PHP folder removed.
