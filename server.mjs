// Local server for the MultiGames overlay.
// Serves the static files and replaces the original PHP + MySQL back end:
//   /php/token.php            -> settings saved in data/tokens.json
//   /php/scoreSaberProxy.php  -> ScoreSaber player profile (2 min cache)
//   /php/beatLeaderPlayerProxy.php, /php/beatLeaderSongProxy.php -> BeatLeader
//   /php/audioTripProxy.php   -> not available locally (needs the author's song database)
// Usage: node server.mjs [port]     (default 8080)
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || 8080);
const DATA_DIR = path.join(ROOT, "data");
const TOKEN_FILE = path.join(DATA_DIR, "tokens.json");
const CACHE_MS = 2 * 60 * 1000;
const TOKEN_LENGTH = 32;
const TOKEN_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-.~";
const MODULES = ["general", "games", "plugins", "playerCard", "songCard", "leaderboard"];

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".gif": "image/gif", ".svg": "image/svg+xml",
  ".ico": "image/x-icon", ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
};

const json = (res, obj) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(obj)); };

// ---------------------------------------------------------------- settings ("tokens")
let tokens = {};
try { tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")); } catch { /* first run */ }

function persist() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = TOKEN_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(tokens, null, 2));
  fs.renameSync(tmp, TOKEN_FILE);
}

const validToken = (t) => typeof t === "string" && t.length === TOKEN_LENGTH && /^[-~._\w]+$/.test(t);

function newToken() {
  for (;;) {
    let t = "";
    for (const b of crypto.randomBytes(TOKEN_LENGTH)) t += TOKEN_CHARS[b % TOKEN_CHARS.length];
    if (!tokens[t]) return t;
  }
}

// Keep only the six known modules, like the PHP dataConverter did.
function clean(data) {
  const out = {};
  for (const m of MODULES) if (data && typeof data[m] === "object" && data[m] !== null) out[m] = data[m];
  return out;
}

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
function merge(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra)) out[k] = isObj(v) && isObj(out[k]) ? merge(out[k], v) : v;
  return out;
}

function tokenApi(body, res) {
  let input;
  try { input = JSON.parse(body || "{}"); } catch { input = {}; }
  const { token, data } = input;
  const fn = input.function;

  if (!fn) return json(res, { errorMessage: "Function not available or empty" });

  if (fn === "save") {
    if (!data || typeof data !== "object") return json(res, { errorMessage: "Data not available or empty" });
    const t = newToken();
    const stored = clean(data);
    stored.general = { ...(stored.general || {}), token: t };
    tokens[t] = stored;
    persist();
    return json(res, { token: t, successMessage: "Data successfully added in database" });
  }

  if (fn === "search" || fn === "update") {
    if (!token) return json(res, { errorMessage: "Token not available or empty" });
    if (!validToken(token)) return json(res, { errorMessage: "Token format is not good" });
    if (!tokens[token]) return json(res, { errorMessage: "Token not found in database" });

    if (fn === "search") {
      const out = JSON.parse(JSON.stringify(tokens[token]));
      if (out.general) delete out.general.token;
      return json(res, { ...out, successMessage: "Data successfully read in database" });
    }

    if (!data || typeof data !== "object") return json(res, { errorMessage: "Data not available or empty" });
    const merged = merge(tokens[token], clean(data)); // like the PHP: only touch what was sent
    merged.general = { ...(merged.general || {}), token };
    tokens[token] = merged;
    persist();
    return json(res, { successMessage: "Data successfully updated in database" });
  }

  return json(res, { errorMessage: "Function not supported or coded" });
}

// ---------------------------------------------------------------- API proxies
const cache = new Map();

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "MultiGames-Overlay-local" } }, (r) => {
      let body = "";
      r.on("data", (c) => (body += c));
      r.on("end", () => (r.statusCode === 200 ? resolve(body) : reject(new Error("HTTP " + r.statusCode))));
    }).on("error", reject);
  });
}

async function proxy(res, { key, url, ttl, notFound }) {
  res.setHeader("Content-Type", "application/json");
  const hit = key ? cache.get(key) : null;
  if (hit && ttl && Date.now() - hit.time < ttl) return res.end(hit.body);
  try {
    const body = await fetchText(url);
    if (key) cache.set(key, { time: Date.now(), body });
    res.end(body);
  } catch {
    res.end(hit ? hit.body : JSON.stringify({ errorMessage: notFound })); // stale data beats nothing
  }
}

function api(url, req, res, body) {
  const q = url.searchParams;
  switch (url.pathname.replace(/\/+$/, "")) {
    case "/php/token.php":
      return tokenApi(body, res);

    case "/php/scoreSaberProxy.php": {
      const id = q.get("playerID");
      if (!id || id === "0" || !/^\d+$/.test(id)) return json(res, { errorMessage: "Player not found" });
      return proxy(res, { key: "ss_" + id, ttl: CACHE_MS, notFound: "Player not found",
        url: `https://scoresaber.com/api/player/${id}/basic` });
    }

    case "/php/beatLeaderPlayerProxy.php": {
      const id = q.get("playerID");
      if (!id || id === "0" || !/^\d+$/.test(id)) return json(res, { errorMessage: "Player not found" });
      return proxy(res, { key: "bl_" + id, ttl: CACHE_MS, notFound: "Player not found",
        url: `https://api.beatleader.xyz/player/${id}?stats=false` });
    }

    case "/php/beatLeaderSongProxy.php": {
      const hash = q.get("hash");
      if (!hash || !/^[0-9a-zA-Z]+$/.test(hash)) return json(res, { errorMessage: "Song not found" });
      return proxy(res, { key: "bls_" + hash, ttl: CACHE_MS, notFound: "Song not found",
        url: `https://api.beatleader.xyz/map/hash/${hash}` });
    }

    case "/php/audioTripProxy.php":
      return json(res, { errorMessage: "Song not found" });

    default:
      res.statusCode = 404;
      return json(res, { errorMessage: "Unknown endpoint" });
  }
}

// ---------------------------------------------------------------- static files
const HIDDEN = new Set([".git", "node_modules", "data", "php", "server.mjs"]);

function serveStatic(url, res) {
  let rel;
  try { rel = decodeURIComponent(url.pathname); } catch { res.statusCode = 400; return res.end("Bad request"); }
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);
  const relToRoot = path.relative(ROOT, file);
  if (relToRoot.startsWith("..") || path.isAbsolute(relToRoot) || HIDDEN.has(relToRoot.split(path.sep)[0])) {
    res.statusCode = 403; return res.end("Forbidden");
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(data);
  });
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (url.pathname.startsWith("/php/")) {
    let body = "";
    req.on("data", (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on("end", () => api(url, req, res, body));
    return;
  }
  serveStatic(url, res);
}).listen(PORT, "127.0.0.1", () => console.log(`MultiGames overlay running at http://localhost:${PORT}/`));
