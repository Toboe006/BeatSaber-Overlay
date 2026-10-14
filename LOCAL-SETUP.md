# Running the overlay locally

1. Install Node.js (https://nodejs.org, version 18 or newer), or drop a portable `node.exe` into this folder.
2. Double-click `start.bat` (Windows) or run `node server.mjs`. Leave the window open.
3. Open http://localhost:8080/ in a browser, click the cog, set things up, and copy the link.
4. In OBS add a Browser Source and paste that link (width/height = your canvas, e.g. 1920x1080).

Beat Saber needs one of these mods installed: BeatSaberPlus, HttpSiraStatus or DataPuller.
The overlay connects to it over a websocket on the same PC (ports 2947 / 6557 / 2946).
If Beat Saber runs on another PC, put that PC's IP in the "IP" setting.

`js/*.js` is already compiled. To change the source, edit `js/*.ts` and run `npx tsc -p tsconfig.json`.
The old PHP proxy is replaced by `server.mjs` (same 2-minute ScoreSaber cache).
