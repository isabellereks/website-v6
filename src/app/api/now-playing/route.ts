import { connection } from "next/server";

export interface NowPlaying {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArt: string | null;
  url: string;
  playedAt: string | null;
  progressMs: number | null;
  durationMs: number;
  previewUrl: string | null;
}

interface SpotifyTrack {
  name: string;
  artists: { name: string }[];
  album: { images: { url: string; width: number }[] };
  external_urls: { spotify: string };
  duration_ms: number;
}

const toNowPlaying = (
  track: SpotifyTrack,
  isPlaying: boolean,
  playedAt: string | null,
  progressMs: number | null,
): NowPlaying => ({
  isPlaying,
  title: track.name,
  artist: track.artists.map((a) => a.name).join(", "),
  // Spotify lists images largest first; take a mid size for the expanded island.
  albumArt: track.album.images.at(1)?.url ?? track.album.images[0]?.url ?? null,
  url: track.external_urls.spotify,
  playedAt,
  progressMs,
  durationMs: track.duration_ms,
  previewUrl: null,
});

// Spotify no longer gives previews to new apps, so borrow Apple's 30s preview
// from the free iTunes Search API. Visitors play it in their own browser.
async function findPreview(title: string, artist: string) {
  try {
    const term = `${title.replace(/\(.*?\)/g, "")} ${artist.split(",")[0]}`;
    const res = await fetch(
      `https://itunes.apple.com/search?${new URLSearchParams({ term, entity: "song", limit: "1" })}`,
    );
    if (!res.ok) return null;
    const data: { results: { previewUrl?: string }[] } = await res.json();
    return data.results[0]?.previewUrl ?? null;
  } catch {
    return null;
  }
}

// Why the island is empty, reported in a response header (never includes secrets).
let status = "ok";

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  const missing = Object.entries({ SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN })
    .filter(([, v]) => !v?.trim())
    .map(([k]) => k);
  if (missing.length) {
    status = `missing ${missing.join(", ")}`;
    return null;
  }

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN! }),
  });
  if (!res.ok) {
    const err: { error?: string } = await res.json().catch(() => ({}));
    status = `token refresh failed: ${res.status} ${err.error ?? ""}`.trim();
    return null;
  }
  const data: { access_token: string } = await res.json();
  return data.access_token;
}

async function getNowPlaying(token: string): Promise<NowPlaying | null> {
  const headers = { Authorization: `Bearer ${token}` };

  const current = await fetch("https://api.spotify.com/v1/me/player/currently-playing", { headers });
  if (current.status === 200) {
    const data: { is_playing: boolean; progress_ms: number | null; item: SpotifyTrack | null } = await current.json();
    if (data.is_playing && data.item) return toNowPlaying(data.item, true, null, data.progress_ms);
  }

  const recent = await fetch("https://api.spotify.com/v1/me/player/recently-played?limit=1", { headers });
  if (!recent.ok) {
    status = `recently-played failed: ${recent.status}`;
    return null;
  }
  const data: { items: { track: SpotifyTrack; played_at: string }[] } = await recent.json();
  const last = data.items[0];
  return last ? toNowPlaying(last.track, false, last.played_at, null) : null;
}

export async function GET() {
  await connection();
  status = "ok";
  const token = await getAccessToken();
  const track = token ? await getNowPlaying(token) : null;
  if (track) track.previewUrl = await findPreview(track.title, track.artist);
  return Response.json(track, {
    headers: {
      "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30",
      "X-Now-Playing-Status": status,
    },
  });
}
