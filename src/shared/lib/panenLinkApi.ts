declare var process: { env: { NEXT_PUBLIC_PANENLINK_API_URL?: string } };
const BASE_URL = process.env.NEXT_PUBLIC_PANENLINK_API_URL ?? "http://localhost:8000";

export type ParsedHarvestMessage = {
    commodity: string | null;
    volume_kg: number | null;
    readiness: string | null;
    location: string | null;
    confidence: number;
};

export type MatchResult = {
    harvest_id: string;
    node_id: number;
    commodity: string;
    volume_kg: number;
    truck_id: string | null;
    status: "MATCHED" | "UNMATCHED";
    additional_distance: number | null;
    pickup_time: number | null;
    transit_time_min: number | null;
    score: number | null;
    route: number[] | null;
    estimated_revenue_idr: number | null;
    savings_pct: number | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`PanenLink API ${path} failed (${res.status}): ${detail}`);
    }
    return res.json() as Promise<T>;
}

export const panenlinkApi = {
    health: () => request<{ status: string; llm_configured: boolean }>("/health"),

    parseMessage: (message: string) =>
        request<ParsedHarvestMessage>("/api/parse-message", {
            method: "POST",
            body: JSON.stringify({ message }),
        }),

    getLoads: () => request<MatchResult[]>("/api/loads"),

    match: (payload: {
        harvests: unknown[];
        truck_routes: Record<string, number[]>;
        distance_matrix: number[][];
        truck_capacity_kg?: number;
        max_detour?: number;
        speed_kmph?: number;
    }) =>
        request<MatchResult[]>("/api/match", {
            method: "POST",
            body: JSON.stringify(payload),
        }),
};