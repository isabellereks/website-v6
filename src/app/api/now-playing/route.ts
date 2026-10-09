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
});

async function getAccessToken() {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } = process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) return null;

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: SPOTIFY_REFRESH_TOKEN }),
  });
  if (!res.ok) return null;
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
  if (!recent.ok) return null;
  const data: { items: { track: SpotifyTrack; played_at: string }[] } = await recent.json();
  const last = data.items[0];
  return last ? toNowPlaying(last.track, false, last.played_at, null) : null;
}

export async function GET() {
  await connection();
  const token = await getAccessToken();
  const track = token ? await getNowPlaying(token) : null;
  return Response.json(track, {
    headers: { "Cache-Control": "public, s-maxage=15, stale-while-revalidate=30" },
  });
}
