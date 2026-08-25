import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return NextResponse.json([]);
  const headers = {
    "User-Agent": "PanenLink-Demo/1.0 (contact: halo@panenlink.id)",
    "Accept-Language": "id",
  };
  try {
    const url = new URL("https://photon.komoot.io/api/");
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "6");
    const r = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (r.ok) {
      const d = await r.json();
      return NextResponse.json(
        d.features.map((x: any) => ({
          label: [x.properties.name, x.properties.city, x.properties.state]
            .filter(Boolean)
            .join(", "),
          lat: x.geometry.coordinates[1],
          lon: x.geometry.coordinates[0],
        })),
      );
    }
    throw 0;
  } catch {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "6");
    const r = await fetch(url, { headers });
    const d = await r.json();
    return NextResponse.json(
      d.map((x: any) => ({ label: x.display_name, lat: +x.lat, lon: +x.lon })),
    );
  }
}
