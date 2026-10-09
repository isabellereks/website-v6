import { connection } from "next/server";

export interface SocialStats {
  github: { repos: number; followers: number } | null;
  substack: { title: string; url: string; date: string } | null;
}

async function github() {
  try {
    const res = await fetch("https://api.github.com/users/isabellereks", {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) return null;
    const d: { public_repos: number; followers: number } = await res.json();
    return { repos: d.public_repos, followers: d.followers };
  } catch {
    return null;
  }
}

// Latest post from the Substack RSS feed.
async function substack() {
  try {
    const res = await fetch("https://isaishangry.substack.com/feed");
    if (!res.ok) return null;
    const xml = await res.text();
    const item = xml.match(/<item>[\s\S]*?<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<pubDate>([\s\S]*?)<\/pubDate>/);
    if (!item) return null;
    const date = new Date(item[3]).toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return { title: item[1], url: item[2], date };
  } catch {
    return null;
  }
}

// Live bits for the hover widgets on the social links.
export async function GET() {
  await connection();
  const [g, s] = await Promise.all([github(), substack()]);
  const stats: SocialStats = { github: g, substack: s };
  return Response.json(stats, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
