// Local server for BeatSaber-Overlay: serves the static files and replaces the old
// PHP ScoreSaber proxy (/php/scoreSaberProxy.php) with a cached Node version.
// Usage: node server.mjs [port]     (default 8080)
import http from "node:http";
import https from "node:https";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.argv[2] || 8080);
const CACHE_MS = 2 * 60 * 1000;
const NOT_FOUND = JSON.stringify({ errorMessage: "Player not found" });
const cache = new Map();

const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".eot": "application/vnd.ms-fontobject",
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "BeatSaber-Overlay-local" } }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => (res.statusCode === 200 ? resolve(body) : reject(new Error("HTTP " + res.statusCode))));
    }).on("error", reject);
  });
}

async function scoreSaber(req, res) {
  const id = new URL(req.url, "http://x").searchParams.get("playerId");
  res.setHeader("Content-Type", "application/json");
  if (!id || id === "0" || !/^\d+$/.test(id)) return res.end(NOT_FOUND);

  const hit = cache.get(id);
  if (hit && Date.now() - hit.time < CACHE_MS) return res.end(hit.body);
  try {
    const body = await fetchJson(`https://scoresaber.com/api/player/${id}/basic`);
    cache.set(id, { time: Date.now(), body });
    res.end(body);
  } catch {
    res.end(hit ? hit.body : NOT_FOUND); // fall back to stale data if ScoreSaber is down
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname.startsWith("/php/scoreSaberProxy.php")) return scoreSaber(req, res);

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(ROOT, rel);
  const hidden = /(^|[\\/])(\.git|node_modules|server\.mjs|php)([\\/]|$)/.test(path.relative(ROOT, file));
  const outside = path.relative(ROOT, file);
  if (outside.startsWith("..") || path.isAbsolute(outside) || hidden) { res.statusCode = 403; return res.end("Forbidden"); }

  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end("Not found"); }
    res.setHeader("Content-Type", TYPES[path.extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => console.log(`Overlay running at http://localhost:${PORT}/`));
