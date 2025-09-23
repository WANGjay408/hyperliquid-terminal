// src/lib/api.ts
export async function fetchMarkets() {
    const res = await fetch("https://api.hyperliquid.xyz/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "meta" }),
    });

    if (!res.ok) {
        throw new Error("Failed to fetch markets");
    }

    const data = await res.json();
    // universe 是对象数组，要取 coin 字段
    return data.universe.map((m: { coin: string }) => `${m.coin}-USDT`);
}
