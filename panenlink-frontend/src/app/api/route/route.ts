import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from"),
    to = req.nextUrl.searchParams.get("to");
  if (!from || !to)
    return NextResponse.json(
      { error: "coordinates required" },
      { status: 400 },
    );
  const url = `https://router.project-osrm.org/route/v1/driving/${from};${to}?overview=full&geometries=geojson&steps=true`;
  const r = await fetch(url, { next: { revalidate: 900 } });
  return NextResponse.json(await r.json(), { status: r.status });
}
