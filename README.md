# Beat Saber Overlay - MultiGames (local-run fork)

> **This is a fork of [HyldraZolxy/BeatSaber-Overlay](https://github.com/HyldraZolxy/BeatSaber-Overlay) (branch `MultiGames`), all credit for the overlay goes to Hyldra Zolxy.**
> The original project was archived on 1 March 2026 and its hosted site (`overlay.hyldrazolxy.fr`) no longer works.
> This fork only adds what is needed to run the overlay **entirely on your own PC**. The original README follows below, unchanged.
> The original package metadata lists the licence as ISC; the upstream repository has no LICENSE file.

## What this fork changes
- `server.mjs` + `start.bat`: a small Node.js server that replaces the original PHP/MySQL back end (settings behind `?token=` links are saved in `data/tokens.json`; ScoreSaber/BeatLeader lookups are proxied with a 2-minute cache). See [LOCAL-SETUP.md](LOCAL-SETUP.md).
- `bsplus.ts`: BeatSaberPlus support fixed. Upstream pointed it at the author's own LAN address (`192.168.1.153`) and its handler never updated the song card. It now uses localhost and forwards messages to the older working parser (`js/games/beatSaber/BSPlus.ts`).
- `setup.ts`: the copy-link button now builds a link to your local server instead of the dead hosted site.
- `tsconfig.json` + `js/jquery-shim.d.ts`: compile without installing `@types/jquery`.

Tested with a real game through BeatSaberPlus. HttpSiraStatus and DataPuller were only tested with simulated data.
Known limits: the "IP" setting is ignored (every websocket address is hardcoded to 127.0.0.1), and AudioTrip cover art needs the author's private database.

---

<div id="top"></div>

# Multigames-Overlay (DEV)
### Beat Saber | Audica | AudioTrip | SynthRiders | A Dance of Fire and Ice (Adofai)
<hr />

<div>
   <strong>Beat Saber plugins:</strong>

- **[BeatSaberPlus](https://github.com/hardcpp/BeatSaberPlus)**: BS ver (1.21.0 to 1.40)
- **[HTTPSiraStatus](https://github.com/denpadokei/HttpSiraStatus)**: BS ver (1.12.1 to 1.40)
- **[DataPuller DJDavid98](https://github.com/DJDavid98/BSDataPuller)**: BS ver (1.28.0 to 1.38.0)

Older version of Beat Saber
- **[DataPuller](https://github.com/ReadieFur/BSDataPuller)**: BS ver (1.20.0 to 1.28.0)
- **[HTTPStatus](https://github.com/opl-/beatsaber-http-status/)**: BS ver (0.11.1 to 1.20.0)

</div>

<div>
   <strong>Audica plugin:</strong>

- **[audica-websocket-server](https://github.com/steglasaurous/audica-websocket-server)**

</div>

<div>
   <strong>AudioTrip plugin:</strong>

- **[ats-types](https://github.com/hn3000/ats-types)**: It's not a Plugin, the WebSocket is integrated to the game 👍

</div>

<div>
   <strong>SynthRiders plugin:</strong>

- **[SynthRiders-Websockets-Mod](https://github.com/KK964/SynthRiders-Websockets-Mod)**

</div>

<div>
   <strong>A Dance of Fire and Ice (Adofai) plugin:</strong>

- **[AdofaiWeb](https://github.com/thijnmens/AdofaiWeb)**

</div>
<hr />

# README IS ON REWRITE PROCESS, IF YOU HAVE ANY QUESTION, DM ME ON DISCORD: hyldrazolxy