// One-time setup: gets a Spotify refresh token and saves it to .env.local.
// Needs SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local first.
// Run with: node scripts/spotify-auth.mjs
import { createServer } from "node:http";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFile } from "node:child_process";

const ENV_FILE = ".env.local";
const PORT = 8888;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPES = "user-read-currently-playing user-read-recently-played";

if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);
const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = process.env;
if (!clientId || !clientSecret) {
  console.error(`Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to ${ENV_FILE} first.`);
  process.exit(1);
}

const authUrl =
  "https://accounts.spotify.com/authorize?" +
  new URLSearchParams({ client_id: clientId, response_type: "code", redirect_uri: REDIRECT_URI, scope: SCOPES });

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/callback") return res.writeHead(404).end();
  const code = url.searchParams.get("code");
  if (!code) return res.writeHead(400).end("Missing code.");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
  });
  const data = await tokenRes.json();
  if (!data.refresh_token) {
    res.writeHead(500).end("Spotify did not return a refresh token. Check the terminal.");
    console.error("Token exchange failed:", data.error_description ?? data.error);
    process.exit(1);
  }

  const env = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, "utf8") : "";
  const line = `SPOTIFY_REFRESH_TOKEN=${data.refresh_token}`;
  const next = /^SPOTIFY_REFRESH_TOKEN=.*$/m.test(env)
    ? env.replace(/^SPOTIFY_REFRESH_TOKEN=.*$/m, line)
    : `${env.trimEnd()}\n${line}\n`;
  writeFileSync(ENV_FILE, next);

  res.writeHead(200, { "Content-Type": "text/plain" }).end("Saved. You can close this tab.");
  console.log(`Saved SPOTIFY_REFRESH_TOKEN to ${ENV_FILE}. Restart the dev server.`);
  server.close();
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("Opening Spotify to approve access...");
  execFile("open", [authUrl]);
});
