import { connection } from "next/server";

// Current temperature in Seattle, from Open-Meteo (free, no key).
export async function GET() {
  await connection();
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=47.61&longitude=-122.33&current=temperature_2m,weather_code&temperature_unit=fahrenheit",
    );
    if (!res.ok) return Response.json(null);
    const data: { current: { temperature_2m: number; weather_code: number } } = await res.json();
    return Response.json(
      { temperature: Math.round(data.current.temperature_2m), code: data.current.weather_code },
      { headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800" } },
    );
  } catch {
    return Response.json(null);
  }
}
